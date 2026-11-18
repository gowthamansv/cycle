import { inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import posthog from 'posthog-js';
import { environment } from '../../environments/environment';

export type AnalyticsUserRole = 'Admin' | 'Employee' | 'Customer' | 'Anonymous';

export type MenuClickEventName =
    | 'navigation_menu_clicked'
    | 'sidebar_menu_clicked'
    | 'navbar_link_clicked'
    | 'dashboard_menu_clicked';

export interface AnalyticsUserContext {
    userId?: string | null;
    userRole: AnalyticsUserRole;
    isAuthenticated: boolean;
    authMethod?: string;
}

export interface IdentifyUserProperties {
    user_role: AnalyticsUserRole;
    is_authenticated: boolean;
    authentication_status?: string;
    auth_method?: string;
    application_section?: string;
}

export type FieldInteractionEventName =
    | 'admin_login_field_focused'
    | 'admin_login_field_blurred'
    | 'admin_login_field_changed'
    | 'admin_login_field_typing'
    | 'admin_login_field_cleared'
    | 'admin_login_field_validation_failed'
    | 'admin_login_field_validation_passed';

export type AuthTrackingEventName =
    | 'admin_login_attempt_started'
    | 'admin_login_success'
    | 'admin_login_failed'
    | 'login_started'
    | 'login_success'
    | 'login_failed'
    | 'logout_completed';

export type ApiErrorCategory =
    | 'timeout'
    | 'network_error'
    | 'authentication_failed'
    | 'authorization_denied'
    | 'validation_error'
    | 'rate_limited'
    | 'client_error'
    | 'server_error'
    | 'unknown_error';

export interface InteractionEventProperties {
    component?: string;
    page?: string;
    page_name?: string;
    page_path?: string;
    user_role?: AnalyticsUserRole;
    is_authenticated?: boolean;
    authentication_status?: 'authenticated' | 'unauthenticated' | 'success' | 'failed';
    timestamp?: string;
    session_id?: string | null;
    [key: string]: unknown;
}

export interface ButtonClickEventProperties {
    button_name: string;
    button_text: string;
    button_type: 'submit' | 'button' | 'toggle' | 'action' | 'link';
    component: string;
    page: string;
    page_name?: string;
    form_valid: boolean;
    form_dirty?: boolean;
    form_touched?: boolean;
    button_enabled: boolean;
    is_loading?: boolean;
    timestamp?: string;
    session_id?: string | null;
    [key: string]: unknown;
}

export interface FieldInteractionEventProperties {
    field_name: string;
    field_type: string;
    input_type: string;
    component: string;
    page?: string;
    action: string;
    value_type: string;
    value_length: number;
    is_empty: boolean;
    is_valid: boolean;
    is_sensitive?: boolean;
    validation_errors?: string[];
    input_format?: string;
    typing_burst_events?: number;
    safe_value?: string | number | boolean;
    timestamp?: string;
    session_id?: string | null;
    [key: string]: unknown;
}

export interface ApiFieldMetadata {
    name: string;
    type: string;
    present: boolean;
    value_logged: boolean;
    safe_value?: string | number | boolean | string[];
}

export interface ApiRequestEventProperties {
    interaction_id: string;
    api_name: string;
    endpoint: string;
    method: string;
    component: string;
    service: string;
    request_content_type: string;
    request_fields: ApiFieldMetadata[];
    query_params_present?: boolean;
    timestamp?: string;
    session_id?: string | null;
}

export interface ApiResponseEventProperties {
    interaction_id: string;
    api_name: string;
    endpoint: string;
    method: string;
    component: string;
    service: string;
    status_code: number;
    success: boolean;
    response_type: string;
    response_fields: ApiFieldMetadata[];
    duration_ms: number;
    timestamp?: string;
    session_id?: string | null;
}

export interface ApiErrorEventProperties {
    interaction_id: string;
    api_name: string;
    endpoint: string;
    method: string;
    component: string;
    service: string;
    status_code: number;
    success: false;
    error_category: ApiErrorCategory;
    error_message: string;
    response_type?: string;
    response_fields?: ApiFieldMetadata[];
    fallback_triggered?: boolean;
    is_timeout?: boolean;
    duration_ms: number;
    timestamp?: string;
    session_id?: string | null;
}

export interface AuthenticationEventProperties {
    interaction_id?: string;
    component?: string;
    page?: string;
    user_id?: string;
    user_role?: AnalyticsUserRole;
    is_authenticated?: boolean;
    authentication_status?: 'success' | 'failed' | 'started';
    authentication_result?: 'success' | 'failed';
    auth_method?: string;
    api_operation?: string;
    status_code?: number | null;
    duration_ms?: number;
    failure_category?: string;
    failure_reason?: string;
    remember_me?: boolean;
    form_valid?: boolean;
    fields_completed?: number;
    total_fields?: number;
    validation_error_count?: number;
    fallback_used?: boolean;
    submission_timestamp?: string;
    timestamp?: string;
    session_id?: string | null;
    [key: string]: unknown;
}

export interface PageViewedProperties {
    page_name: string;
    page_path: string;
    previous_page: string | null;
    user_id?: string;
    user_role: AnalyticsUserRole;
    is_authenticated: boolean;
    application_section: string;
    is_initial_page_load: boolean;
    is_post_login_landing: boolean;
    is_revisit: boolean;
    visit_count_in_session: number;
    navigation_step: number;
    navigation_source?: string;
}

export interface MenuClickParams {
    menuName: string;
    menuLocation: string;
    destination: string;
    menuCategory?: string;
    menuVariant?: string;
}

export interface MenuClickProperties {
    menu_name: string;
    menu_location: string;
    destination: string;
    user_role: AnalyticsUserRole;
    is_authenticated: boolean;
    application_section: string;
    user_id?: string;
    menu_category?: string;
    menu_variant?: string;
}

interface RouteMetadata {
    pageName: string;
    section: string;
}

const ROUTE_METADATA_MAP: Record<string, RouteMetadata> = {
    '/': { pageName: 'Dashboard', section: 'Dashboard' },
    '/dashboard': { pageName: 'Dashboard', section: 'Dashboard' },
    '/admin': { pageName: 'Admin Workspace', section: 'Dashboard' },
    '/admin/login': { pageName: 'Admin Login', section: 'Authentication' },
    '/auth/login': { pageName: 'Login', section: 'Authentication' },
    '/login': { pageName: 'Customer Login', section: 'Authentication' },
    '/auth/access': { pageName: 'Access Denied', section: 'Authentication' },
    '/auth/error': { pageName: 'System Error', section: 'System' },
    '/landing': { pageName: 'Landing', section: 'Public' },
    '/services': { pageName: 'Services', section: 'Services' },
    '/services/new': { pageName: 'Create Service Ticket', section: 'Services' },
    '/services/create': { pageName: 'Create Service Ticket', section: 'Services' },
    '/services/:id/edit': { pageName: 'Edit Service Ticket', section: 'Services' },
    '/services/edit/:id': { pageName: 'Edit Service Ticket', section: 'Services' },
    '/appointments': { pageName: 'Appointments', section: 'Appointments' },
    '/appointments/new': { pageName: 'New Appointment', section: 'Appointments' },
    '/customers': { pageName: 'Customers', section: 'Fleet & CRM' },
    '/customers/:id': { pageName: 'Customer Profile', section: 'Fleet & CRM' },
    '/bicycles': { pageName: 'Bicycle Fleet', section: 'Fleet & CRM' },
    '/bicycles/:id': { pageName: 'Bicycle Profile', section: 'Fleet & CRM' },
    '/technicians': { pageName: 'Technicians', section: 'Fleet & CRM' },
    '/technicians/:id': { pageName: 'Technician Profile', section: 'Fleet & CRM' },
    '/settings': { pageName: 'Settings', section: 'Settings' },
    '/payments': { pageName: 'Payments', section: 'Operations' },
    '/inventory': { pageName: 'Inventory', section: 'Operations' },
    '/reports': { pageName: 'Reports', section: 'Reports' },
    '/documentation': { pageName: 'Documentation', section: 'Admin Tools' },
    '/crud': { pageName: 'CRUD', section: 'Admin Tools' },
    '/pages/crud': { pageName: 'CRUD', section: 'Admin Tools' },
    '/empty': { pageName: 'Empty', section: 'Admin Tools' },
    '/pages/empty': { pageName: 'Empty', section: 'Admin Tools' },
    '/notfound': { pageName: 'Not Found', section: 'System' },
    '/pages/notfound': { pageName: 'Not Found', section: 'System' },
};

const AUTH_PATHS = new Set(['/admin/login', '/auth/login', '/login', '/auth/access', '/auth/error']);

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NUMERIC_ID_PATTERN = /^\d+$/;
const LONG_HEX_ID_PATTERN = /^[0-9a-f]{16,}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s\-()]{7,}$/;
const SENSITIVE_FIELD_NAME_PATTERN =
    /(password|passwd|pwd|secret|token|authorization|cookie|api[_-]?key|otp|pin|credential|login|username|email|first[_-]?name|last[_-]?name|full[_-]?name|phone|mobile|ssn|address)/i;
