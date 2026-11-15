import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { LayoutService } from '../../layout/service/layout.service';
import { TicketService } from '../../services/ticket.service';

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
              Live API Metrics
            </span>
          </div>
          <p class="text-sm text-muted-color mt-1">Operational breakdown and workload distribution calculated from actual service tickets.</p>
        </div>
      </div>

      <!-- Real Data State -->
      <div *ngIf="ticketService.tickets().length > 0; else noData" class="grid grid-cols-12 gap-6">
        <div class="col-span-12 lg:col-span-6">
          <div class="card p-5 shadow-sm border border-surface-200 dark:border-surface-700">
            <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 mb-3 flex items-center gap-2">
              <i class="pi pi-chart-pie text-orange-500"></i>
              Tickets by Priority
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
              Tickets by Status
            </h3>
            <div class="h-64">
              <p-chart type="bar" [data]="barData" [options]="barOptions" styleClass="h-full"></p-chart>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <ng-template #noData>
        <div class="card text-center p-12 border border-surface-200 dark:border-surface-700">
          <i class="pi pi-chart-bar text-5xl text-surface-400 mb-3"></i>
          <h3 class="text-lg font-bold text-surface-900 dark:text-surface-0">No Analytics Data Available</h3>
          <p class="text-sm text-muted-color max-w-md mx-auto mt-1">
            Reporting and volume charts require active service tickets from GET /api/tickets.
            Once tickets are created in the system, analytics will automatically populate.
          </p>
        </div>
      </ng-template>
    </div>
  `
})
export class ReportsDashboardComponent implements OnInit {
  private layoutService = inject(LayoutService);
  protected ticketService = inject(TicketService);

  pieData: any;
  pieOptions: any;
  barData: any;
  barOptions: any;

  ngOnInit(): void {
    this.ticketService.getTickets().subscribe({
      next: (tickets) => {
        this.buildCharts(tickets || []);
      }
    });
  }

  buildCharts(tickets: any[]): void {
    if (tickets.length === 0) return;

    const isDark = this.layoutService.isDarkTheme();
    const textColor = isDark ? '#e2e8f0' : '#475569';
    const surfaceBorder = isDark ? '#334155' : '#e2e8f0';

    // Priority breakdown
    const priorityCounts: Record<string, number> = {};
    for (const t of tickets) {
      const p = t.priority || 'Normal';
      priorityCounts[p] = (priorityCounts[p] || 0) + 1;
    }

    this.pieData = {
      labels: Object.keys(priorityCounts),
      datasets: [
        {
          data: Object.values(priorityCounts),
          backgroundColor: ['#ff6a00', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444']
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

    // Status breakdown
    const statusCounts: Record<string, number> = {};
    for (const t of tickets) {
      const s = t.status || 'Active';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    }

    this.barData = {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          label: 'Ticket Count',
          backgroundColor: '#ff6a00',
          data: Object.values(statusCounts)
        }
      ]
    };

    this.barOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: surfaceBorder }
        },
        y: {
          ticks: { color: textColor, stepSize: 1 },
          beginAtZero: true,
          grid: { color: surfaceBorder }
        }
      }
    };
  }
}
