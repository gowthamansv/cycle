import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../common/services/auth.service';

@Component({
  selector: 'app-workshop-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    ToggleSwitchModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in">
      <!-- Header -->
      <div class="bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">
              {{ authService.isAdmin() ? 'Workshop & System Settings' : 'User Account & Preferences' }}
            </h1>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
              {{ authService.isAdmin() ? 'Admin Configuration' : 'User Profile' }}
            </span>
          </div>
          <p class="text-sm text-muted-color mt-1">
            {{ authService.isAdmin() 
              ? 'Configure service center parameters, SMS alerts, and workshop operating rules.' 
              : 'Manage your profile details, security password, and personal notification preferences.' }}
          </p>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- USER ROLE SETTINGS: PROFILE, PASSWORD, PREFERENCES        -->
      <!-- ========================================================= -->
      <div *ngIf="!authService.isAdmin()" class="card p-6 md:p-8 shadow-sm border border-surface-200 dark:border-surface-700 space-y-6">
        <!-- Profile Section -->
        <div>
          <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 mb-3 flex items-center gap-2">
            <i class="pi pi-user text-orange-500"></i>
            Personal Profile
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Full Name</label>
              <input pInputText [(ngModel)]="userProfile.name" class="w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Email Address</label>
              <input pInputText type="email" [(ngModel)]="userProfile.email" class="w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Contact Phone</label>
              <input pInputText [(ngModel)]="userProfile.phone" placeholder="+1 (555) 019-2834" class="w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Assigned Facility</label>
              <input pInputText [(ngModel)]="userProfile.facility" [disabled]="true" class="w-full opacity-80" />
            </div>
          </div>
        </div>

        <!-- Password Change Section -->
        <div class="border-t border-surface-200 dark:border-surface-700 pt-5">
          <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 mb-3 flex items-center gap-2">
            <i class="pi pi-lock text-orange-500"></i>
            Change Password
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-muted-color uppercase mb-1">New Password</label>
              <p-password 
                [(ngModel)]="userPassword.newPassword" 
                [toggleMask]="true" 
                [feedback]="false"
                [fluid]="true"
                placeholder="Enter new password"
              ></p-password>
            </div>
            <div>
              <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Confirm New Password</label>
              <p-password 
                [(ngModel)]="userPassword.confirmPassword" 
                [toggleMask]="true" 
                [feedback]="false"
                [fluid]="true"
                placeholder="Confirm new password"
              ></p-password>
            </div>
          </div>
        </div>

        <!-- Personal Preferences -->
        <div class="border-t border-surface-200 dark:border-surface-700 pt-5">
          <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 mb-3 flex items-center gap-2">
            <i class="pi pi-bell text-orange-500"></i>
            User Notifications
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800/60">
              <div>
                <div class="font-semibold text-xs text-surface-900 dark:text-surface-0">Job Status Audio Alerts</div>
                <div class="text-[11px] text-muted-color">Play subtle notification sound on new ticket assignment.</div>
              </div>
              <p-toggleswitch [(ngModel)]="userPreferences.soundAlerts"></p-toggleswitch>
            </div>

            <div class="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800/60">
              <div>
                <div class="font-semibold text-xs text-surface-900 dark:text-surface-0">Email Ticket Digest</div>
                <div class="text-[11px] text-muted-color">Receive daily summary of created rider services.</div>
              </div>
              <p-toggleswitch [(ngModel)]="userPreferences.emailDigest"></p-toggleswitch>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-4 border-t border-surface-200 dark:border-surface-700">
          <p-button label="Update Profile & Preferences" icon="pi pi-check" (click)="saveUserSettings()"></p-button>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- ADMIN ROLE SETTINGS: WORKSHOP & SYSTEM CONFIGURATION      -->
      <!-- ========================================================= -->
      <div *ngIf="authService.isAdmin()" class="card p-6 md:p-8 shadow-sm border border-surface-200 dark:border-surface-700 space-y-6">
        <div>
          <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 mb-3 flex items-center gap-2">
            <i class="pi pi-building text-orange-500"></i>
            Service Center Information
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Center Name</label>
              <input pInputText [(ngModel)]="centerName" class="w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Facility Phone</label>
              <input pInputText [(ngModel)]="facilityPhone" class="w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Operating Hours</label>
              <input pInputText [(ngModel)]="operatingHours" class="w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Service Hub ID</label>
              <input pInputText [(ngModel)]="hubId" [disabled]="true" class="w-full opacity-80" />
            </div>
          </div>
        </div>

        <div class="border-t border-surface-200 dark:border-surface-700 pt-5">
          <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 mb-3 flex items-center gap-2">
            <i class="pi pi-bell text-orange-500"></i>
            System Notifications & Alerts
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800/60">
              <div>
                <div class="font-semibold text-xs text-surface-900 dark:text-surface-0">Customer SMS Completion Alerts</div>
                <div class="text-[11px] text-muted-color">Send automatic text message when bicycle service is marked 'Completed'.</div>
              </div>
              <p-toggleswitch [(ngModel)]="smsAlerts"></p-toggleswitch>
            </div>

            <div class="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800/60">
              <div>
                <div class="font-semibold text-xs text-surface-900 dark:text-surface-0">Low Inventory Automated Warnings</div>
                <div class="text-[11px] text-muted-color">Notify workshop manager when brake pads or fluids fall below reorder thresholds.</div>
              </div>
              <p-toggleswitch [(ngModel)]="lowStockAlerts"></p-toggleswitch>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-4 border-t border-surface-200 dark:border-surface-700">
          <p-button label="Save Workshop Configuration" icon="pi pi-check" (click)="saveAdminSettings()"></p-button>
        </div>
      </div>
    </div>
  `
})
export class WorkshopSettingsComponent implements OnInit {
  protected authService = inject(AuthService);
  private messageService = inject(MessageService);

  // Admin Configuration
  centerName = 'Cycle Service Hub - Main Workshop #01';
  facilityPhone = '+1 (555) 789-0011';
  operatingHours = 'Mon - Sat: 8:00 AM - 7:00 PM';
  hubId = 'FACILITY-MAIN-01';
  smsAlerts = true;
  lowStockAlerts = true;

  // User Configuration
  userProfile = {
    name: 'Service Staff User',
    email: 'user@cycleservice.com',
    phone: '+1 (555) 345-6789',
    facility: 'Main Service Hub #01'
  };

  userPassword = {
    newPassword: '',
    confirmPassword: ''
  };

  userPreferences = {
    soundAlerts: true,
    emailDigest: false
  };

  ngOnInit(): void {
    const curr = this.authService.currentUser();
    if (curr) {
      this.userProfile.name = curr.name || this.userProfile.name;
      this.userProfile.email = curr.email || this.userProfile.email;
      this.userProfile.facility = curr.facility || this.userProfile.facility;
    }
  }

  saveUserSettings(): void {
    if (this.userPassword.newPassword && this.userPassword.newPassword !== this.userPassword.confirmPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Password Mismatch',
        detail: 'New password and confirmation do not match.'
      });
      return;
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Preferences Updated',
      detail: 'Your user profile and settings have been saved.'
    });

    this.userPassword = { newPassword: '', confirmPassword: '' };
  }

  saveAdminSettings(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Workshop Saved',
      detail: 'Service center system configuration updated successfully.'
    });
  }
}
