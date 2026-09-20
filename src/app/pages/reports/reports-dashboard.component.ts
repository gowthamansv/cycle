import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { LayoutService } from '../../layout/service/layout.service';
import { CycleDataService } from '../../services/cycle-data.service';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, ChartModule, CardModule],
  template: `
    <div class="flex flex-col gap-6">
      <!-- Header -->
      <div class="bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">Reports & Workshop Analytics</h1>
            <span class="text-xs px-2.5 py-1 rounded-full font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
              Q3 2026
            </span>
          </div>
          <p class="text-sm text-muted-color mt-1">Operational performance, revenue breakdown by discipline, and repair turnaround metrics.</p>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-12 gap-6">
        <div class="col-span-12 lg:col-span-6">
          <div class="card p-5 shadow-sm border border-surface-200 dark:border-surface-700">
            <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 mb-3 flex items-center gap-2">
              <i class="pi pi-chart-pie text-orange-500"></i>
              Service Breakdown by Discipline
            </h3>
            <div class="h-64 flex justify-center">
              <p-chart type="doughnut" [data]="pieData" [options]="pieOptions" styleClass="h-full"></p-chart>
            </div>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-6">
          <div class="card p-5 shadow-sm border border-surface-200 dark:border-surface-700">
            <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 mb-3 flex items-center gap-2">
              <i class="pi pi-chart-bar text-orange-500"></i>
              Monthly Revenue vs Workshop Labor Hours
            </h3>
            <div class="h-64">
              <p-chart type="bar" [data]="barData" [options]="barOptions" styleClass="h-full"></p-chart>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportsDashboardComponent implements OnInit {
  private layoutService = inject(LayoutService);
  protected dataService = inject(CycleDataService);

  pieData: any;
  pieOptions: any;
  barData: any;
  barOptions: any;

  ngOnInit(): void {
    const isDark = this.layoutService.isDarkTheme();
    const textColor = isDark ? '#e2e8f0' : '#475569';
    const surfaceBorder = isDark ? '#334155' : '#e2e8f0';

    this.pieData = {
      labels: ['Road', 'Mountain / Enduro', 'Gravel', 'E-Bikes', 'Other / Commuter'],
      datasets: [
        {
          data: [35, 30, 20, 10, 5],
          backgroundColor: ['#ff6a00', '#3b82f6', '#10b981', '#8b5cf6', '#64748b']
        }
      ]
    };

    this.pieOptions = {
      plugins: {
        legend: {
          position: 'right',
          labels: { color: textColor, font: { size: 12 } }
        }
      }
    };

    this.barData = {
      labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep'],
      datasets: [
        {
          label: 'Revenue ($)',
          backgroundColor: '#ff6a00',
          data: [4200, 5800, 6900, 7400, 8100]
        },
        {
          label: 'Labor Hours (hrs)',
          backgroundColor: '#3b82f6',
          data: [120, 160, 190, 205, 220]
        }
      ]
    };

    this.barOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: textColor } }
      },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: surfaceBorder }
        },
        y: {
          ticks: { color: textColor },
          grid: { color: surfaceBorder }
        }
      }
    };
  }
}