const INLINE_EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/;
const INLINE_JWT_PATTERN = /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g;
const INLINE_BEARER_PATTERN = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;

@Injectable({
    providedIn: 'root'
})
export class PosthogService {
    private platformId = inject(PLATFORM_ID);
    private initialized = false;
    private routeTrackingSubscription: Subscription | null = null;

    private identifiedUserId: string | null = null;
    private identifiedUserRole: AnalyticsUserRole | null = null;

    private lastTrackedPath: string | null = null;
    private navigationStep = 0;
    private visitedPathCounts = new Map<string, number>();
    private pendingPostLoginLanding = false;

    private lastMenuClick: {
        eventName: MenuClickEventName;
        menuName: string;
        menuLocation: string;
        destination: string;
        timestamp: number;
    } | null = null;

    constructor(private ngZone: NgZone) {
        this.initializePostHog();
    }

    private initializePostHog(): void {
        if (this.initialized || !isPlatformBrowser(this.platformId)) {
            return;
        }

        const apiKey = environment.posthogKey?.trim() || '';
        const isDev = !environment.production;

        if (!apiKey) {
            if (isDev) {
                console.error('[PostHog Debug] Initialization skipped: environment.posthogKey is empty.');
            }
            return;
        }

        if (isDev && (apiKey === 'YOUR_PROJECT_API_KEY' || !apiKey.startsWith('phc_'))) {
            console.error(
                '[PostHog Debug] Invalid or placeholder PostHog project API key detected in src/environments/environment.ts:',
                JSON.stringify(apiKey),
                '— Replace posthogKey with your real PostHog project token (starts with "phc_"). Requests with a placeholder key will be rejected by PostHog ingestion.'
            );
        }

        this.ngZone.runOutsideAngular(() => {
            try {
                posthog.init(apiKey, {
                    api_host: environment.posthogHost,
                    debug: isDev,
                    defaults: '2026-08-30',
                    // Prevent defaults >= 2026-01-30 from automatically tagging localhost as an internal/test user
                    // and hiding dev events behind PostHog's default internal-user dashboard filter.
                    internal_or_test_user_hostname: isDev ? null : undefined,

                    capture_pageview: 'history_change',
                    capture_pageleave: true,

                    autocapture: true,

                    session_recording: {
                        maskAllInputs: true
                    },

                    on_request_error: (failedRequest) => {
                        if (isDev) {
                            console.error('[PostHog Debug] Ingestion request failed:', {
                                statusCode: failedRequest.statusCode,
                                text: failedRequest.text,
                            });
                        }
                    },

                    loaded: (ph) => {
                        if (isDev) {
                            const optedOut =
                                typeof ph?.has_opted_out_capturing === 'function'
                                    ? ph.has_opted_out_capturing()
                                    : false;
                            const distinctId =
                                typeof ph?.get_distinct_id === 'function' ? ph.get_distinct_id() : 'unknown';

                            console.info('[PostHog Debug] SDK initialized', {
                                apiHost: environment.posthogHost,
                                keyPrefix: apiKey.slice(0, 8),
                                isPlaceholderKey: apiKey === 'YOUR_PROJECT_API_KEY' || !apiKey.startsWith('phc_'),
                                distinctId,
                                optedOut,
                            });

                            // TEMPORARY TEST EVENT — remove these lines after verifying live delivery in PostHog
                            posthog.capture('localhost_posthog_test', {
                                source: 'angular_localhost',
                                environment: 'development',
                            });
                            console.info('[PostHog Debug] Temporary test event captured: localhost_posthog_test');
                        }
                    }
                });
                this.initialized = true;
            } catch (err) {
                this.initialized = false;
                if (isDev) {
                    console.error('[PostHog Debug] posthog.init() failed:', err);
                }
            }
        });
    }

