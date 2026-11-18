import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NavigationCancel, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import posthog from 'posthog-js';
import { AnalyticsUserContext, PosthogService } from './posthog.service';

vi.mock('posthog-js', () => ({
  default: {
    init: vi.fn(),
    capture: vi.fn(),
    identify: vi.fn(),
    register: vi.fn(),
    reset: vi.fn(),
    get_session_id: vi.fn(() => 'ph-session-abc-123'),
  },
}));

describe('PosthogService', () => {
  let service: PosthogService;
  let routerEvents$: Subject<any>;
  let mockRouter: any;
  let userContext: AnalyticsUserContext;

  beforeEach(() => {
    vi.clearAllMocks();
    routerEvents$ = new Subject<any>();
    mockRouter = {
      events: routerEvents$.asObservable(),
      navigated: false,
      url: '/',
      routerState: {
        snapshot: {
          root: {
            firstChild: null,
            data: {},
            title: undefined,
          },
        },
      },
    };
    userContext = {
      userId: 'cust-123',
      userRole: 'Customer',
      isAuthenticated: true,
    };

    TestBed.configureTestingModule({
      providers: [PosthogService],
    });

    service = TestBed.inject(PosthogService);
  });

  afterEach(() => {
    routerEvents$.complete();
  });

  it('should initialize PostHog once, fire temporary localhost_posthog_test in loaded callback, and never throw if PostHog SDK throws an error', () => {
    expect(posthog.init).toHaveBeenCalledTimes(1);

    const initArgs = (posthog.init as any).mock.calls[0];
    expect(initArgs[1]).toEqual(
      expect.objectContaining({
        debug: true,
        defaults: '2026-08-30',
      })
    );
    expect(typeof initArgs[1].loaded).toBe('function');

    // Simulate PostHog SDK invoking the loaded callback in development mode
    initArgs[1].loaded({
      has_opted_out_capturing: () => false,
      get_distinct_id: () => 'anon-dev-id',
    });
    expect(posthog.capture).toHaveBeenCalledWith('localhost_posthog_test', {
      source: 'angular_localhost',
      environment: 'development',
    });

    (posthog.capture as any).mockImplementationOnce(() => {
      throw new Error('PostHog network blocked');
    });

    expect(() => service.capture('test_event', { ok: true })).not.toThrow();
  });

  it('should sanitize URLs by stripping sensitive query params and redacting PII or dynamic IDs', () => {
    expect(
      service.sanitizePath('/services/550e8400-e29b-41d4-a716-446655440000/edit?token=jwt123&email=a@b.com')
    ).toBe('/services/:id/edit');
    expect(service.sanitizePath('/customers/user@example.com?phone=5551234567')).toBe(
      '/customers/:redacted'
    );
    expect(service.sanitizePath('/appointments?returnUrl=/secret&code=999#section')).toBe(
      '/appointments'
    );
    expect(service.sanitizePath('/bicycles/42')).toBe('/bicycles/:id');
  });

  it('should track only successful NavigationEnd events, avoid duplicates, and track journey metadata', () => {
    service.startRouteTracking(mockRouter as Router, () => userContext);
    // Calling a second time must not double-subscribe
    service.startRouteTracking(mockRouter as Router, () => userContext);

    // Non-NavigationEnd events must be ignored
    routerEvents$.next(new NavigationStart(1, '/services'));
    routerEvents$.next(new NavigationCancel(1, '/services', 'guard redirect'));
    expect(posthog.capture).not.toHaveBeenCalled();

    // Initial page load
    routerEvents$.next(new NavigationEnd(1, '/services?token=abc', '/services?token=abc'));
    expect(posthog.capture).toHaveBeenCalledTimes(1);
    expect(posthog.capture).toHaveBeenLastCalledWith(
      'page_viewed',
      expect.objectContaining({
        page_name: 'Services',
        page_path: '/services',
        previous_page: null,
        user_id: 'cust-123',
        user_role: 'Customer',
        is_authenticated: true,
        application_section: 'Services',
        is_initial_page_load: true,
        is_post_login_landing: false,
        is_revisit: false,
        visit_count_in_session: 1,
        navigation_step: 1,
      })
    );

    // Duplicate navigation to the same sanitized path should be skipped
    routerEvents$.next(new NavigationEnd(2, '/services?page=2', '/services?page=2'));
    expect(posthog.capture).toHaveBeenCalledTimes(1);

    // Next route: Appointment page
    routerEvents$.next(new NavigationEnd(3, '/appointments', '/appointments'));
    expect(posthog.capture).toHaveBeenCalledTimes(2);
    expect(posthog.capture).toHaveBeenLastCalledWith(
      'page_viewed',
      expect.objectContaining({
        page_name: 'Appointments',
        page_path: '/appointments',
        previous_page: '/services',
        user_id: 'cust-123',
        user_role: 'Customer',
        is_authenticated: true,
        application_section: 'Appointments',
        is_initial_page_load: false,
        is_revisit: false,
        visit_count_in_session: 1,
        navigation_step: 2,
      })
    );

    // Navigating back to /services marks revisit & increments visit count
    routerEvents$.next(new NavigationEnd(4, '/services', '/services'));
    expect(posthog.capture).toHaveBeenCalledTimes(3);
    expect(posthog.capture).toHaveBeenLastCalledWith(
      'page_viewed',
      expect.objectContaining({
        page_name: 'Services',
        page_path: '/services',
        previous_page: '/appointments',
        is_revisit: true,
        visit_count_in_session: 2,
        navigation_step: 3,
      })
    );
  });

  it('should mark the first non-auth page immediately after login as is_post_login_landing', () => {
    service.startRouteTracking(mockRouter as Router, () => userContext);
    service.markPostLoginPending();

    routerEvents$.next(new NavigationEnd(1, '/admin/login', '/admin/login'));
    expect(posthog.capture).toHaveBeenLastCalledWith(
      'page_viewed',
      expect.objectContaining({
        page_path: '/admin/login',
        is_post_login_landing: false,
      })
    );

    routerEvents$.next(new NavigationEnd(2, '/services', '/services'));
    expect(posthog.capture).toHaveBeenLastCalledWith(
      'page_viewed',
      expect.objectContaining({
        page_path: '/services',
        previous_page: '/admin/login',
        is_post_login_landing: true,
      })
    );

    // Subsequent pages are no longer post-login landing
    routerEvents$.next(new NavigationEnd(3, '/bicycles', '/bicycles'));
    expect(posthog.capture).toHaveBeenLastCalledWith(
      'page_viewed',
      expect.objectContaining({
        page_path: '/bicycles',
        is_post_login_landing: false,
      })
    );
  });

  it('should resolve page names for lazy-loaded routes via deepest ActivatedRouteSnapshot title', () => {
    mockRouter.routerState.snapshot.root = {
      firstChild: {
        firstChild: null,
        data: {},
        title: 'Custom Lazy Module | Cycle Service Center',
      },
      data: {},
      title: undefined,
    };

    service.startRouteTracking(mockRouter as Router, () => userContext);
    routerEvents$.next(new NavigationEnd(1, '/custom-lazy', '/custom-lazy'));

    expect(posthog.capture).toHaveBeenCalledWith(
      'page_viewed',
      expect.objectContaining({
        page_name: 'Custom Lazy Module',
        page_path: '/custom-lazy',
      })
    );
  });

  it('should track menu clicks without duplicating rapid events and attach navigation_source to resulting page_viewed', () => {
    service.startRouteTracking(mockRouter as Router, () => userContext);

    service.trackMenuClick(
      'sidebar_menu_clicked',
      {
        menuName: 'Appointments',
        menuLocation: 'Sidebar',
        destination: '/appointments?ref=secret',
        menuVariant: 'User Sidebar Menu',
      },
      userContext
    );

    // Duplicate click within 250ms is deduplicated
    service.trackMenuClick(
      'sidebar_menu_clicked',
      {
        menuName: 'Appointments',
        menuLocation: 'Sidebar',
        destination: '/appointments?ref=secret',
        menuVariant: 'User Sidebar Menu',
      },
      userContext
    );

    expect(posthog.capture).toHaveBeenCalledTimes(1);
    expect(posthog.capture).toHaveBeenCalledWith('sidebar_menu_clicked', {
      menu_name: 'Appointments',
      menu_location: 'Sidebar',
      destination: '/appointments',
      user_id: 'cust-123',
      user_role: 'Customer',
      is_authenticated: true,
      application_section: 'Appointments',
      menu_variant: 'User Sidebar Menu',
    });

    // Resulting NavigationEnd fires one page_viewed with navigation_source = Sidebar
    routerEvents$.next(new NavigationEnd(1, '/appointments', '/appointments'));
    expect(posthog.capture).toHaveBeenCalledTimes(2);
    expect(posthog.capture).toHaveBeenLastCalledWith(
      'page_viewed',
      expect.objectContaining({
        page_name: 'Appointments',
        page_path: '/appointments',
        navigation_source: 'Sidebar',
      })
    );
  });

  it('should omit user_id for anonymous visitors and clear session state on resetIdentity', () => {
    const anonContext: AnalyticsUserContext = {
      userId: null,
      userRole: 'Anonymous',
      isAuthenticated: false,
    };

    service.startRouteTracking(mockRouter as Router, () => userContext);
    routerEvents$.next(new NavigationEnd(1, '/services', '/services'));

    service.resetIdentity();
    expect(posthog.reset).toHaveBeenCalledTimes(1);
    expect(posthog.register).toHaveBeenLastCalledWith({
      user_role: 'Anonymous',
      is_authenticated: false,
    });

    // Next user visiting /landing gets a clean session with previous_page: null and no user_id
    userContext = anonContext;
    routerEvents$.next(new NavigationEnd(2, '/landing', '/landing'));
    const lastPayload = (posthog.capture as any).mock.calls.at(-1)?.[1];
    expect(lastPayload.user_role).toBe('Anonymous');
    expect(lastPayload.is_authenticated).toBe(false);
    expect(lastPayload.previous_page).toBeNull();
    expect(lastPayload.user_id).toBeUndefined();
  });

  it('should strip sensitive field values and PII in trackFieldInteraction and inspectPayloadFields', () => {
    service.trackFieldInteraction('admin_login_field_changed', {
      field_name: 'password',
      field_type: 'password',
      input_type: 'password',
      component: 'AdminLoginComponent',
      page: '/admin/login?returnUrl=/secret',
      action: 'field_changed',
      value_type: 'string',
      value_length: 10,
      is_empty: false,
      is_valid: true,
      safe_value: 'SuperSecret!' as any,
    });

    const fieldCall = (posthog.capture as any).mock.calls.at(-1);
    expect(fieldCall[0]).toBe('admin_login_field_changed');
    expect(fieldCall[1]).toEqual(
      expect.objectContaining({
        field_name: 'password',
        is_sensitive: true,
        value_length: 10,
        page: '/admin/login',
        session_id: 'ph-session-abc-123',
      })
    );
    expect(fieldCall[1].safe_value).toBeUndefined();
    expect(JSON.stringify(fieldCall[1])).not.toContain('SuperSecret!');

    const inspected = service.inspectPayloadFields(
      {
        accessToken: 'eyJhbGciOiJIUzI1NiJ9.payload.signature',
        email: 'admin@cycleservice.com',
        firstName: 'Admin',
        roles: [{ id: '1', name: 'Admin' }],
        facility: 'Main Service Hub #01',
      },
      new Set(['accessToken', 'email', 'roles', 'facility'])
    );

    const tokenField = inspected.find((f) => f.name === 'accessToken');
    const emailField = inspected.find((f) => f.name === 'email');
    const rolesField = inspected.find((f) => f.name === 'roles');
    const facilityField = inspected.find((f) => f.name === 'facility');

    expect(tokenField).toEqual({ name: 'accessToken', type: 'string', present: true, value_logged: false });
    expect(emailField).toEqual({ name: 'email', type: 'string', present: true, value_logged: false });
    expect(rolesField).toEqual({
      name: 'roles',
      type: 'array',
      present: true,
      value_logged: true,
      safe_value: ['Admin'],
    });
    expect(facilityField).toEqual({
      name: 'facility',
      type: 'string',
      present: true,
      value_logged: true,
      safe_value: 'Main Service Hub #01',
    });
  });

  it('should track API request, response, timeout, and sanitized errors with session and correlation IDs', () => {
    const corrId = service.generateInteractionId();
    expect(corrId.length).toBeGreaterThan(8);

    service.trackApiRequest({
      interaction_id: corrId,
      api_name: 'Admin Login',
      endpoint: '/api/auth/login?debug=1',
      method: 'post',
      component: 'AdminLoginComponent',
      service: 'AuthService',
      request_content_type: 'application/json',
      request_fields: [
        { name: 'login', type: 'string', present: true, value_logged: true, safe_value: 'admin@test.com' },
        { name: 'password', type: 'string', present: true, value_logged: false },
      ],
    });

    const reqCall = (posthog.capture as any).mock.calls.at(-1);
    expect(reqCall[0]).toBe('api_request_started');
    expect(reqCall[1].endpoint).toBe('/api/auth/login');
    expect(reqCall[1].method).toBe('POST');
    expect(JSON.stringify(reqCall[1])).not.toContain('admin@test.com');

    service.trackApiError({
      interaction_id: corrId,
      api_name: 'Admin Login',
      endpoint: '/api/auth/login',
      method: 'POST',
      component: 'AdminLoginComponent',
      service: 'AuthService',
      status_code: 504,
      success: false,
      error_category: 'timeout',
      error_message: 'Gateway timeout for admin@cycleservice.com with Bearer secretToken123',
      is_timeout: true,
      duration_ms: 15000.4,
    });

    const errCall = (posthog.capture as any).mock.calls.at(-1);
    expect(errCall[0]).toBe('api_request_timeout');
    expect(errCall[1].duration_ms).toBe(15000);
    expect(errCall[1].error_message).toContain('[redacted_email]');
    expect(errCall[1].error_message).toContain('Bearer [redacted]');
    expect(errCall[1].error_message).not.toContain('admin@cycleservice.com');
    expect(errCall[1].error_message).not.toContain('secretToken123');
  });
});
