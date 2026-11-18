import { describe, beforeEach, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { App } from './app';
import { PosthogService } from './services/posthog.service';
import { AuthService } from './common/services/auth.service';

describe('App', () => {
  let posthogMock: Partial<PosthogService>;

  beforeEach(async () => {
    sessionStorage.clear();
    localStorage.clear();

    posthogMock = {
      capture: vi.fn(),
      identify: vi.fn(),
      identifyUser: vi.fn(),
      setAnonymousContext: vi.fn(),
      registerSuperProperties: vi.fn(),
      reset: vi.fn(),
      resetIdentity: vi.fn(),
      markPostLoginPending: vi.fn(),
      startRouteTracking: vi.fn(),
      sanitizePath: vi.fn((url: string) => url.split('?')[0] || '/'),
      resolveApplicationSection: vi.fn(() => 'Dashboard'),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: PosthogService, useValue: posthogMock },
      ],
    }).compileComponents();
  });

  it('should create the app and initialize centralized route tracking and analytics identity', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app).toBeTruthy();
    expect(posthogMock.setAnonymousContext).toHaveBeenCalledTimes(1);
    expect(posthogMock.startRouteTracking).toHaveBeenCalledTimes(1);
  });

  it('should restore PostHog user identification on startup when a persisted session exists', () => {
    sessionStorage.setItem('Token', 'persisted_session_token');
    sessionStorage.setItem('user_role', 'customer');
    sessionStorage.setItem(
      'admin_user',
      JSON.stringify({
        id: 'cust-101',
        email: 'rider@example.com',
        role: 'customer',
      })
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: PosthogService, useValue: posthogMock },
      ],
    });

    const fixture = TestBed.createComponent(App);
    const authService = TestBed.inject(AuthService);

    expect(fixture.componentInstance).toBeTruthy();
    expect(authService.isAuthenticated()).toBe(true);
    expect(posthogMock.identifyUser).toHaveBeenCalledWith(
      'cust-101',
      expect.objectContaining({
        user_role: 'Customer',
        is_authenticated: true,
        auth_method: 'session_restored',
      })
    );
    expect(posthogMock.startRouteTracking).toHaveBeenCalledTimes(1);
  });
});
