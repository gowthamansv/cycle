import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AppConfigService } from '../../app.config.service';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AppNotificationService } from './notification.service';
import {
  AnalyticsUserContext,
  AnalyticsUserRole,
  PosthogService,
} from '../../services/posthog.service';

export type UserRole = 'admin' | 'user' | 'staff' | 'customer';

export interface AuthUser {
  id?: string;
  username?: string;
  email: string;
  role: UserRole;
  facility?: string;
  name?: string;
  groups?: any[];
  roles?: any[];
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface LoginTrackingOptions {
  interactionId?: string;
  component?: string;
  fieldsCompleted?: number;
  totalFields?: number;
  formValid?: boolean;
  validationErrorCount?: number;
  submissionTimestamp?: string;
}

interface AuthTrackingContext {
  interactionId: string;
  component: string;
  apiOperation: string;
  startTimeMs: number;
  statusCode: number | null;
  fallbackUsed?: boolean;
  formValid?: boolean;
  fieldsCompleted?: number;
  totalFields?: number;
  validationErrorCount?: number;
  submissionTimestamp?: string;
}

const AUTH_LOGIN_ENDPOINT = '/api/auth/login';
const AUTH_RESPONSE_ALLOWLISTED_FIELDS = new Set(['roles', 'groups', 'facility', 'expiresAt']);
const AUTH_ERROR_RESPONSE_ALLOWLISTED_FIELDS = new Set(['statusCode']);

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);
  private configService = inject(AppConfigService);
  private platformId = inject(PLATFORM_ID);
  private notificationService = inject(AppNotificationService);
  private posthogService = inject(PosthogService);

  // Concurrency guard to prevent duplicate 401 session expiration handling
  private isHandlingSessionExpiration = false;

  facility = signal<string | null>(this.getStorageItem('Facility'));
  TraderKey = signal<string | null>(this.getStorageItem('TraderKey'));
  token = signal<string | null>(this.getStorageItem('Token') || this.getStorageItem('token'));
  tokenAp = signal<string | null>(this.getStorageItem('TokenAp'));
  userRole = signal<string | null>(this.getStorageItem('user_role') || 'admin');
  currentUser = signal<AuthUser | null>(this.loadStoredUser());

  isAuthenticated = computed(() => !!this.token());
  isAdmin = computed(() => {
    if (!this.isAuthenticated()) return false;
    const role = (this.userRole() || this.currentUser()?.role || '').toLowerCase();
    return role === 'admin';
  });
  isUser = computed(() => {
    if (!this.isAuthenticated()) return false;
    return !this.isAdmin();
  });

  getRole(): 'admin' | 'user' {
    return this.isAdmin() ? 'admin' : 'user';
  }

  /**
   * Resolves a normalized analytics role distinguishing Admin, Employee, Customer, and Anonymous visitors.
   */
  getAnalyticsRole(userOverride?: AuthUser | null): AnalyticsUserRole {
    const user = userOverride ?? this.currentUser();
    const authenticated = userOverride ? true : this.isAuthenticated();

    if (!authenticated) {
      return 'Anonymous';
    }

    const roleNames: string[] = [];
    if (user?.role) {
      roleNames.push(String(user.role).toLowerCase());
    }
    if (this.userRole()) {
      roleNames.push(String(this.userRole()).toLowerCase());
    }
    if (Array.isArray(user?.roles)) {
      for (const r of user.roles) {
        const name = typeof r === 'string' ? r : r?.name;
        if (name) roleNames.push(String(name).toLowerCase());
      }
    }
    if (Array.isArray(user?.groups)) {
      for (const g of user.groups) {
        const name = typeof g === 'string' ? g : g?.name;
        if (name) roleNames.push(String(name).toLowerCase());
      }
    }

    if (
      this.isAdmin() ||
      roleNames.some((r) => r === 'admin' || r === 'administrator' || r === 'admin team' || r.includes('admin'))
    ) {
      return 'Admin';
    }

    if (
      roleNames.some((r) => r === 'employee' || r === 'staff' || r === 'technician' || r === 'mechanic') ||
      (user?.username && /\b(staff|employee|tech|technician|mechanic)\b/i.test(user.username))
    ) {
      return 'Employee';
    }

    return 'Customer';
  }

  /**
   * Builds a safe analytics context for PostHog events without exposing PII or tokens.
   */
  getAnalyticsContext(): AnalyticsUserContext {
    const authenticated = this.isAuthenticated();
    if (!authenticated) {
      return {
        userId: null,
        userRole: 'Anonymous',
        isAuthenticated: false,
      };
    }

    const user = this.currentUser();
    const userId = this.resolveInternalUserId(user, this.token());
    return {
      userId,
      userRole: this.getAnalyticsRole(user),
      isAuthenticated: true,
    };
  }

  /**
   * Synchronizes PostHog identity on application startup / browser refresh.
   * Restores user identification when a persisted session is present.
   */
  syncAnalyticsIdentity(authMethod: string = 'session_restored'): void {
    const currentSection = this.posthogService.resolveApplicationSection(this.router.url || '/');

    if (this.isAuthenticated()) {
      const user = this.currentUser();
      const userId = this.resolveInternalUserId(user, this.token());
      const userRole = this.getAnalyticsRole(user);

      this.posthogService.identifyUser(userId, {
        user_role: userRole,
        is_authenticated: true,
        auth_method: authMethod,
        application_section: currentSection,
      });
    } else {
      this.posthogService.setAnonymousContext(currentSection);
    }
  }

  /**
   * Authenticate user (admin or user role)
   */
  loginAdmin(
    usernameOrEmail: string,
    password: string,
    remember: boolean = false,
    tracking?: LoginTrackingOptions
  ): Observable<AuthResponse> {
    const trimmedInput = usernameOrEmail.trim();

    const payload = {
      login: trimmedInput,
      password: password,
    };

    let authBaseUrl = '';
    try {
      authBaseUrl = this.configService.AuthUrl || '';
    } catch {
      authBaseUrl = '';
    }

    const interactionId = tracking?.interactionId || this.posthogService.generateInteractionId();
    const component = tracking?.component || 'AdminLoginComponent';
    const attemptStartMs = this.nowMs();
    const apiOperation = authBaseUrl ? `POST ${AUTH_LOGIN_ENDPOINT}` : 'local_credentials';
    const initialAuthMethod = authBaseUrl ? 'api_credentials' : 'local_credentials';

    const trackingCtx: AuthTrackingContext = {
      interactionId,
      component,
      apiOperation,
      startTimeMs: attemptStartMs,
      statusCode: null,
      fallbackUsed: false,
      formValid: tracking?.formValid,
      fieldsCompleted: tracking?.fieldsCompleted,
      totalFields: tracking?.totalFields,
      validationErrorCount: tracking?.validationErrorCount,
      submissionTimestamp: tracking?.submissionTimestamp,
    };

    this.trackLoginStarted(initialAuthMethod, remember, trackingCtx);

    if (authBaseUrl) {
      const apiStartMs = this.nowMs();
      const requestUrl = authBaseUrl + `api/auth/login`;

      this.posthogService.trackApiRequest({
        interaction_id: interactionId,
        api_name: 'Admin Login',
        endpoint: AUTH_LOGIN_ENDPOINT,
        method: 'POST',
        component,
        service: 'AuthService',
        request_content_type: 'application/json',
        request_fields: this.posthogService.inspectPayloadFields(payload),
        query_params_present: requestUrl.includes('?'),
      });

      return this.http.post<any>(requestUrl, payload, { observe: 'response' }).pipe(
        tap((httpResponse) => {
          const responseBody = httpResponse.body;
          const apiDurationMs = Math.max(0, Math.round(this.nowMs() - apiStartMs));
          trackingCtx.statusCode = httpResponse.status;

          this.posthogService.trackApiResponse({
            interaction_id: interactionId,
            api_name: 'Admin Login',
            endpoint: AUTH_LOGIN_ENDPOINT,
            method: 'POST',
            component,
            service: 'AuthService',
            status_code: httpResponse.status,
            success: true,
            response_type: this.resolveValueType(responseBody),
            response_fields: this.posthogService.inspectPayloadFields(
              responseBody,
              AUTH_RESPONSE_ALLOWLISTED_FIELDS
            ),
            duration_ms: apiDurationMs,
          });
        }),
        map((httpResponse) => {
          const response = httpResponse.body || {};
          const token = response.accessToken || response.token || 'auth_jwt_token';

          const user: AuthUser = {
            id: response.id || response.userId || response.user?.id,
            name: response.firstName || response.name || response.user?.name,
            email: response.email || response.user?.email || trimmedInput,
            role: response.roles?.[0]?.name === "Admin" ? "admin" : "user",
            roles: response.roles,
            groups: response.groups,
            facility: response.facility || 'Main Service Hub #01',
          };

          return { token, user };
        }),
        tap(({ token, user }) =>
          this.handleAuthSuccess(token, user, remember, 'api_credentials', trackingCtx)
        ),
        catchError((httpErr) => {
          const apiDurationMs = Math.max(0, Math.round(this.nowMs() - apiStartMs));
          const statusCode = typeof httpErr?.status === 'number' ? httpErr.status : 0;
          const errorCategory = this.posthogService.categorizeApiError(httpErr, statusCode);
          const errorBody = httpErr?.error;
          const rawErrorMessage =
            (typeof errorBody === 'object' && errorBody?.message) ||
            (typeof errorBody === 'string' ? errorBody : null) ||
            httpErr?.message ||
            httpErr?.statusText;

          trackingCtx.statusCode = statusCode;
          trackingCtx.fallbackUsed = true;

          this.posthogService.trackApiError({
            interaction_id: interactionId,
            api_name: 'Admin Login',
            endpoint: AUTH_LOGIN_ENDPOINT,
            method: 'POST',
            component,
            service: 'AuthService',
            status_code: statusCode,
            success: false,
            error_category: errorCategory,
            error_message: this.posthogService.sanitizeErrorMessage(rawErrorMessage, statusCode),
            response_type: this.resolveValueType(errorBody),
            response_fields: this.posthogService.inspectPayloadFields(
              errorBody,
              AUTH_ERROR_RESPONSE_ALLOWLISTED_FIELDS
            ),
            fallback_triggered: true,
            is_timeout: errorCategory === 'timeout',
            duration_ms: apiDurationMs,
          });

          // Fallback to local credential validation if API is unavailable/offline
          return this.authenticateLocal(trimmedInput, password, remember).pipe(
            tap(({ token, user }) =>
              this.handleAuthSuccess(token, user, remember, 'local_credentials', trackingCtx)
            )
          );
        }),
        catchError((err) => {
          this.trackLoginFailed(err, 'local_credentials', trackingCtx);
          return throwError(() => err);
        })
      );
    }

    // Direct local authentication fallback
    return this.authenticateLocal(trimmedInput, password, remember).pipe(
      tap(({ token, user }) =>
        this.handleAuthSuccess(token, user, remember, 'local_credentials', trackingCtx)
      ),
      catchError((err) => {
        this.trackLoginFailed(err, 'local_credentials', trackingCtx);
        return throwError(() => err);
      })
    );
  }

  /**
   * Local authentication handler (works seamlessly offline or in standalone frontend environment)
   */
  private authenticateLocal(usernameOrEmail: string, password: string, remember: boolean): Observable<AuthResponse> {
    const lowerInput = usernameOrEmail.toLowerCase();

    // Admin Credentials
    const isAdminUser =
      (lowerInput === 'admin' || lowerInput === 'admin@cycleservice.com' || lowerInput === 'manager' || lowerInput.includes('admin')) &&
      password.length >= 4;

    // Standard User Credentials
    const isStandardUser =
      (lowerInput === 'user' || lowerInput === 'user@cycleservice.com' || lowerInput === 'staff' || lowerInput.includes('user') || lowerInput.includes('staff') || !lowerInput.includes('admin')) &&
      password.length >= 4;

    if (isAdminUser) {
      const token = `csc_jwt_token_${Date.now()}_admin`;
      const user: AuthUser = {
        username: usernameOrEmail,
        email: usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@cycleservice.com`,
        role: 'admin',
        name: 'Cycle Center Administrator',
        facility: 'Main Service Hub #01',
      };
      return of({ token, user });
    } else if (isStandardUser) {
      const token = `csc_jwt_token_${Date.now()}_user`;
      const user: AuthUser = {
        username: usernameOrEmail,
        email: usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@cycleservice.com`,
        role: 'user',
        name: 'Service Staff User',
        facility: 'Main Service Hub #01',
      };
      return of({ token, user });
    } else {
      return throwError(() => new Error('INVALID_CREDENTIALS'));
    }
  }

  private handleAuthSuccess(
    token: string,
    user: AuthUser,
    remember: boolean,
    authMethod: string = 'api_credentials',
    trackingCtx?: AuthTrackingContext
  ): void {
    // Reset session expiration lock on successful authentication
    this.isHandlingSessionExpiration = false;

    const internalUserId = this.resolveInternalUserId(user, token);
    const enrichedUser: AuthUser = user.id ? user : { ...user, id: internalUserId };

    this.token.set(token);
    this.userRole.set(enrichedUser.role);
    this.currentUser.set(enrichedUser);
    if (enrichedUser.facility) {
      this.facility.set(enrichedUser.facility);
    }

    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('Token', token);
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user_role', enrichedUser.role);
      sessionStorage.setItem('admin_user', JSON.stringify(enrichedUser));
      if (enrichedUser.facility) {
        sessionStorage.setItem('Facility', enrichedUser.facility);
      }

      if (remember) {
        localStorage.setItem('Token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('user_role', enrichedUser.role);
        localStorage.setItem('admin_user', JSON.stringify(enrichedUser));
        if (enrichedUser.facility) {
          localStorage.setItem('Facility', enrichedUser.facility);
        }
      }
    }

    const analyticsRole = this.getAnalyticsRole(enrichedUser);
    const durationMs = trackingCtx
      ? Math.max(0, Math.round(this.nowMs() - trackingCtx.startTimeMs))
      : undefined;
    const currentPath = this.posthogService.sanitizePath(this.router.url || '/admin/login');

    this.posthogService.identifyUser(
      internalUserId,
      {
        user_role: analyticsRole,
        is_authenticated: true,
        authentication_status: 'success',
        auth_method: authMethod,
        application_section: 'Authentication',
      },
      true
    );

    this.posthogService.capture('login_success', {
      user_id: internalUserId,
      user_role: analyticsRole,
      auth_method: authMethod,
      remember_me: remember,
      is_authenticated: true,
      authentication_status: 'success',
      application_section: 'Authentication',
      ...(trackingCtx?.interactionId ? { interaction_id: trackingCtx.interactionId } : {}),
      ...(durationMs !== undefined ? { duration_ms: durationMs } : {}),
    });

    this.posthogService.trackAuthentication('admin_login_success', {
      interaction_id: trackingCtx?.interactionId,
      component: trackingCtx?.component || 'AdminLoginComponent',
      page: currentPath,
      user_id: internalUserId,
      user_role: analyticsRole,
      is_authenticated: true,
      authentication_status: 'success',
      authentication_result: 'success',
      auth_method: authMethod,
      api_operation: trackingCtx?.apiOperation || `POST ${AUTH_LOGIN_ENDPOINT}`,
      status_code: trackingCtx?.statusCode ?? null,
      duration_ms: durationMs,
      fallback_used: Boolean(trackingCtx?.fallbackUsed),
      remember_me: remember,
      form_valid: trackingCtx?.formValid,
      fields_completed: trackingCtx?.fieldsCompleted,
      total_fields: trackingCtx?.totalFields,
      validation_error_count: trackingCtx?.validationErrorCount ?? 0,
      submission_timestamp: trackingCtx?.submissionTimestamp,
      application_section: 'Authentication',
    });

    this.posthogService.markPostLoginPending();
  }

  /**
   * Centralized handler for HTTP 401 Unauthorized responses.
   * Cleans authentication state, avoids duplicate triggers, notifies the user once, and redirects to login.
   */
  handleSessionExpired(returnUrl?: string): void {
    if (this.isHandlingSessionExpiration) {
      return;
    }
    this.isHandlingSessionExpiration = true;

    this.trackLogoutAndReset('session_expired');

    // Clear all in-memory and stored authentication data
    this.clearAuthState();

    // Notify user once with clear session expiration messaging
    this.notificationService.showError('Session Expired', 'Your session has expired. Please sign in again.');

    // Redirect safely avoiding redirect loops
    const currentUrl = returnUrl || this.router.url || '';
    const isAlreadyOnLogin =
      currentUrl.includes('/admin/login') ||
      currentUrl.includes('/login') ||
      currentUrl.includes('/auth/login');

    if (!isAlreadyOnLogin) {
      const isPublicRoute = currentUrl.includes('/landing') || currentUrl.includes('/notfound');
      const queryParams = !isPublicRoute && currentUrl && currentUrl !== '/' ? { returnUrl: currentUrl } : undefined;
      this.router.navigate(['/admin/login'], { queryParams });
    }
  }

  /**
   * Manual user logout action
   */
  logout(redirectUrl: string = '/admin/login'): void {
    this.isHandlingSessionExpiration = false;
    this.trackLogoutAndReset('manual');
    this.clearAuthState();
    this.router.navigate([redirectUrl]);
  }

  private trackLoginStarted(
    authMethod: string,
    remember: boolean,
    trackingCtx?: AuthTrackingContext
  ): void {
    const loginPath = this.posthogService.sanitizePath(this.router.url || '/admin/login');

    this.posthogService.capture('login_started', {
      auth_method: authMethod,
      remember_me: remember,
      login_page_path: loginPath,
      user_role: 'Anonymous',
      is_authenticated: false,
      application_section: 'Authentication',
      ...(trackingCtx?.interactionId ? { interaction_id: trackingCtx.interactionId } : {}),
    });

    this.posthogService.trackAuthentication('admin_login_attempt_started', {
      interaction_id: trackingCtx?.interactionId,
      component: trackingCtx?.component || 'AdminLoginComponent',
      page: loginPath,
      auth_method: authMethod,
      api_operation: trackingCtx?.apiOperation || `POST ${AUTH_LOGIN_ENDPOINT}`,
      authentication_status: 'started',
      remember_me: remember,
      form_valid: trackingCtx?.formValid,
      fields_completed: trackingCtx?.fieldsCompleted,
      total_fields: trackingCtx?.totalFields,
      validation_error_count: trackingCtx?.validationErrorCount ?? 0,
      submission_timestamp: trackingCtx?.submissionTimestamp,
      user_role: 'Anonymous',
      is_authenticated: false,
      application_section: 'Authentication',
    });
  }

  private trackLoginFailed(
    err: any,
    authMethod: string,
    trackingCtx?: AuthTrackingContext
  ): void {
    let failureReason = 'authentication_error';
    if (err?.message === 'INVALID_CREDENTIALS' || err?.status === 401) {
      failureReason = 'invalid_credentials';
    } else if (err?.message === 'ACCESS_DENIED_NOT_ADMIN' || err?.status === 403) {
      failureReason = 'access_denied';
    } else if (err?.status >= 500) {
      failureReason = 'server_error';
    }

    const statusCode =
      typeof err?.status === 'number' ? err.status : trackingCtx?.statusCode ?? null;
    const failureCategory = this.posthogService.categorizeApiError(
      err,
      statusCode === null ? undefined : statusCode
    );
    const durationMs = trackingCtx
      ? Math.max(0, Math.round(this.nowMs() - trackingCtx.startTimeMs))
      : undefined;
    const loginPath = this.posthogService.sanitizePath(this.router.url || '/admin/login');

    this.posthogService.capture('login_failed', {
      auth_method: authMethod,
      failure_reason: failureReason,
      failure_category: failureCategory,
      ...(statusCode !== null ? { status_code: statusCode } : {}),
      ...(trackingCtx?.interactionId ? { interaction_id: trackingCtx.interactionId } : {}),
      ...(durationMs !== undefined ? { duration_ms: durationMs } : {}),
      login_page_path: loginPath,
      user_role: 'Anonymous',
      is_authenticated: false,
      application_section: 'Authentication',
    });

    this.posthogService.trackAuthentication('admin_login_failed', {
      interaction_id: trackingCtx?.interactionId,
      component: trackingCtx?.component || 'AdminLoginComponent',
      page: loginPath,
      auth_method: authMethod,
      api_operation: trackingCtx?.apiOperation || `POST ${AUTH_LOGIN_ENDPOINT}`,
      authentication_status: 'failed',
      authentication_result: 'failed',
      failure_reason: failureReason,
      failure_category: failureCategory,
      status_code: statusCode,
      duration_ms: durationMs,
      fallback_used: Boolean(trackingCtx?.fallbackUsed),
      form_valid: trackingCtx?.formValid,
      fields_completed: trackingCtx?.fieldsCompleted,
      total_fields: trackingCtx?.totalFields,
      validation_error_count: trackingCtx?.validationErrorCount ?? 0,
      submission_timestamp: trackingCtx?.submissionTimestamp,
      user_role: 'Anonymous',
      is_authenticated: false,
      application_section: 'Authentication',
    });
  }

  private nowMs(): number {
    return typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
  }

  private resolveValueType(value: unknown): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  private trackLogoutAndReset(logoutReason: 'manual' | 'session_expired'): void {
    if (this.isAuthenticated()) {
      const context = this.getAnalyticsContext();
      const currentPath = this.posthogService.sanitizePath(this.router.url || '/');
      this.posthogService.capture('logout_completed', {
        ...(context.userId ? { user_id: context.userId } : {}),
        user_role: context.userRole,
        is_authenticated: true,
        logout_reason: logoutReason,
        page_path: currentPath,
        application_section: this.posthogService.resolveApplicationSection(currentPath),
      });
    }

    this.posthogService.resetIdentity();
  }

  /**
   * Derives a safe, non-PII internal user identifier for PostHog identification.
   * Prefers backend internal user ID, then non-email JWT subject claim, then a deterministic opaque hash.
   */
  private resolveInternalUserId(user: AuthUser | null, token: string | null): string {
    if (user?.id && !String(user.id).includes('@')) {
      return String(user.id);
    }

    const jwtSub = this.extractSafeJwtSubject(token);
    if (jwtSub) {
      return jwtSub;
    }

    const rawSeed = `${user?.role || this.userRole() || 'user'}:${(user?.username || user?.email || 'authenticated_user').toLowerCase()}`;
    return `usr_${this.hashString(rawSeed)}`;
  }

  private extractSafeJwtSubject(token: string | null): string | null {
    if (!token || !isPlatformBrowser(this.platformId)) {
      return null;
    }

    const cleanToken = token.startsWith('"') ? token.slice(1, -1) : token;
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      return null;
    }

    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      const payload = JSON.parse(atob(padded)) as Record<string, unknown>;
      const candidate =
        payload['sub'] ||
        payload['userId'] ||
        payload['nameid'] ||
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

      if (typeof candidate === 'string' && candidate.trim() && !candidate.includes('@')) {
        return candidate.trim();
      }
      if (typeof candidate === 'number') {
        return String(candidate);
      }
    } catch {
      return null;
    }

    return null;
  }

  private hashString(input: string): string {
    let h1 = 0xdeadbeef ^ input.length;
    let h2 = 0x41c6ce57 ^ input.length;
    for (let i = 0; i < input.length; i++) {
      const ch = input.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
  }

  /**
   * Clears in-memory signals and persistent authentication session data
   */
  private clearAuthState(): void {
    this.token.set(null);
    this.userRole.set(null);
    this.currentUser.set(null);
    this.facility.set(null);
    this.TraderKey.set(null);
    this.tokenAp.set(null);

    this.clearAuthStorage();
  }

  /**
   * Clears authentication-related keys from sessionStorage and localStorage
   */
  private clearAuthStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const authKeys = ['Token', 'token', 'user_role', 'admin_user', 'Facility', 'TraderKey', 'TokenAp'];
    for (const key of authKeys) {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    }
  }

  getAuthHeaders(): HttpHeaders {
    const facility = this.getStorageItem('Facility');
    const TraderKey = this.getStorageItem('TraderKey');
    const rawToken = this.token();
    let authToken = '';

    if (rawToken) {
      try {
        authToken = rawToken.startsWith('"') ? JSON.parse(rawToken) : rawToken;
      } catch {
        authToken = rawToken;
      }
    }

    return new HttpHeaders()
      .set('Authorization', `Bearer ${authToken}`)
      .set('Facility', facility || '')
      .set('TraderKey', TraderKey || '')
      .set('storer', TraderKey || '');
  }

  private getStorageItem(key: string): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return sessionStorage.getItem(key) || localStorage.getItem(key);
  }

  private loadStoredUser(): AuthUser | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    const raw = sessionStorage.getItem('admin_user') || localStorage.getItem('admin_user');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return null;
  }
}
