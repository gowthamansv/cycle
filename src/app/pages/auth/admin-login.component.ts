import { Component, inject, NgZone, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { Password, PasswordModule } from 'primeng/password';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { AuthService } from '../../common/services/auth.service';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { PosthogService } from '../../services/posthog.service';

type LoginFieldName = 'username' | 'password';

interface FieldTrackingState {
  previousValue: string;
  lastCommittedValue: string;
  typingBurstCount: number;
  lastValidationState: 'unknown' | 'valid' | string;
}

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    IconFieldModule,
    InputIconModule,
    AppFloatingConfigurator
  ],
  template: `
    <app-floating-configurator />

    <div class="glass-login-viewport min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      
      <!-- Subtle Background Ambient Glows -->
      <div class="glow-orb glow-orb-top" aria-hidden="true"></div>
      <div class="glow-orb glow-orb-bottom" aria-hidden="true"></div>

      <!-- Centered Translucent Glass Login Card -->
      <div class="w-full max-w-[420px] relative z-10">
        
        <div class="glass-card p-8 sm:p-10">
          
          <!-- Brand Logo & Heading -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center mb-4">
              <img 
                src="assets/images/logo.png" 
                alt="Cycle Service Center Logo" 
                class="h-20 w-auto object-contain drop-shadow-md"
                onerror="this.style.display='none'"
              />
            </div>
            
            <span class="text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff6a00] block mb-1">
              Cycle Service Center
            </span>
            <span class="text-3xl block mt-2 mb-1 sm:text-4xl font-bold text-white tracking-tight">
              Login
</span>
           
          </div>

          <!-- Error Alert Banner -->
          <div *ngIf="errorMessage" class="mb-5 animate-fade-in">
            <div class="glass-error-banner p-3 rounded-xl flex items-start gap-2.5 text-xs">
              <i class="pi pi-exclamation-circle text-sm shrink-0 mt-0.5 text-red-400"></i>
              <div class="font-medium text-red-200 leading-relaxed">{{ errorMessage }}</div>
            </div>
          </div>

          <!-- Reactive Admin Login Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5" novalidate>
            
            <!-- Email / Username Field -->
            <div class="space-y-2">
              <label for="username" class="block text-xs font-semibold tracking-wide text-neutral-300 uppercase">
                Email
              </label>
              <p-iconfield iconPosition="left" class="w-full block">
                <p-inputicon styleClass="pi pi-user text-neutral-400 text-sm"></p-inputicon>
                <input 
                  pInputText 
                  id="username" 
                  type="text" 
                  formControlName="username" 
                  placeholder="admin@cycleservice.com"
                  class="glass-input w-full py-2.5 sm:py-3 text-sm"
                  [ngClass]="{'input-invalid': isFieldInvalid('username')}"
                  autocomplete="username"
                  (focus)="onFieldFocus('username')"
                  (blur)="onFieldBlur('username')"
                />
              </p-iconfield>
              <small *ngIf="isFieldInvalid('username')" class="text-red-400 text-xs block mt-1">
                <span *ngIf="loginForm.get('username')?.hasError('required')">Email or username is required.</span>
                <span *ngIf="loginForm.get('username')?.hasError('minlength')">Must be at least 3 characters.</span>
              </small>
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label for="password" class="block text-xs font-semibold tracking-wide text-neutral-300 uppercase">
                  Password
                </label>
                <span class="text-xs text-neutral-400 hover:text-[#ff6a00] cursor-pointer transition-colors" (click)="forgotPasswordPrompt()">
                  Forgot?
                </span>
              </div>
              <p-password 
                #passwordRef
                id="password" 
                formControlName="password" 
                placeholder="Enter password" 
                [toggleMask]="true" 
                [feedback]="false"
                [fluid]="true"
                styleClass="w-full glass-password-wrapper"
                inputStyleClass="glass-input w-full py-2.5 sm:py-3 text-sm"
                [ngClass]="{'input-invalid': isFieldInvalid('password')}"
                autocomplete="current-password"
                (onFocus)="onFieldFocus('password')"
                (onBlur)="onFieldBlur('password')"
                (click)="onPasswordToggleCheck(passwordRef)"
                (keydown.enter)="onPasswordToggleCheck(passwordRef)"
                (keydown.space)="onPasswordToggleCheck(passwordRef)"
              ></p-password>
              <small *ngIf="isFieldInvalid('password')" class="text-red-400 text-xs block mt-1">
                <span *ngIf="loginForm.get('password')?.hasError('required')">Password is required.</span>
                <span *ngIf="loginForm.get('password')?.hasError('minlength')">Password must be at least 4 characters.</span>
              </small>
            </div>

            <!-- Remember Me & Security Status -->
            <!-- <div class="flex items-center justify-between pt-1">
              <div class="flex items-center gap-2">
                <p-checkbox 
                  id="remember" 
                  formControlName="remember" 
                  [binary]="true"
                ></p-checkbox>
                <label for="remember" class="text-xs text-neutral-400 cursor-pointer select-none hover:text-neutral-300 transition-colors">
                  Remember me
                </label>
              </div>
              <span class="text-xs text-neutral-400 flex items-center gap-1.5">
                <i class="pi pi-lock text-[10px] text-[#ff6a00]"></i> Secure Portal
              </span>
            </div> -->

            <!-- Submit Button -->
            <div
              class="pt-2"
              [class.cursor-not-allowed]="isLoading || loginForm.invalid"
              (click)="onSubmitButtonAreaClick()"
            >
              <p-button 
                type="submit" 
                [label]="isLoading ? 'Signing In...' : 'Sign In'" 
                [icon]="isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'" 
                [loading]="isLoading"
                [disabled]="isLoading || loginForm.invalid"
                (onClick)="onLoginButtonClick()"
                styleClass="w-full py-3 font-semibold text-sm glass-submit-btn"
              ></p-button>
            </div>

          </form>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .glass-login-viewport {
      background-color: #050505;
      background-image: 
        radial-gradient(circle at 50% 20%, rgba(255, 106, 0, 0.12) 0%, transparent 55%),
        radial-gradient(circle at 50% 80%, rgba(255, 106, 0, 0.06) 0%, transparent 60%);
      position: relative;
    }

    .glow-orb {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      filter: blur(80px);
      z-index: 1;
    }

    .glow-orb-top {
      width: 360px;
      height: 360px;
      background: radial-gradient(circle, rgba(255, 106, 0, 0.16) 0%, transparent 70%);
      top: 15%;
      left: 50%;
      transform: translateX(-50%);
    }

    .glow-orb-bottom {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(255, 106, 0, 0.08) 0%, transparent 70%);
      bottom: 5%;
      right: 20%;
    }

    /* Translucent Glass Card */
    .glass-card {
      background: rgba(18, 18, 18, 0.65);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-top: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 20px;
      box-shadow: 
        0 24px 60px rgba(0, 0, 0, 0.75),
        0 0 40px rgba(255, 106, 0, 0.06);
      position: relative;
      z-index: 2;
    }

    /* Glass Input Styling */
    :host ::ng-deep .glass-input {
      background: rgba(255, 255, 255, 0.04) !important;
      border: 1px solid rgba(255, 255, 255, 0.12) !important;
      color: #ffffff !important;
      border-radius: 10px !important;
      transition: all 0.2s ease !important;
    }

    :host ::ng-deep .glass-input::placeholder {
      color: rgba(255, 255, 255, 0.35) !important;
    }

    :host ::ng-deep .glass-input:focus {
      background: rgba(255, 255, 255, 0.07) !important;
      border-color: #ff6a00 !important;
      box-shadow: 0 0 0 2px rgba(255, 106, 0, 0.25) !important;
    }

    :host ::ng-deep .input-invalid .glass-input,
    :host ::ng-deep .glass-input.ng-invalid.ng-dirty {
      border-color: rgba(239, 68, 68, 0.8) !important;
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
    }

    :host ::ng-deep .glass-password-wrapper {
      width: 100%;
    }

    :host ::ng-deep .glass-password-wrapper .p-password-toggle-mask-icon {
      color: rgba(255, 255, 255, 0.5) !important;
    }

    :host ::ng-deep .glass-password-wrapper .p-password-toggle-mask-icon:hover {
      color: #ff6a00 !important;
    }

    /* Glass Error Banner */
    .glass-error-banner {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.25);
      backdrop-filter: blur(8px);
    }

    /* Glass Submit Button */
    :host ::ng-deep .glass-submit-btn {
      background: #ff6a00 !important;
      border: 1px solid #ff6a00 !important;
      color: #ffffff !important;
      border-radius: 10px !important;
      box-shadow: 0 6px 20px rgba(255, 106, 0, 0.35) !important;
      transition: all 0.2s ease !important;
    }

    :host ::ng-deep .glass-submit-btn:hover:not(:disabled) {
      background: #ff7a1a !important;
      border-color: #ff7a1a !important;
      box-shadow: 0 8px 24px rgba(255, 106, 0, 0.5) !important;
      transform: translateY(-1px);
    }

    :host ::ng-deep .glass-submit-btn:disabled {
      background: rgba(255, 106, 0, 0.4) !important;
      border-color: transparent !important;
      color: rgba(255, 255, 255, 0.6) !important;
      box-shadow: none !important;
      cursor: not-allowed;
      pointer-events: none !important;
    }

    .animate-fade-in {
      animation: fadeIn 0.2s ease-in-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class AdminLoginComponent implements OnInit, OnDestroy {
  private readonly componentName = 'AdminLoginComponent';
  private readonly pageName = 'Admin Login';
  private readonly typingDebounceMs = 400;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private posthogService = inject(PosthogService);
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);

  loginForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  returnUrl: string = '/dashboard';

  private pageEnteredAtMs = 0;
  private hasTrackedPageExit = false;
  private lastPasswordUnmasked = false;
  private lastLoginButtonClickAt = 0;
  private subscriptions = new Subscription();

  private readonly fieldTypingSubjects: Record<LoginFieldName, Subject<string>> = {
    username: new Subject<string>(),
    password: new Subject<string>(),
  };

  private readonly fieldStates: Record<LoginFieldName, FieldTrackingState> = {
    username: {
      previousValue: '',
      lastCommittedValue: '',
      typingBurstCount: 0,
      lastValidationState: 'unknown',
    },
    password: {
      previousValue: '',
      lastCommittedValue: '',
      typingBurstCount: 0,
      lastValidationState: 'unknown',
    },
  };

  private removeWindowListeners: Array<() => void> = [];

  ngOnInit(): void {
    this.pageEnteredAtMs = this.nowMs();
    this.initForm();
    this.setupFieldTracking();
    this.setupWindowLifecycleListeners();
    this.trackPageEvent('admin_login_page_viewed');

    // If user is already authenticated, redirect appropriately
    if (this.authService.isAuthenticated()) {
      if (this.authService.isAdmin()) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/services']);
      }
      return;
    }

    // Capture return URL if passed from guard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
  }

  ngOnDestroy(): void {
    this.trackPageExit('navigation');
    this.subscriptions.unsubscribe();
    this.fieldTypingSubjects.username.complete();
    this.fieldTypingSubjects.password.complete();

    for (const remove of this.removeWindowListeners) {
      remove();
    }
    this.removeWindowListeners = [];
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      remember: [false]
    });
  }

  private setupFieldTracking(): void {
    const trackedFields: LoginFieldName[] = ['username', 'password'];

    for (const fieldName of trackedFields) {
      const control = this.loginForm.get(fieldName);
      if (!control) {
        continue;
      }

      // Subscribe to debounced typing outside Angular zone to avoid unnecessary change detection
      this.ngZone.runOutsideAngular(() => {
        const debounceSub = this.fieldTypingSubjects[fieldName]
          .pipe(debounceTime(this.typingDebounceMs))
          .subscribe((latestValue) => {
            this.handleDebouncedTyping(fieldName, latestValue);
          });
        this.subscriptions.add(debounceSub);
      });

      const valueSub = control.valueChanges.subscribe((rawVal) => {
        const value = typeof rawVal === 'string' ? rawVal : '';
        const state = this.fieldStates[fieldName];
        const prevLen = state.previousValue.length;
        const currLen = value.length;

        state.previousValue = value;

        if (prevLen > 0 && currLen === 0) {
          state.typingBurstCount = 0;
          state.lastCommittedValue = '';
          this.emitFieldInteraction('admin_login_field_cleared', fieldName, 'field_cleared', value);
          this.evaluateFieldValidation(fieldName, value);
          return;
        }

        if (currLen > 0) {
          state.typingBurstCount += 1;
          this.fieldTypingSubjects[fieldName].next(value);
        }
      });

      this.subscriptions.add(valueSub);
    }
  }

  private setupWindowLifecycleListeners(): void {
    if (!isPlatformBrowser(this.platformId) || typeof window === 'undefined') {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      const onFocus = () => this.trackPageEvent('admin_login_page_focused');
      const onBlur = () => this.trackPageEvent('admin_login_page_blurred');
      const onPageHide = () => this.trackPageExit('unload');

      window.addEventListener('focus', onFocus);
      window.addEventListener('blur', onBlur);
      window.addEventListener('pagehide', onPageHide);

      this.removeWindowListeners.push(
        () => window.removeEventListener('focus', onFocus),
        () => window.removeEventListener('blur', onBlur),
        () => window.removeEventListener('pagehide', onPageHide)
      );
    });
  }

  private handleDebouncedTyping(fieldName: LoginFieldName, value: string): void {
    const state = this.fieldStates[fieldName];
    if (!value.length) {
      return;
    }

    const burstCount = Math.max(1, state.typingBurstCount);
    state.typingBurstCount = 0;

    this.emitFieldInteraction('admin_login_field_typing', fieldName, 'field_typing', value, {
      typing_burst_events: burstCount,
    });

    if (value !== state.lastCommittedValue) {
      state.lastCommittedValue = value;
      this.emitFieldInteraction('admin_login_field_changed', fieldName, 'field_changed', value);
    }

    this.evaluateFieldValidation(fieldName, value);
  }

  onFieldFocus(fieldName: LoginFieldName): void {
    const value = this.getFieldStringValue(fieldName);
    this.emitFieldInteraction('admin_login_field_focused', fieldName, 'field_focused', value);
  }

  onFieldBlur(fieldName: LoginFieldName): void {
    const value = this.getFieldStringValue(fieldName);
    const state = this.fieldStates[fieldName];

    // If user typed and blurred before debounce window elapsed, record the committed change once
    if (value !== state.lastCommittedValue) {
      state.lastCommittedValue = value;
      state.typingBurstCount = 0;
      this.emitFieldInteraction('admin_login_field_changed', fieldName, 'field_changed', value);
    }

    this.emitFieldInteraction('admin_login_field_blurred', fieldName, 'field_blurred', value);
    this.evaluateFieldValidation(fieldName, value, true);
  }

  onPasswordToggleCheck(passwordRef: Password): void {
    this.ngZone.runOutsideAngular(() => {
      Promise.resolve().then(() => {
        const isVisible = Boolean(passwordRef?.unmasked);
        if (isVisible === this.lastPasswordUnmasked) {
          return;
        }
        this.lastPasswordUnmasked = isVisible;

        const passwordValue = this.getFieldStringValue('password');
        this.posthogService.trackInteraction('admin_password_visibility_toggled', {
          button_name: 'Toggle Password Visibility',
          button_type: 'toggle',
          field_name: 'password',
          component: this.componentName,
          page: this.getCurrentPagePath(),
          page_name: this.pageName,
          password_visible: isVisible,
          mask_state: isVisible ? 'visible' : 'hidden',
          value_length: passwordValue.length,
          is_empty: passwordValue.length === 0,
        });
      });
    });
  }

  onLoginButtonClick(): void {
    this.lastLoginButtonClickAt = Date.now();
    this.posthogService.trackButtonClick('admin_login_button_clicked', {
      button_name: 'Login',
      button_text: this.isLoading ? 'Signing In...' : 'Sign In',
      button_type: 'submit',
      component: this.componentName,
      page: this.getCurrentPagePath(),
      page_name: this.pageName,
      form_valid: this.loginForm.valid,
      form_dirty: this.loginForm.dirty,
      form_touched: this.loginForm.touched,
      button_enabled: !(this.isLoading || this.loginForm.invalid),
      is_loading: this.isLoading,
    });
  }

  onSubmitButtonAreaClick(): void {
    const isDisabled = this.isLoading || this.loginForm.invalid;
    if (!isDisabled || Date.now() - this.lastLoginButtonClickAt < 100) {
      return;
    }

    this.posthogService.trackButtonClick('admin_login_button_clicked', {
      button_name: 'Login',
      button_text: this.isLoading ? 'Signing In...' : 'Sign In',
      button_type: 'submit',
      component: this.componentName,
      page: this.getCurrentPagePath(),
      page_name: this.pageName,
      form_valid: this.loginForm.valid,
      form_dirty: this.loginForm.dirty,
      form_touched: this.loginForm.touched,
      button_enabled: false,
      is_loading: this.isLoading,
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    this.errorMessage = null;

    const submissionTimestamp = new Date().toISOString();
    const interactionId = this.posthogService.generateInteractionId();
    const formStats = this.collectFormSubmissionStats();

    this.posthogService.trackInteraction('admin_login_form_submitted', {
      interaction_id: interactionId,
      component: this.componentName,
      page: this.getCurrentPagePath(),
      page_name: this.pageName,
      form_valid: this.loginForm.valid,
      fields_completed: formStats.fieldsCompleted,
      total_fields: formStats.totalFields,
      validation_error_count: formStats.validationErrorCount,
      invalid_fields: formStats.invalidFields,
      submission_timestamp: submissionTimestamp,
      api_operation: 'POST /api/auth/login',
    });

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();

      this.posthogService.trackInteraction('admin_login_form_validation_failed', {
        interaction_id: interactionId,
        component: this.componentName,
        page: this.getCurrentPagePath(),
        page_name: this.pageName,
        form_valid: false,
        fields_completed: formStats.fieldsCompleted,
        total_fields: formStats.totalFields,
        validation_error_count: formStats.validationErrorCount,
        invalid_fields: formStats.invalidFields,
        field_errors: formStats.fieldErrors,
        submission_timestamp: submissionTimestamp,
      });

      for (const fieldName of formStats.invalidFields) {
        const value = this.getFieldStringValue(fieldName);
        this.emitFieldInteraction(
          'admin_login_field_validation_failed',
          fieldName,
          'field_validation_failed',
          value
        );
      }

      return;
    }

    this.isLoading = true;
    const { username, password, remember } = this.loginForm.value;

    this.authService
      .loginAdmin(username, password, remember, {
        interactionId,
        component: this.componentName,
        fieldsCompleted: formStats.fieldsCompleted,
        totalFields: formStats.totalFields,
        formValid: true,
        validationErrorCount: 0,
        submissionTimestamp,
      })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          const isAdmiinTeam = response.user.groups?.some(
            (x: any) => x.name === 'Admin Team'
          );

          console.log(isAdmiinTeam, "hi")
          if (isAdmiinTeam) {
            const target = this.returnUrl || '/dashboard';
            this.router.navigateByUrl(target);
          } else {
            const target = this.returnUrl && !this.returnUrl.includes('dashboard') ? this.returnUrl : '/services';
            this.router.navigateByUrl(target);
          }
        },
        error: (err) => {
          this.isLoading = false;
          if (err?.message === 'ACCESS_DENIED_NOT_ADMIN') {
            this.errorMessage = "You don't have permission to access the admin portal.";
          } else if (err?.message === 'INVALID_CREDENTIALS' || err?.status === 401) {
            this.errorMessage = 'Invalid email or password. Please verify your credentials.';
          } else if (err?.status === 403) {
            this.errorMessage = "You don't have permission to access the admin portal.";
          } else {
            this.errorMessage = 'Unable to sign in right now. Please try again.';
          }
        }
      });
  }

  forgotPasswordPrompt(): void {
    this.posthogService.trackButtonClick('admin_login_button_clicked', {
      button_name: 'Forgot Password',
      button_text: 'Forgot?',
      button_type: 'action',
      component: this.componentName,
      page: this.getCurrentPagePath(),
      page_name: this.pageName,
      form_valid: this.loginForm.valid,
      form_dirty: this.loginForm.dirty,
      form_touched: this.loginForm.touched,
      button_enabled: true,
      is_loading: this.isLoading,
    });

    this.errorMessage = 'Please contact the Cycle Service Center administrator to reset your credentials.';
  }

  private trackPageEvent(
    eventName: 'admin_login_page_viewed' | 'admin_login_page_focused' | 'admin_login_page_blurred'
  ): void {
    const authContext = this.authService.getAnalyticsContext();
    this.posthogService.trackInteraction(eventName, {
      component: this.componentName,
      page_name: this.pageName,
      page_path: this.getCurrentPagePath(),
      is_authenticated: authContext.isAuthenticated,
      authentication_status: authContext.isAuthenticated ? 'authenticated' : 'unauthenticated',
      user_role: authContext.userRole,
    });
  }

  private trackPageExit(exitReason: 'navigation' | 'unload'): void {
    if (this.hasTrackedPageExit) {
      return;
    }
    this.hasTrackedPageExit = true;

    const authContext = this.authService.getAnalyticsContext();
    const timeOnPageMs = Math.max(0, Math.round(this.nowMs() - this.pageEnteredAtMs));

    this.posthogService.trackInteraction('admin_login_page_exited', {
      component: this.componentName,
      page_name: this.pageName,
      page_path: this.getCurrentPagePath(),
      is_authenticated: authContext.isAuthenticated,
      authentication_status: authContext.isAuthenticated ? 'authenticated' : 'unauthenticated',
      user_role: authContext.userRole,
      time_on_page_ms: timeOnPageMs,
      exit_reason: exitReason,
    });
  }

  private evaluateFieldValidation(
    fieldName: LoginFieldName,
    value: string,
    forceEmitInvalid: boolean = false
  ): void {
    const control = this.loginForm.get(fieldName);
    if (!control) {
      return;
    }

    const state = this.fieldStates[fieldName];
    const errors = this.getControlErrorKeys(fieldName);

    if (control.valid) {
      if (state.lastValidationState !== 'valid') {
        state.lastValidationState = 'valid';
        this.emitFieldInteraction(
          'admin_login_field_validation_passed',
          fieldName,
          'field_validation_passed',
          value
        );
      }
      return;
    }

    const errorSignature = errors.join(',');
    if (forceEmitInvalid || state.lastValidationState !== errorSignature) {
      state.lastValidationState = errorSignature;
      this.emitFieldInteraction(
        'admin_login_field_validation_failed',
        fieldName,
        'field_validation_failed',
        value
      );
    }
  }

  private emitFieldInteraction(
    eventName:
      | 'admin_login_field_focused'
      | 'admin_login_field_blurred'
      | 'admin_login_field_changed'
      | 'admin_login_field_typing'
      | 'admin_login_field_cleared'
      | 'admin_login_field_validation_failed'
      | 'admin_login_field_validation_passed',
    fieldName: LoginFieldName,
    action: string,
    value: string,
    extra: { typing_burst_events?: number } = {}
  ): void {
    const control = this.loginForm.get(fieldName);
    const errors = this.getControlErrorKeys(fieldName);
    const isPassword = fieldName === 'password';
    const fieldType = isPassword ? 'password' : 'text';

    // Non-PII structural format classification for username/email field (never sends raw value)
    const inputFormat =
      !isPassword
        ? value.length === 0
          ? 'empty'
          : value.includes('@')
            ? 'email'
            : 'username'
        : undefined;

    this.posthogService.trackFieldInteraction(eventName, {
      field_name: fieldName,
      field_type: fieldType,
      input_type: fieldType,
      component: this.componentName,
      page: this.getCurrentPagePath(),
      action,
      value_type: typeof value,
      value_length: value.length,
      is_empty: value.length === 0,
      is_valid: Boolean(control?.valid),
      is_sensitive: true,
      ...(errors.length > 0 ? { validation_errors: errors } : {}),
      ...(inputFormat ? { input_format: inputFormat } : {}),
      ...(extra.typing_burst_events !== undefined
        ? { typing_burst_events: extra.typing_burst_events }
        : {}),
    });
  }

  private collectFormSubmissionStats(): {
    fieldsCompleted: number;
    totalFields: number;
    validationErrorCount: number;
    invalidFields: LoginFieldName[];
    fieldErrors: Record<string, string[]>;
  } {
    const fields: LoginFieldName[] = ['username', 'password'];
    let fieldsCompleted = 0;
    let validationErrorCount = 0;
    const invalidFields: LoginFieldName[] = [];
    const fieldErrors: Record<string, string[]> = {};

    for (const fieldName of fields) {
      const val = this.getFieldStringValue(fieldName);
      if (val.trim().length > 0) {
        fieldsCompleted += 1;
      }

      const errors = this.getControlErrorKeys(fieldName);
      if (errors.length > 0) {
        invalidFields.push(fieldName);
        fieldErrors[fieldName] = errors;
        validationErrorCount += errors.length;
      }
    }

    return {
      fieldsCompleted,
      totalFields: fields.length,
      validationErrorCount,
      invalidFields,
      fieldErrors,
    };
  }

  private getFieldStringValue(fieldName: LoginFieldName): string {
    const val = this.loginForm?.get(fieldName)?.value;
    return typeof val === 'string' ? val : '';
  }

  private getControlErrorKeys(fieldName: LoginFieldName): string[] {
    const errors = this.loginForm?.get(fieldName)?.errors;
    return errors ? Object.keys(errors) : [];
  }

  private getCurrentPagePath(): string {
    return this.posthogService.sanitizePath(this.router.url || '/admin/login');
  }

  private nowMs(): number {
    return typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
  }
}