    // Track custom events
    capture(eventName: string, properties?: Record<string, unknown>): void {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        this.ngZone.runOutsideAngular(() => {
            try {
                if (!environment.production) {
                    console.debug('[PostHog Debug] capture:', eventName, properties);
                }
                posthog.capture(eventName, properties);
            } catch (err) {
                if (!environment.production) {
                    console.warn('[PostHog Debug] capture failed:', eventName, err);
                }
            }
        });
    }

    // Identify logged-in users
    identify(userId: string, properties?: Record<string, unknown>): void {
        if (!isPlatformBrowser(this.platformId) || !userId) {
            return;
        }

        this.ngZone.runOutsideAngular(() => {
            try {
                if (!environment.production) {
                    console.debug('[PostHog Debug] identify:', userId, properties);
                }
                posthog.identify(userId, properties);
            } catch (err) {
                if (!environment.production) {
                    console.warn('[PostHog Debug] identify failed:', err);
                }
            }
        });
    }

    // Register super properties attached to subsequent events
    registerSuperProperties(properties: Record<string, unknown>): void {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        this.ngZone.runOutsideAngular(() => {
            try {
                posthog.register(properties);
            } catch {
                // Never allow analytics errors to interrupt application flows
            }
        });
    }

    // Reset identity on logout
    reset(): void {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        this.ngZone.runOutsideAngular(() => {
            try {
                if (!environment.production) {
                    console.debug('[PostHog Debug] reset identity');
                }
                posthog.reset();
            } catch (err) {
                if (!environment.production) {
                    console.warn('[PostHog Debug] reset failed:', err);
                }
            }
        });
    }

