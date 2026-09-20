import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { AuthService } from '../../common/services/auth.service';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';

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
                class="h-12 w-auto object-contain drop-shadow-md"
                onerror="this.style.display='none'"
              />
            </div>
            
            <span class="text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff6a00] block mb-1">
              Cycle Service Center
            </span>
            <h1 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Login
            </h1>
           
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
                Email or Username
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
              ></p-password>
              <small *ngIf="isFieldInvalid('password')" class="text-red-400 text-xs block mt-1">
                <span *ngIf="loginForm.get('password')?.hasError('required')">Password is required.</span>
                <span *ngIf="loginForm.get('password')?.hasError('minlength')">Password must be at least 4 characters.</span>
              </small>
            </div>

            <!-- Remember Me & Security Status -->
            <div class="flex items-center justify-between pt-1">
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
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
              <p-button 
                type="submit" 
                [label]="isLoading ? 'Signing In...' : 'Sign In'" 
                [icon]="isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'" 
                [loading]="isLoading"
                [disabled]="isLoading || loginForm.invalid"
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
export class AdminLoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  returnUrl: string = '/dashboard';

  ngOnInit(): void {
    this.initForm();

    // If user is already authenticated as admin, redirect to dashboard
    if (this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Capture return URL if passed from guard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      remember: [false]
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    this.errorMessage = null;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { username, password, remember } = this.loginForm.value;

    this.authService.loginAdmin(username, password, remember).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.user.role === 'admin') {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.errorMessage = "You don't have permission to access the admin portal.";
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
    this.errorMessage = 'Please contact the Cycle Service Center administrator to reset your credentials.';
  }
}
