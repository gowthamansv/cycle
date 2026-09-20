import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CycleDataService } from '../../services/cycle-data.service';
import { Appointment, AppointmentStatus } from '../../models/cycle-management.models';

@Component({
  selector: 'app-today-schedule-widget',
  standalone: true,
  imports: [CommonModule, RouterModule, TagModule, ButtonModule, TooltipModule],
  template: `
    <div class="card p-4 mb-0 h-full shadow-sm border border-surface-200 dark:border-surface-700">
      <div class="flex items-center justify-between mb-3">
        <div>
          <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 flex items-center gap-2">
            <i class="pi pi-calendar text-orange-500"></i>
            Today's Schedule
          </h3>
          <p class="text-xs text-muted-color">Upcoming service drop-offs & inspections</p>
        </div>
        <a routerLink="/appointments" class="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
          View All <i class="pi pi-arrow-right text-[10px]"></i>
        </a>
      </div>

      <div class="space-y-3 mt-2 overflow-y-auto max-h-[300px] pr-1">
        <div
          *ngFor="let apt of todaysAppointments; let last = last"
          class="p-3 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50/70 dark:bg-surface-800/40 hover:border-orange-300 dark:hover:border-orange-600 transition-colors"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-start gap-2.5">
              <div class="bg-orange-500/10 text-orange-600 dark:text-orange-400 font-mono text-xs font-bold px-2 py-1 rounded">
                {{ apt.time }}
              </div>
              <div>
                <div class="font-bold text-sm text-surface-900 dark:text-surface-0">{{ apt.customerName }}</div>
                <div class="text-xs text-muted-color flex items-center gap-1 mt-0.5">
                  <i class="pi pi-compass text-[10px]"></i> {{ apt.cycleModel }} ({{ apt.cycleType }})
                </div>
                <div class="text-xs font-medium text-surface-700 dark:text-surface-300 mt-1">
                  {{ apt.serviceType }}
                </div>
              </div>
            </div>

            <div class="flex flex-col items-end gap-1">
              <p-tag
                [value]="apt.status"
                [severity]="getStatusSeverity(apt.status)"
                [rounded]="true"
                styleClass="text-[10px] px-2 py-0.5"
              ></p-tag>
              <span class="text-[11px] text-muted-color flex items-center gap-1">
                <i class="pi pi-user text-[9px]"></i> {{ apt.technicianName }}
              </span>
            </div>
          </div>
        </div>

        <div *ngIf="todaysAppointments.length === 0" class="text-center py-8 text-muted-color text-xs">
          <i class="pi pi-calendar-times text-2xl mb-1 block"></i>
          No appointments scheduled for today.
        </div>
      </div>
    </div>
  `
})
export class TodayScheduleWidget {
  private dataService = inject(CycleDataService);

  get todaysAppointments(): Appointment[] {
    return this.dataService.appointments().filter(a => a.date === '2026-09-20');
  }

  getStatusSeverity(status: AppointmentStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Service': return 'warn';
      case 'Confirmed': return 'info';
      case 'Scheduled': return 'secondary';
      case 'Cancelled': return 'danger';
      case 'No Show': return 'danger';
      default: return 'info';
    }
  }
}
