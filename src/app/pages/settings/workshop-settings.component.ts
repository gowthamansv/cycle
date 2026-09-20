import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-workshop-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ToggleSwitchModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="max-w-4xl mx-auto flex flex-col gap-6">
      <!-- Header -->
      <div class="bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">Workshop Settings</h1>
          <p class="text-sm text-muted-color mt-1">Configure service center parameters, SMS notifications, and operating hours.</p>
        </div>
      </div>

      <!-- Settings Card -->
      <div class="card p-6 md:p-8 shadow-sm border border-surface-200 dark:border-surface-700 space-y-6">
        <div>
          <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 mb-3 flex items-center gap-2">
            <i class="pi pi-building text-orange-500"></i>
            Service Center Information
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Center Name</label>
              <input pInputText [(ngModel)]="centerName" class="w-full" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Facility Phone</label>
              <input pInputText [(ngModel)]="facilityPhone" class="w-full" />
            </div>
          </div>
        </div>

        <div class="border-t border-surface-200 dark:border-surface-700 pt-5">
          <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 mb-3 flex items-center gap-2">
            <i class="pi pi-bell text-orange-500"></i>
            Notification Preferences
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
          <p-button label="Save Preferences" icon="pi pi-check" (click)="save()"></p-button>
        </div>
      </div>
    </div>
  `
})
export class WorkshopSettingsComponent {
  private messageService = inject(MessageService);

  centerName = 'Cycle Service Hub - Main Workshop #01';
  facilityPhone = '+1 (555) 789-0011';
  smsAlerts = true;
  lowStockAlerts = true;

  save(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Settings Saved',
      detail: 'Workshop configuration updated successfully.'
    });
  }
}