    /**
     * Identifies an authenticated user with safe non-PII properties and registers
     * role-based super properties. Deduplicates identical repeat identifications.
     */
    identifyUser(userId: string, properties: IdentifyUserProperties, force: boolean = false): void {
        if (!userId) {
            return;
        }

        const safeProps: Record<string, unknown> = {
            user_role: properties.user_role,
            is_authenticated: properties.is_authenticated,
        };

        if (properties.authentication_status) {
            safeProps['authentication_status'] = properties.authentication_status;
        }

        if (properties.auth_method) {
            safeProps['auth_method'] = properties.auth_method;
        }

        if (properties.application_section) {
            safeProps['application_section'] = properties.application_section;
        }

        if (force || this.identifiedUserId !== userId || this.identifiedUserRole !== properties.user_role) {
            this.identify(userId, safeProps);
            this.identifiedUserId = userId;
            this.identifiedUserRole = properties.user_role;
        }

        this.registerSuperProperties({
            user_role: properties.user_role,
            is_authenticated: properties.is_authenticated,
            ...(properties.application_section ? { application_section: properties.application_section } : {}),
        });
    }

    /**
     * Registers anonymous visitor super properties when unauthenticated.
     */
    setAnonymousContext(applicationSection?: string): void {
        this.identifiedUserId = null;
        this.identifiedUserRole = null;
        this.registerSuperProperties({
            user_role: 'Anonymous',
            is_authenticated: false,
            ...(applicationSection ? { application_section: applicationSection } : {}),
        });
    }

    /**
     * Marks the next non-authentication route visit as the immediate post-login landing page.
     */
    markPostLoginPending(): void {
        this.pendingPostLoginLanding = true;
    }

    /**
     * Resets PostHog user identity and session navigation state on logout so the
     * next user on the same browser starts with a fresh anonymous session.
     */
    resetIdentity(): void {
        this.identifiedUserId = null;
        this.identifiedUserRole = null;
        this.lastTrackedPath = null;
        this.navigationStep = 0;
        this.visitedPathCounts.clear();
        this.pendingPostLoginLanding = false;
        this.lastMenuClick = null;

        this.reset();
        this.registerSuperProperties({
            user_role: 'Anonymous',
            is_authenticated: false,
        });
    }

    /**
     * Starts centralized Angular Router NavigationEnd tracking once per app lifecycle.
     * Tracks initial page load, lazy-loaded routes, and avoids duplicate page views.
     */
    startRouteTracking(router: Router, getUserContext: () => AnalyticsUserContext): void {
        if (this.routeTrackingSubscription) {
            return;
        }

        this.routeTrackingSubscription = router.events
            .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
            .subscribe((event) => {
                this.trackPageView(event.urlAfterRedirects || event.url, router, getUserContext());
            });

        // If initial navigation already completed before subscription, capture the initial route once.
        if (router.navigated && router.url) {
            this.trackPageView(router.url, router, getUserContext());
        }
    }

    /**
     * Tracks a sanitized page_viewed event for successful navigations, deduplicating
     * consecutive identical paths.
     */
    trackPageView(rawUrl: string, router: Router, context: AnalyticsUserContext): void {
        const cleanPath = this.sanitizePath(rawUrl);

        if (!cleanPath || cleanPath === this.lastTrackedPath) {
            return;
        }

        const previousPage = this.lastTrackedPath;
        const isInitialLoad = this.navigationStep === 0;
        const previousVisitCount = this.visitedPathCounts.get(cleanPath) ?? 0;
        const visitCount = previousVisitCount + 1;
        const isRevisit = previousVisitCount > 0;

        this.navigationStep += 1;
        this.visitedPathCounts.set(cleanPath, visitCount);
        this.lastTrackedPath = cleanPath;

        const isPostLoginLanding =
            this.pendingPostLoginLanding && context.isAuthenticated && !AUTH_PATHS.has(cleanPath);
        if (isPostLoginLanding) {
            this.pendingPostLoginLanding = false;
        }

        const metadata = this.resolveRouteMetadata(cleanPath, router);
        const navigationSource = this.consumeMatchingMenuSource(cleanPath);

        const properties: PageViewedProperties = {
            page_name: metadata.pageName,
            page_path: cleanPath,
            previous_page: previousPage,
            user_role: context.userRole,
            is_authenticated: context.isAuthenticated,
            application_section: metadata.section,
            is_initial_page_load: isInitialLoad,
            is_post_login_landing: isPostLoginLanding,
            is_revisit: isRevisit,
            visit_count_in_session: visitCount,
            navigation_step: this.navigationStep,
        };

        if (context.isAuthenticated && context.userId) {
            properties.user_id = context.userId;
        }

        if (navigationSource) {
            properties.navigation_source = navigationSource;
        }

        this.registerSuperProperties({
            user_role: context.userRole,
            is_authenticated: context.isAuthenticated,
            application_section: metadata.section,
        });

        this.capture('page_viewed', properties as unknown as Record<string, unknown>);
    }

