import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { StatsWidget } from '../dashboard/components/statswidget';
import { ServiceTodayJobsWidget } from './service-today-jobs.component';
import { ServiceActivityWidget } from './service-activity.component';
import { TodayScheduleWidget } from './today-schedule.component';
import { TicketService } from '../../services/ticket.service';
import { MiscService } from '../../services/misc.service';

@Component({
  selector: 'app-service-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TooltipModule,
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
            <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">Workshop Operations Dashboard</h1>
            
          </div>
          <p class="text-sm text-muted-color mt-1">Live bicycle service center data streaming directly from backend API endpoints.</p>
        </div>

        <div class="flex items-center gap-3">
          <p-button
            label="Refresh Data"
            icon="pi pi-refresh"
            [outlined]="true"
            severity="secondary"
            size="small"
            [loading]="ticketService.isLoading() || miscService.isLoading()"
            (click)="refreshAll()"
          ></p-button>

          <p-button
            label="+ Add Service"
            icon="pi pi-wrench"
            routerLink="/services/new"
            size="small"
            styleClass="bg-orange-500 hover:bg-orange-600 border-none text-white font-semibold"
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
export class ServiceDashboardComponent implements OnInit {
  protected ticketService = inject(TicketService);
  protected miscService = inject(MiscService);

  ngOnInit(): void {
    this.refreshAll();
  }

  refreshAll(): void {
    this.ticketService.getTickets().subscribe();
    this.miscService.getCustomers().subscribe();
    this.miscService.getUsers().subscribe();
    this.miscService.getStatuses().subscribe();
    this.miscService.getPriorities().subscribe();
  }
}
