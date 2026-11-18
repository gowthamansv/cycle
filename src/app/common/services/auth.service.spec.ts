import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { AppConfigService } from '../../app.config.service';
import { AppNotificationService } from './notification.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { PosthogService } from '../../services/posthog.service';

describe('AuthService & PostHog Auth Analytics', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockRouter: any;
  let posthogMock: {
    capture: ReturnType<typeof vi.fn>;
    identify: ReturnType<typeof vi.fn>;
    identifyUser: ReturnType<typeof vi.fn>;
    setAnonymousContext: ReturnType<typeof vi.fn>;
    registerSuperProperties: ReturnType<typeof vi.fn>;
    reset: ReturnType<typeof vi.fn>;
    resetIdentity: ReturnType<typeof vi.fn>;
    markPostLoginPending: ReturnType<typeof vi.fn>;
    sanitizePath: ReturnType<typeof vi.fn>;
    resolveApplicationSection: ReturnType<typeof vi.fn>;
    generateInteractionId: ReturnType<typeof vi.fn>;
    inspectPayloadFields: ReturnType<typeof vi.fn>;
    categorizeApiError: ReturnType<typeof vi.fn>;
    sanitizeErrorMessage: ReturnType<typeof vi.fn>;
    trackApiRequest: ReturnType<typeof vi.fn>;
    trackApiResponse: ReturnType<typeof vi.fn>;
    trackApiError: ReturnType<typeof vi.fn>;
    trackAuthentication: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockRouter = {
      navigate: vi.fn(),
      navigateByUrl: vi.fn(),
      url: '/admin/login',
    };

    posthogMock = {
      capture: vi.fn(),
      identify: vi.fn(),
      identifyUser: vi.fn(),
      setAnonymousContext: vi.fn(),
      registerSuperProperties: vi.fn(),
      reset: vi.fn(),
      resetIdentity: vi.fn(),
      markPostLoginPending: vi.fn(),
      sanitizePath: vi.fn((url: string) => url.split('?')[0] || '/'),
      resolveApplicationSection: vi.fn(() => 'Authentication'),
      generateInteractionId: vi.fn(() => 'corr-id-001'),
      inspectPayloadFields: vi.fn((payload: any, allowlist?: ReadonlySet<string>) => {
        if (!payload || typeof payload !== 'object') return [];
        return Object.keys(payload).map((key) => {
          const val = payload[key];
          const isSensitive = /(password|token|login|email|firstName)/i.test(key);
          const meta: any = {
            name: key,
            type: Array.isArray(val) ? 'array' : typeof val,
            present: val !== undefined && val !== null && val !== '',
            value_logged: false,
          };
          if (!isSensitive && allowlist?.has(key) && val !== undefined) {
            meta.value_logged = true;
            meta.safe_value = Array.isArray(val)
              ? val.map((x: any) => (typeof x === 'string' ? x : x?.name)).filter(Boolean)
              : val;
          }
          return meta;
        });
      }),
      categorizeApiError: vi.fn((err: any, statusCode?: number) => {
        if (err?.name === 'TimeoutError' || statusCode === 408 || statusCode === 504) return 'timeout';
        if (err?.message === 'INVALID_CREDENTIALS' || statusCode === 401) return 'authentication_failed';
        if (err?.message === 'ACCESS_DENIED_NOT_ADMIN' || statusCode === 403) return 'authorization_denied';
        if (statusCode === 0) return 'network_error';
        if (statusCode && statusCode >= 500) return 'server_error';
        return 'unknown_error';
      }),
      sanitizeErrorMessage: vi.fn((msg: unknown, statusCode?: number) =>
        typeof msg === 'string' && msg ? msg : `HTTP ${statusCode ?? 0} error`
      ),
      trackApiRequest: vi.fn(),
      trackApiResponse: vi.fn(),
      trackApiError: vi.fn(),
      trackAuthentication: vi.fn(),
    };

    sessionStorage.clear();
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        AppConfigService,
        AppNotificationService,
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter },
        { provide: PosthogService, useValue: posthogMock },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should authenticate admin locally, identify user safely, and track login_started & login_success without PII or tokens', () => {
    let result: any = null;

    service.loginAdmin('admin', 'admin123').subscribe({
      next: (res) => {
        result = res;
      },
    });

    expect(posthogMock.capture).toHaveBeenCalledWith(
      'login_started',
      expect.objectContaining({
        auth_method: 'api_credentials',
        remember_me: false,
        user_role: 'Anonymous',
        is_authenticated: false,
      })
    );

    // Remote login API fails; falls back to local auth
    const req = httpMock.expectOne((r) => r.url.includes('api/auth/login'));
    req.error(new ProgressEvent('Network error'));

    expect(result).toBeTruthy();
    expect(result.token).toContain('csc_jwt_token_');
    expect(result.user.role).toBe('admin');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.isAdmin()).toBe(true);

    expect(posthogMock.identifyUser).toHaveBeenCalledWith(
      expect.stringMatching(/^usr_[0-9a-f]+$/),
      expect.objectContaining({
        user_role: 'Admin',
        is_authenticated: true,
        auth_method: 'local_credentials',
      }),
      true
    );

    const loginSuccessCall = posthogMock.capture.mock.calls.find(
      ([eventName]) => eventName === 'login_success'
    );
    expect(loginSuccessCall).toBeTruthy();
    const serialized = JSON.stringify(loginSuccessCall?.[1]);
    expect(serialized).not.toContain('admin123');
    expect(serialized).not.toContain('csc_jwt_token_');
    expect(serialized).not.toContain('admin@cycleservice.com');
    expect(posthogMock.markPostLoginPending).toHaveBeenCalledTimes(1);
  });

  it('should authenticate standard user locally and classify Customer vs Employee roles accurately', () => {
    let result: any = null;

    service.loginAdmin('user', 'user123').subscribe({
      next: (res) => {
        result = res;
      },
    });

    const req = httpMock.expectOne((r) => r.url.includes('api/auth/login'));
    req.error(new ProgressEvent('Network error'));

    expect(result).toBeTruthy();
    expect(result.token).toContain('csc_jwt_token_');
    expect(result.user.role).toBe('user');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.isAdmin()).toBe(false);
    expect(service.getAnalyticsRole()).toBe('Customer');

    expect(posthogMock.identifyUser).toHaveBeenCalledWith(
      expect.stringMatching(/^usr_[0-9a-f]+$/),
      expect.objectContaining({
        user_role: 'Customer',
        is_authenticated: true,
      }),
      true
    );
  });

  it('should identify API-authenticated Employee user with backend internal user ID', () => {
    service.loginAdmin('mechanic@cycleservice.com', 'secret123', true).subscribe();

    const req = httpMock.expectOne((r) => r.url.includes('api/auth/login'));
    req.flush({
      id: 'emp-guid-42',
      accessToken: 'jwt.payload.sig',
      email: 'mechanic@cycleservice.com',
      firstName: 'Alex',
      roles: [{ name: 'Employee' }],
      groups: [],
    });

    expect(posthogMock.identifyUser).toHaveBeenCalledWith(
      'emp-guid-42',
      expect.objectContaining({
        user_role: 'Employee',
        is_authenticated: true,
        auth_method: 'api_credentials',
      }),
      true
    );

    expect(posthogMock.capture).toHaveBeenCalledWith(
      'login_success',
      expect.objectContaining({
        user_id: 'emp-guid-42',
        user_role: 'Employee',
        auth_method: 'api_credentials',
        remember_me: true,
        is_authenticated: true,
      })
    );
  });

  it('should reject invalid credentials and track login_failed without sending credentials', () => {
    let errorResult: any = null;

    service.loginAdmin('wronguser', '12').subscribe({
      next: () => {},
      error: (err) => {
        errorResult = err;
      },
    });

    const req = httpMock.expectOne((r) => r.url.includes('api/auth/login'));
    req.error(new ProgressEvent('Network error'));

    expect(errorResult).toBeTruthy();
    expect(errorResult.message).toBe('INVALID_CREDENTIALS');

    const failedCall = posthogMock.capture.mock.calls.find(
      ([eventName]) => eventName === 'login_failed'
    );
    expect(failedCall).toBeTruthy();
    expect(failedCall?.[1]).toEqual(
      expect.objectContaining({
        failure_reason: 'invalid_credentials',
        user_role: 'Anonymous',
        is_authenticated: false,
      })
    );
    expect(JSON.stringify(failedCall?.[1])).not.toContain('wronguser');
    expect(JSON.stringify(failedCall?.[1])).not.toContain('12');
    expect(posthogMock.identifyUser).not.toHaveBeenCalled();
  });

  it('should properly attach Authorization header in getAuthHeaders', () => {
    service.token.set('test-jwt-token-123');

    const headers = service.getAuthHeaders();
    expect(headers.get('Authorization')).toBe('Bearer test-jwt-token-123');
  });

  it('should capture logout_completed before resetting PostHog identity and clearing state', () => {
    service.token.set('active-token');
    service.userRole.set('customer');
    service.currentUser.set({
      id: 'cust-77',
      email: 'customer@example.com',
      role: 'customer',
    });
    mockRouter.url = '/services?token=secret';

    const callOrder: string[] = [];
    posthogMock.capture.mockImplementation((name: string) => callOrder.push(`capture:${name}`));
    posthogMock.resetIdentity.mockImplementation(() => callOrder.push('resetIdentity'));

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.token()).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/login']);
    expect(posthogMock.capture).toHaveBeenCalledWith(
      'logout_completed',
      expect.objectContaining({
        user_id: 'cust-77',
        user_role: 'Customer',
        is_authenticated: true,
        logout_reason: 'manual',
        page_path: '/services',
      })
    );
    expect(callOrder).toEqual(['capture:logout_completed', 'resetIdentity']);
  });

  it('should capture logout_completed with session_expired reason and reset identity on 401 session expiration', () => {
    service.token.set('expired-token');
    service.userRole.set('admin');
    service.currentUser.set({
      id: 'adm-1',
      email: 'admin@example.com',
      role: 'admin',
    });
    mockRouter.url = '/dashboard';

    service.handleSessionExpired();

    expect(posthogMock.capture).toHaveBeenCalledWith(
      'logout_completed',
      expect.objectContaining({
        user_id: 'adm-1',
        user_role: 'Admin',
        logout_reason: 'session_expired',
      })
    );
    expect(posthogMock.resetIdentity).toHaveBeenCalledTimes(1);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should correlate api_request_started, api_response_received, and admin_login_success with same interaction_id and zero sensitive values', () => {
    service.loginAdmin('admin@cycleservice.com', 'SuperSecret#99', false, {
      interactionId: 'req-corr-999',
      component: 'AdminLoginComponent',
      fieldsCompleted: 2,
      totalFields: 2,
      formValid: true,
      validationErrorCount: 0,
    }).subscribe();

    expect(posthogMock.trackAuthentication).toHaveBeenCalledWith(
      'admin_login_attempt_started',
      expect.objectContaining({
        interaction_id: 'req-corr-999',
        component: 'AdminLoginComponent',
        api_operation: 'POST /api/auth/login',
      })
    );

    expect(posthogMock.trackApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        interaction_id: 'req-corr-999',
        api_name: 'Admin Login',
        endpoint: '/api/auth/login',
        method: 'POST',
        component: 'AdminLoginComponent',
        service: 'AuthService',
        request_content_type: 'application/json',
      })
    );

    const apiReqPayload = JSON.stringify(posthogMock.trackApiRequest.mock.calls[0][0]);
    expect(apiReqPayload).not.toContain('SuperSecret#99');
    expect(apiReqPayload).not.toContain('admin@cycleservice.com');

    const req = httpMock.expectOne((r) => r.url.includes('api/auth/login'));
    req.flush({
      userId: 'admin-guid-1',
      accessToken: 'eyJhbGciOiJIUzI1NiJ9.payload.sig',
      expiresAt: '2026-12-01T00:00:00Z',
      firstName: 'Admin',
      email: 'admin@cycleservice.com',
      roles: [{ id: 'r1', name: 'Admin' }],
      groups: [{ id: 'g1', name: 'Admin Team' }],
    });

    expect(posthogMock.trackApiResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        interaction_id: 'req-corr-999',
        api_name: 'Admin Login',
        endpoint: '/api/auth/login',
        method: 'POST',
        status_code: 200,
        success: true,
        response_type: 'object',
        duration_ms: expect.any(Number),
      })
    );

    const apiRespPayload = JSON.stringify(posthogMock.trackApiResponse.mock.calls[0][0]);
    expect(apiRespPayload).not.toContain('eyJhbGciOiJIUzI1NiJ9');
    expect(apiRespPayload).not.toContain('admin@cycleservice.com');

    expect(posthogMock.identifyUser).toHaveBeenCalledWith(
      'admin-guid-1',
      expect.objectContaining({
        user_role: 'Admin',
        authentication_status: 'success',
        is_authenticated: true,
      }),
      true
    );

    expect(posthogMock.trackAuthentication).toHaveBeenCalledWith(
      'admin_login_success',
      expect.objectContaining({
        interaction_id: 'req-corr-999',
        user_role: 'Admin',
        authentication_result: 'success',
        status_code: 200,
        duration_ms: expect.any(Number),
      })
    );
  });

  it('should track api_request_failed and admin_login_failed with correlated interaction_id on API error + invalid local credentials', () => {
    let errCaught: any;
    service.loginAdmin('baduser', '12', false, { interactionId: 'req-fail-401' }).subscribe({
      error: (err) => (errCaught = err),
    });

    const req = httpMock.expectOne((r) => r.url.includes('api/auth/login'));
    req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

    expect(errCaught).toBeTruthy();
    expect(posthogMock.trackApiError).toHaveBeenCalledWith(
      expect.objectContaining({
        interaction_id: 'req-fail-401',
        status_code: 401,
        success: false,
        error_category: 'authentication_failed',
        fallback_triggered: true,
        duration_ms: expect.any(Number),
      })
    );
    expect(posthogMock.trackAuthentication).toHaveBeenCalledWith(
      'admin_login_failed',
      expect.objectContaining({
        interaction_id: 'req-fail-401',
        authentication_result: 'failed',
        status_code: 401,
        failure_category: 'authentication_failed',
        duration_ms: expect.any(Number),
      })
    );
  });
});
