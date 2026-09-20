import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { StatsWidget } from '../dashboard/components/statswidget';
import { ServiceTodayJobsWidget } from './service-today-jobs.component';
import { ServiceActivityWidget } from './service-activity.component';
import { TodayScheduleWidget } from './today-schedule.component';

@Component({
  selector: 'app-service-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    StatsWidget,
    ServiceTodayJobsWidget,
    ServiceActivityWidget,
    TodayScheduleWidget
  ],
  template: `
    <div class="flex flex-col gap-6">
      <!-- Operational Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">Good morning, Admin</h1>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
              Live Workshop
            </span>
          </div>
          <p class="text-sm text-muted-color mt-1">Here's what's happening in your service center today.</p>
        </div>

        <div class="flex items-center gap-3">
          <p-button
            label="+ New Appointment"
            icon="pi pi-calendar-plus"
            [outlined]="true"
            routerLink="/appointments/new"
            size="small"
          ></p-button>
          <p-button
            label="+ Add Service"
            icon="pi pi-wrench"
            routerLink="/services/new"
            size="small"
          ></p-button>
        </div>
      </div>

      <!-- KPI Metrics Grid -->
      <div class="grid grid-cols-12 gap-6">
        <app-stats-widget class="contents"></app-stats-widget>
      </div>

      <!-- Today's Live Service Jobs -->
      <app-service-today-jobs></app-service-today-jobs>

      <!-- Bottom Split: Service Activity Chart + Today's Schedule -->
      <div class="grid grid-cols-12 gap-6">
        <div class="col-span-12 xl:col-span-7">
          <app-service-activity-widget></app-service-activity-widget>
        </div>
        <div class="col-span-12 xl:col-span-5">
          <app-today-schedule-widget></app-today-schedule-widget>
        </div>
      </div>
    </div>
  `
})
export class ServiceDashboardComponent {}