    /**
     * Tracks meaningful menu and navigation link clicks with deduplication against
     * accidental double-firing, and correlates the click with the resulting NavigationEnd.
     */
    trackMenuClick(
        eventName: MenuClickEventName,
        params: MenuClickParams,
        context: AnalyticsUserContext
    ): void {
        const cleanDestination = this.sanitizePath(params.destination);
        const now = Date.now();

        // Prevent accidental duplicate menu click events within 250ms
        if (
            this.lastMenuClick &&
            this.lastMenuClick.eventName === eventName &&
            this.lastMenuClick.menuName === params.menuName &&
            this.lastMenuClick.destination === cleanDestination &&
            now - this.lastMenuClick.timestamp < 250
        ) {
            return;
        }

        this.lastMenuClick = {
            eventName,
            menuName: params.menuName,
            menuLocation: params.menuLocation,
            destination: cleanDestination,
            timestamp: now,
        };

        const targetSection = this.resolveApplicationSection(cleanDestination);
        const properties: MenuClickProperties = {
            menu_name: params.menuName,
            menu_location: params.menuLocation,
            destination: cleanDestination,
            user_role: context.userRole,
            is_authenticated: context.isAuthenticated,
            application_section: targetSection,
        };

        if (context.isAuthenticated && context.userId) {
            properties.user_id = context.userId;
        }

        if (params.menuCategory) {
            properties.menu_category = params.menuCategory;
        }

        if (params.menuVariant) {
            properties.menu_variant = params.menuVariant;
        }

        this.capture(eventName, properties as unknown as Record<string, unknown>);
    }

    /**
     * Safely retrieves the active PostHog browser session ID without throwing or
     * triggering Angular change detection.
     */
    getSessionId(): string | null {
        if (!isPlatformBrowser(this.platformId)) {
            return null;
        }

        return this.ngZone.runOutsideAngular(() => {
            try {
                if (typeof posthog?.get_session_id === 'function') {
                    const sessionId = posthog.get_session_id();
                    return typeof sessionId === 'string' && sessionId.trim() ? sessionId : null;
                }
            } catch {
                // Never allow analytics errors to interrupt application flows
            }
            return null;
        });
    }

