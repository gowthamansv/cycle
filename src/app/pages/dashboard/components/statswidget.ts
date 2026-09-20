import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CycleDataService } from '../../../services/cycle-data.service';

@Component({
  selector: 'app-stats-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
      <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700 hover:shadow-md transition-shadow">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-2 text-sm uppercase tracking-wider">Today's Appointments</span>
            <div class="text-surface-900 dark:text-surface-0 font-bold text-3xl">{{ dataService.todaysAppointmentsCount() }}</div>
          </div>
          <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-950/60 rounded-xl" style="width: 2.75rem; height: 2.75rem">
            <i class="pi pi-calendar-plus text-orange-600 dark:text-orange-400 text-xl"></i>
          </div>
        </div>
        <div class="flex items-center text-xs">
          <span class="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center mr-1">
            <i class="pi pi-arrow-up text-xs mr-0.5"></i>+12%
          </span>
          <span class="text-muted-color">vs yesterday</span>
        </div>
      </div>
    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
      <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700 hover:shadow-md transition-shadow">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-2 text-sm uppercase tracking-wider">Active Service Jobs</span>
            <div class="text-surface-900 dark:text-surface-0 font-bold text-3xl">{{ dataService.activeServiceJobsCount() }}</div>
          </div>
          <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-950/60 rounded-xl" style="width: 2.75rem; height: 2.75rem">
            <i class="pi pi-wrench text-blue-600 dark:text-blue-400 text-xl"></i>
          </div>
        </div>
        <div class="flex items-center text-xs">
          <span class="text-blue-600 dark:text-blue-400 font-semibold mr-1">4 Techs active</span>
          <span class="text-muted-color">in workshop</span>
        </div>
      </div>
    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
      <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700 hover:shadow-md transition-shadow">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-2 text-sm uppercase tracking-wider">Completed Services</span>
            <div class="text-surface-900 dark:text-surface-0 font-bold text-3xl">{{ dataService.completedServicesTodayCount() }}</div>
          </div>
          <div class="flex items-center justify-center bg-emerald-100 dark:bg-emerald-950/60 rounded-xl" style="width: 2.75rem; height: 2.75rem">
            <i class="pi pi-check-circle text-emerald-600 dark:text-emerald-400 text-xl"></i>
          </div>
        </div>
        <div class="flex items-center text-xs">
          <span class="text-emerald-600 dark:text-emerald-400 font-semibold mr-1">100% QA pass</span>
          <span class="text-muted-color">ready for pickup</span>
        </div>
      </div>
    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
      <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700 hover:shadow-md transition-shadow">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-2 text-sm uppercase tracking-wider">Today's Revenue</span>
            <div class="text-surface-900 dark:text-surface-0 font-bold text-3xl">\${{ dataService.todaysRevenue() | number:'1.2-2' }}</div>
          </div>
          <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-950/60 rounded-xl" style="width: 2.75rem; height: 2.75rem">
            <i class="pi pi-dollar text-purple-600 dark:text-purple-400 text-xl"></i>
          </div>
        </div>
        <div class="flex items-center text-xs">
          <span class="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center mr-1">
            <i class="pi pi-arrow-up text-xs mr-0.5"></i>+8.4%
          </span>
          <span class="text-muted-color">from labor & parts</span>
        </div>
      </div>
    </div>
  `
})
export class StatsWidget {
  protected dataService = inject(CycleDataService);
}
