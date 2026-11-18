import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminLoginComponent } from './admin-login.component';
import { AuthService } from '../../common/services/auth.service';
import { PosthogService } from '../../services/posthog.service';

describe('AdminLoginComponent Analytics & Interaction Tracking', () => {
  let fixture: ComponentFixture<AdminLoginComponent>;
  let component: AdminLoginComponent;
  let authServiceMock: any;
  let posthogMock: any;
  let routerMock: any;

  beforeEach(async () => {
    vi.useFakeTimers();

    authServiceMock = {
      isAuthenticated: vi.fn(() => false),
      isAdmin: vi.fn(() => false),
      getAnalyticsContext: vi.fn(() => ({
        userId: null,
        userRole: 'Anonymous',
        isAuthenticated: false,
      })),
      loginAdmin: vi.fn(() =>
        of({
          token: 'test-token',
          user: { id: 'adm-1', email: 'admin@cycleservice.com', role: 'admin', groups: [{ name: 'Admin Team' }] },
        })
      ),
    };

    posthogMock = {
      generateInteractionId: vi.fn(() => 'login-int-123'),
      sanitizePath: vi.fn((url: string) => url.split('?')[0] || '/admin/login'),
      trackInteraction: vi.fn(),
      trackButtonClick: vi.fn(),
      trackFieldInteraction: vi.fn(),
    };

    routerMock = {
      url: '/admin/login',
      navigate: vi.fn(),
      navigateByUrl: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AdminLoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: PosthogService, useValue: posthogMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
    vi.useRealTimers();
  });

  it('should track admin_login_page_viewed, window focus/blur, and admin_login_page_exited', () => {
    expect(posthogMock.trackInteraction).toHaveBeenCalledWith(
      'admin_login_page_viewed',
      expect.objectContaining({
        component: 'AdminLoginComponent',
        page_name: 'Admin Login',
        page_path: '/admin/login',
        is_authenticated: false,
        authentication_status: 'unauthenticated',
        user_role: 'Anonymous',
      })
    );

    window.dispatchEvent(new Event('focus'));
    expect(posthogMock.trackInteraction).toHaveBeenCalledWith(
      'admin_login_page_focused',
      expect.objectContaining({ page_name: 'Admin Login', page_path: '/admin/login' })
    );

    window.dispatchEvent(new Event('blur'));
    expect(posthogMock.trackInteraction).toHaveBeenCalledWith(
      'admin_login_page_blurred',
      expect.objectContaining({ page_name: 'Admin Login', page_path: '/admin/login' })
    );

    fixture.destroy();
    expect(posthogMock.trackInteraction).toHaveBeenCalledWith(
      'admin_login_page_exited',
      expect.objectContaining({
        page_name: 'Admin Login',
        page_path: '/admin/login',
        exit_reason: 'navigation',
        time_on_page_ms: expect.any(Number),
      })
    );
  });

  it('should debounce typing, track cleared, focus, blur, and validation transitions without logging raw credentials', () => {
    component.onFieldFocus('username');
    expect(posthogMock.trackFieldInteraction).toHaveBeenCalledWith(
      'admin_login_field_focused',
      expect.objectContaining({
        field_name: 'username',
        field_type: 'text',
        action: 'field_focused',
        is_empty: true,
      })
    );

    // Rapid keystrokes should be debounced into a single typing event
    component.loginForm.get('username')?.setValue('a');
    component.loginForm.get('username')?.setValue('ad');
    component.loginForm.get('username')?.setValue('admin@cycleservice.com');

    const typingBeforeDebounce = posthogMock.trackFieldInteraction.mock.calls.filter(
      ([eventName]: [string]) => eventName === 'admin_login_field_typing'
    );
    expect(typingBeforeDebounce.length).toBe(0);

    vi.advanceTimersByTime(450);

    const typingAfterDebounce = posthogMock.trackFieldInteraction.mock.calls.filter(
      ([eventName]: [string]) => eventName === 'admin_login_field_typing'
    );
    expect(typingAfterDebounce.length).toBe(1);
    expect(typingAfterDebounce[0][1]).toEqual(
      expect.objectContaining({
        field_name: 'username',
        value_length: 22,
        is_empty: false,
        is_valid: true,
        input_format: 'email',
        typing_burst_events: 3,
      })
    );
    expect(JSON.stringify(typingAfterDebounce[0][1])).not.toContain('admin@cycleservice.com');

    // Validation passed should have been emitted
    expect(posthogMock.trackFieldInteraction).toHaveBeenCalledWith(
      'admin_login_field_validation_passed',
      expect.objectContaining({ field_name: 'username', is_valid: true })
    );

    // Clearing the field emits cleared + validation failed
    component.loginForm.get('username')?.setValue('');
    expect(posthogMock.trackFieldInteraction).toHaveBeenCalledWith(
      'admin_login_field_cleared',
      expect.objectContaining({ field_name: 'username', is_empty: true, value_length: 0 })
    );
    expect(posthogMock.trackFieldInteraction).toHaveBeenCalledWith(
      'admin_login_field_validation_failed',
      expect.objectContaining({ field_name: 'username', is_valid: false, validation_errors: ['required'] })
    );

    // Password field typing never exposes password value
    component.onFieldFocus('password');
    component.loginForm.get('password')?.setValue('SuperSecret123!');
    vi.advanceTimersByTime(450);
    component.onFieldBlur('password');

    const allFieldCallsSerialized = JSON.stringify(posthogMock.trackFieldInteraction.mock.calls);
    expect(allFieldCallsSerialized).not.toContain('SuperSecret123!');
    expect(allFieldCallsSerialized).not.toContain('admin@cycleservice.com');
  });

  it('should track password visibility toggle without capturing password value', async () => {
    component.loginForm.get('password')?.setValue('MySecretPass!');
    const fakePasswordRef = { unmasked: true } as any;

    component.onPasswordToggleCheck(fakePasswordRef);
    await Promise.resolve();

    expect(posthogMock.trackInteraction).toHaveBeenCalledWith(
      'admin_password_visibility_toggled',
      expect.objectContaining({
        button_name: 'Toggle Password Visibility',
        field_name: 'password',
        password_visible: true,
        mask_state: 'visible',
        value_length: 13,
        is_empty: false,
      })
    );
    expect(JSON.stringify(posthogMock.trackInteraction.mock.calls)).not.toContain('MySecretPass!');
  });

  it('should track disabled and enabled button clicks, forgot password click, empty submit validation failure, and valid submit', () => {
    // Disabled Sign In button area click on empty form
    component.onSubmitButtonAreaClick();
    expect(posthogMock.trackButtonClick).toHaveBeenCalledWith(
      'admin_login_button_clicked',
      expect.objectContaining({
        button_name: 'Login',
        button_type: 'submit',
        button_enabled: false,
        form_valid: false,
      })
    );

    // Forgot Password click
    component.forgotPasswordPrompt();
    expect(posthogMock.trackButtonClick).toHaveBeenCalledWith(
      'admin_login_button_clicked',
      expect.objectContaining({
        button_name: 'Forgot Password',
        button_text: 'Forgot?',
        button_type: 'action',
        button_enabled: true,
      })
    );

    // Submit empty form
    component.onSubmit();
    expect(posthogMock.trackInteraction).toHaveBeenCalledWith(
      'admin_login_form_submitted',
      expect.objectContaining({
        form_valid: false,
        fields_completed: 0,
        validation_error_count: 2,
      })
    );
    expect(posthogMock.trackInteraction).toHaveBeenCalledWith(
      'admin_login_form_validation_failed',
      expect.objectContaining({
        form_valid: false,
        invalid_fields: ['username', 'password'],
      })
    );
    expect(authServiceMock.loginAdmin).not.toHaveBeenCalled();

    // Fill valid form and submit
    component.loginForm.setValue({ username: 'admin', password: 'password123', remember: false });
    component.onLoginButtonClick();
    expect(posthogMock.trackButtonClick).toHaveBeenCalledWith(
      'admin_login_button_clicked',
      expect.objectContaining({
        button_name: 'Login',
        button_type: 'submit',
        button_enabled: true,
        form_valid: true,
      })
    );

    component.onSubmit();
    expect(authServiceMock.loginAdmin).toHaveBeenCalledWith(
      'admin',
      'password123',
      false,
      expect.objectContaining({
        interactionId: 'login-int-123',
        component: 'AdminLoginComponent',
        fieldsCompleted: 2,
        totalFields: 2,
        formValid: true,
      })
    );
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('should display appropriate error message when loginAdmin returns error', () => {
    authServiceMock.loginAdmin.mockReturnValueOnce(
      throwError(() => ({ status: 401, message: 'INVALID_CREDENTIALS' }))
    );

    component.loginForm.setValue({ username: 'admin', password: 'wrongpassword', remember: false });
    component.onSubmit();

    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toContain('Invalid email or password');
  });
});