    /**
     * Generates a unique correlation ID to tie API requests, responses, errors,
     * and authentication outcomes together in PostHog.
     */
    generateInteractionId(): string {
        try {
            if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
                return crypto.randomUUID();
            }
        } catch {
            // Fallback below
        }
        return `int_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    }

    /**
     * Tracks generic page or UI interactions with consistent timestamp and session metadata.
     */
    trackInteraction(eventName: string, properties: InteractionEventProperties): void {
        const sanitizedProps: Record<string, unknown> = {
            ...properties,
            timestamp: properties.timestamp || new Date().toISOString(),
        };

        if (typeof properties.page === 'string') {
            sanitizedProps['page'] = this.sanitizePath(properties.page);
        }
        if (typeof properties.page_path === 'string') {
            sanitizedProps['page_path'] = this.sanitizePath(properties.page_path);
        }

        const sessionId = properties.session_id !== undefined ? properties.session_id : this.getSessionId();
        if (sessionId) {
            sanitizedProps['session_id'] = sessionId;
        }

        this.capture(eventName, sanitizedProps);
    }

    /**
     * Tracks button clicks with consistent metadata and form state context.
     */
    trackButtonClick(eventName: string, properties: ButtonClickEventProperties): void {
        const payload: Record<string, unknown> = {
            ...properties,
            page: this.sanitizePath(properties.page),
            timestamp: properties.timestamp || new Date().toISOString(),
        };

        const sessionId = properties.session_id !== undefined ? properties.session_id : this.getSessionId();
        if (sessionId) {
            payload['session_id'] = sessionId;
        }

        this.capture(eventName, payload);
    }

    /**
     * Tracks form field interactions while strictly preventing sensitive field values
     * or PII from ever being transmitted to PostHog.
     */
    trackFieldInteraction(
        eventName: FieldInteractionEventName,
        properties: FieldInteractionEventProperties
    ): void {
        const isSensitiveField =
            properties.is_sensitive === true ||
            properties.input_type === 'password' ||
            properties.field_type === 'password' ||
            this.isSensitiveFieldName(properties.field_name);

        const payload: Record<string, unknown> = {
            field_name: properties.field_name,
            field_type: properties.field_type,
            input_type: properties.input_type,
            component: properties.component,
            action: properties.action,
            value_type: properties.value_type,
            value_length: properties.value_length,
            is_empty: properties.is_empty,
            is_valid: properties.is_valid,
            is_sensitive: isSensitiveField,
            timestamp: properties.timestamp || new Date().toISOString(),
        };

        if (properties.page) {
            payload['page'] = this.sanitizePath(properties.page);
        }
        if (properties.validation_errors && properties.validation_errors.length > 0) {
            payload['validation_errors'] = properties.validation_errors;
        }
        if (properties.input_format) {
            payload['input_format'] = properties.input_format;
        }
        if (typeof properties.typing_burst_events === 'number') {
            payload['typing_burst_events'] = properties.typing_burst_events;
        }

        // Defense-in-depth: only forward safe_value when field is non-sensitive and value is not PII
        if (
            !isSensitiveField &&
            properties.safe_value !== undefined &&
            !this.looksLikePiiValue(properties.safe_value)
        ) {
            payload['safe_value'] = properties.safe_value;
        }

        const sessionId = properties.session_id !== undefined ? properties.session_id : this.getSessionId();
        if (sessionId) {
            payload['session_id'] = sessionId;
        }

        this.capture(eventName, payload);
    }

    /**
     * Tracks outgoing API requests with structured non-sensitive payload metadata
     * and an interaction_id for response correlation.
     */
    trackApiRequest(properties: ApiRequestEventProperties): void {
        const payload: Record<string, unknown> = {
            interaction_id: properties.interaction_id,
            api_name: properties.api_name,
            endpoint: this.sanitizePath(properties.endpoint),
            method: properties.method.toUpperCase(),
            component: properties.component,
            service: properties.service,
            request_content_type: properties.request_content_type,
            request_fields: this.sanitizeApiFieldList(properties.request_fields),
            query_params_present: Boolean(properties.query_params_present),
            timestamp: properties.timestamp || new Date().toISOString(),
        };

        const sessionId = properties.session_id !== undefined ? properties.session_id : this.getSessionId();
        if (sessionId) {
            payload['session_id'] = sessionId;
        }

        this.capture('api_request_started', payload);
    }

    /**
     * Tracks successful API responses with status code, duration, and inspected non-sensitive field metadata.
     */
    trackApiResponse(properties: ApiResponseEventProperties): void {
        const payload: Record<string, unknown> = {
            interaction_id: properties.interaction_id,
            api_name: properties.api_name,
            endpoint: this.sanitizePath(properties.endpoint),
            method: properties.method.toUpperCase(),
            component: properties.component,
            service: properties.service,
            status_code: properties.status_code,
            success: properties.success,
            response_type: properties.response_type,
            response_fields: this.sanitizeApiFieldList(properties.response_fields),
            duration_ms: Math.max(0, Math.round(properties.duration_ms)),
            timestamp: properties.timestamp || new Date().toISOString(),
        };

        const sessionId = properties.session_id !== undefined ? properties.session_id : this.getSessionId();
        if (sessionId) {
            payload['session_id'] = sessionId;
        }

        this.capture('api_response_received', payload);
    }

    /**
     * Tracks failed or timed-out API requests with categorized error metadata and sanitized messages.
     */
    trackApiError(properties: ApiErrorEventProperties): void {
        const isTimeout = properties.is_timeout === true || properties.error_category === 'timeout';
        const eventName = isTimeout ? 'api_request_timeout' : 'api_request_failed';

        const payload: Record<string, unknown> = {
            interaction_id: properties.interaction_id,
            api_name: properties.api_name,
            endpoint: this.sanitizePath(properties.endpoint),
            method: properties.method.toUpperCase(),
            component: properties.component,
            service: properties.service,
            status_code: properties.status_code,
            success: false,
            error_category: properties.error_category,
            error_message: this.sanitizeErrorMessage(properties.error_message, properties.status_code),
            duration_ms: Math.max(0, Math.round(properties.duration_ms)),
            timestamp: properties.timestamp || new Date().toISOString(),
        };

        if (properties.response_type) {
            payload['response_type'] = properties.response_type;
        }
        if (properties.response_fields && properties.response_fields.length > 0) {
            payload['response_fields'] = this.sanitizeApiFieldList(properties.response_fields);
        }
        if (properties.fallback_triggered !== undefined) {
            payload['fallback_triggered'] = properties.fallback_triggered;
        }

        const sessionId = properties.session_id !== undefined ? properties.session_id : this.getSessionId();
        if (sessionId) {
            payload['session_id'] = sessionId;
        }

        this.capture(eventName, payload);
    }

    /**
     * Tracks authentication lifecycle events with consistent metadata and correlation IDs.
     */
    trackAuthentication(
        eventName: AuthTrackingEventName,
        properties: AuthenticationEventProperties
    ): void {
        const payload: Record<string, unknown> = {
            ...properties,
            timestamp: properties.timestamp || new Date().toISOString(),
        };

        if (typeof properties.page === 'string') {
            payload['page'] = this.sanitizePath(properties.page);
        }
        if (typeof properties.duration_ms === 'number') {
            payload['duration_ms'] = Math.max(0, Math.round(properties.duration_ms));
        }

        const sessionId = properties.session_id !== undefined ? properties.session_id : this.getSessionId();
        if (sessionId) {
            payload['session_id'] = sessionId;
        }

        this.capture(eventName, payload);
    }

    /**
     * Inspects top-level fields of an API request or response payload without exposing
     * raw credentials, tokens, or PII. Only explicitly allowlisted non-sensitive fields
     * include a safe_value summary.
     */
    inspectPayloadFields(
        payload: unknown,
        allowlistedKeys?: ReadonlySet<string>
    ): ApiFieldMetadata[] {
        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
            return [];
        }

        const record = payload as Record<string, unknown>;
        return Object.keys(record).map((key) => {
            const value = record[key];
            const present = value !== undefined && value !== null && value !== '';
            const valueType = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
            const isSensitive = this.isSensitiveFieldName(key);

            const fieldMeta: ApiFieldMetadata = {
                name: key,
                type: valueType,
                present,
                value_logged: false,
            };

            if (!isSensitive && present && allowlistedKeys?.has(key)) {
                const safeValue = this.extractSafeAllowlistedValue(value);
                if (safeValue !== undefined) {
                    fieldMeta.value_logged = true;
                    fieldMeta.safe_value = safeValue;
                }
            }

            return fieldMeta;
        });
    }

    /**
     * Categorizes HTTP or client errors into normalized PostHog error categories.
     */
    categorizeApiError(error: unknown, statusCode?: number): ApiErrorCategory {
        const errObj = error as { name?: string; status?: number; message?: string } | null | undefined;
        const resolvedStatus = typeof statusCode === 'number' ? statusCode : errObj?.status;

        if (
            errObj?.name === 'TimeoutError' ||
            resolvedStatus === 408 ||
            resolvedStatus === 504 ||
            (typeof errObj?.message === 'string' && /timeout|timed out/i.test(errObj.message))
        ) {
            return 'timeout';
        }
        if (resolvedStatus === 401 || errObj?.message === 'INVALID_CREDENTIALS') {
            return 'authentication_failed';
        }
        if (resolvedStatus === 403 || errObj?.message === 'ACCESS_DENIED_NOT_ADMIN') {
            return 'authorization_denied';
        }
        if (resolvedStatus === 0) {
            return 'network_error';
        }
        if (resolvedStatus === 400 || resolvedStatus === 422) {
            return 'validation_error';
        }
        if (resolvedStatus === 429) {
            return 'rate_limited';
        }
        if (typeof resolvedStatus === 'number' && resolvedStatus >= 500) {
            return 'server_error';
        }
        if (typeof resolvedStatus === 'number' && resolvedStatus >= 400) {
            return 'client_error';
        }
        return 'unknown_error';
    }

    /**
     * Sanitizes backend or network error messages before sending to PostHog so tokens,
     * emails, or query parameters are never leaked.
     */
    sanitizeErrorMessage(message: unknown, statusCode?: number): string {
        if (typeof message !== 'string' || !message.trim()) {
            if (statusCode === 0) {
                return 'Network error or API unreachable';
            }
            if (typeof statusCode === 'number' && statusCode > 0) {
                return `HTTP ${statusCode} error`;
            }
            return 'Request failed';
        }

        const redacted = message
            .replace(INLINE_BEARER_PATTERN, 'Bearer [redacted]')
            .replace(INLINE_JWT_PATTERN, '[redacted_token]')
            .replace(INLINE_EMAIL_PATTERN, '[redacted_email]')
            .replace(/\?[^\s"']+/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        return redacted.length > 160 ? `${redacted.slice(0, 157)}...` : redacted;
    }

    isSensitiveFieldName(fieldName: string): boolean {
        if (!fieldName) {
            return true;
        }
        return SENSITIVE_FIELD_NAME_PATTERN.test(fieldName);
    }

    private looksLikePiiValue(value: unknown): boolean {
        if (typeof value !== 'string') {
            return false;
        }
        const trimmed = value.trim();
        return (
            EMAIL_PATTERN.test(trimmed) ||
            PHONE_PATTERN.test(trimmed) ||
            JWT_PATTERN.test(trimmed) ||
            /^bearer\s+/i.test(trimmed)
        );
    }

    private extractSafeAllowlistedValue(
        value: unknown
    ): string | number | boolean | string[] | undefined {
        if (typeof value === 'boolean' || typeof value === 'number') {
            return value;
        }
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed || this.looksLikePiiValue(trimmed) || trimmed.length > 80) {
                return undefined;
            }
            return trimmed;
        }
        if (Array.isArray(value)) {
            const extractedNames: string[] = [];
            for (const item of value.slice(0, 10)) {
                if (typeof item === 'string' && !this.looksLikePiiValue(item)) {
                    extractedNames.push(item);
                } else if (item && typeof item === 'object' && 'name' in item) {
                    const nameVal = (item as { name?: unknown }).name;
                    if (typeof nameVal === 'string' && !this.looksLikePiiValue(nameVal)) {
                        extractedNames.push(nameVal);
                    }
                }
            }
            return extractedNames;
        }
        return undefined;
    }

    private sanitizeApiFieldList(fields: ApiFieldMetadata[]): ApiFieldMetadata[] {
        return fields.map((field) => {
            if (this.isSensitiveFieldName(field.name)) {
                return {
                    name: field.name,
                    type: field.type,
                    present: field.present,
                    value_logged: false,
                };
            }
            return field;
        });
    }

    /**
     * Strips query parameters and hash fragments and redacts dynamic entity IDs
     * or PII-looking path segments so sensitive data never reaches PostHog.
     */
    sanitizePath(rawUrl: string): string {
        if (!rawUrl) {
            return '/';
        }

        const withoutQuery = rawUrl.split('?')[0].split('#')[0].trim();
        if (!withoutQuery || withoutQuery === '/') {
            return '/';
        }

        const normalized = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
        const trimmed = normalized.length > 1 && normalized.endsWith('/')
            ? normalized.slice(0, -1)
            : normalized;

        const sanitizedSegments = trimmed
            .split('/')
            .filter((segment) => segment.length > 0)
            .map((segment) => {
                let decoded = segment;
                try {
                    decoded = decodeURIComponent(segment);
                } catch {
                    decoded = segment;
                }

                if (EMAIL_PATTERN.test(decoded) || PHONE_PATTERN.test(decoded)) {
                    return ':redacted';
                }
                if (UUID_PATTERN.test(decoded) || NUMERIC_ID_PATTERN.test(decoded) || LONG_HEX_ID_PATTERN.test(decoded)) {
                    return ':id';
                }
                return segment.toLowerCase();
            });

        return sanitizedSegments.length > 0 ? `/${sanitizedSegments.join('/')}` : '/';
    }

    /**
     * Resolves a human-readable application section for any sanitized route path.
     */
    resolveApplicationSection(rawPath: string): string {
        const cleanPath = this.sanitizePath(rawPath);
        if (ROUTE_METADATA_MAP[cleanPath]) {
            return ROUTE_METADATA_MAP[cleanPath].section;
        }

        if (cleanPath.startsWith('/services')) return 'Services';
        if (cleanPath.startsWith('/appointments')) return 'Appointments';
        if (cleanPath.startsWith('/customers') || cleanPath.startsWith('/bicycles') || cleanPath.startsWith('/technicians')) {
            return 'Fleet & CRM';
        }
        if (cleanPath.startsWith('/dashboard') || cleanPath.startsWith('/admin/')) return 'Dashboard';
        if (cleanPath.startsWith('/auth') || cleanPath.startsWith('/login')) return 'Authentication';
        if (cleanPath.startsWith('/landing')) return 'Public';
        if (cleanPath.startsWith('/settings')) return 'Settings';
        if (cleanPath.startsWith('/reports')) return 'Reports';
        if (cleanPath.startsWith('/payments') || cleanPath.startsWith('/inventory')) return 'Operations';

        return 'Application';
    }

    private resolveRouteMetadata(cleanPath: string, router: Router): RouteMetadata {
        if (ROUTE_METADATA_MAP[cleanPath]) {
            return ROUTE_METADATA_MAP[cleanPath];
        }

        // Check deepest active route snapshot (supports lazy-loaded routes & route titles)
        const deepest = this.getDeepestRouteSnapshot(router?.routerState?.snapshot?.root ?? null);
        if (deepest) {
            const customPageName = deepest.data?.['pageName'];
            if (typeof customPageName === 'string' && customPageName.trim()) {
                return {
                    pageName: customPageName.trim(),
                    section: this.resolveApplicationSection(cleanPath),
                };
            }

            const rawTitle = typeof deepest.title === 'string' ? deepest.title : '';
            if (rawTitle.trim()) {
                const cleanedTitle = rawTitle.split('|')[0].split('•')[0].trim();
                if (cleanedTitle) {
                    return {
                        pageName: cleanedTitle,
                        section: this.resolveApplicationSection(cleanPath),
                    };
                }
            }
        }

        // Fallback: convert sanitized path into readable Title Case
        const fallbackName = cleanPath
            .split('/')
            .filter((s) => s && !s.startsWith(':'))
            .map((s) =>
                s
                    .split('-')
                    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
                    .join(' ')
            )
            .join(' - ');

        return {
            pageName: fallbackName || 'Dashboard',
            section: this.resolveApplicationSection(cleanPath),
        };
    }

    private getDeepestRouteSnapshot(
        snapshot: ActivatedRouteSnapshot | null
    ): ActivatedRouteSnapshot | null {
        if (!snapshot) {
            return null;
        }

        let current: ActivatedRouteSnapshot = snapshot;
        while (current.firstChild) {
            current = current.firstChild;
        }
        return current;
    }

    private consumeMatchingMenuSource(cleanPath: string): string | undefined {
        if (!this.lastMenuClick) {
            return undefined;
        }

        const ageMs = Date.now() - this.lastMenuClick.timestamp;
        const isFresh = ageMs <= 2000;
        const matchesTarget =
            this.lastMenuClick.destination === cleanPath ||
            (this.lastMenuClick.destination === '/' && (cleanPath === '/dashboard' || cleanPath === '/services'));

        if (isFresh && matchesTarget) {
            const source = this.lastMenuClick.menuLocation;
            this.lastMenuClick = null;
            return source;
        }

        if (!isFresh) {
            this.lastMenuClick = null;
        }

        return undefined;
    }
}
