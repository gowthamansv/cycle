import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { LayoutService } from '../../layout/service/layout.service';

@Component({
  selector: 'app-service-activity-widget',
  standalone: true,
  imports: [CommonModule, ChartModule],
  template: `
    <div class="card p-5 mb-0 h-full shadow-sm border border-surface-200 dark:border-surface-700 flex flex-col justify-between">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 flex items-center gap-2">
            <i class="pi pi-chart-line text-orange-500"></i>
            Service Activity & Volume
          </h3>
          <p class="text-xs text-muted-color mt-0.5">Daily repairs, overhauls and tune-ups (Last 7 Days)</p>
        </div>
        <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
          +18.5% WoW
        </span>
      </div>

      <div class="w-full relative h-72 sm:h-80">
        <p-chart 
          type="line" 
          [data]="chartData" 
          [options]="chartOptions" 
          [responsive]="true" 
          styleClass="w-full h-full"
          [style]="{ height: '100%', width: '100%' }"
        ></p-chart>
      </div>
    </div>
  `
})
export class ServiceActivityWidget implements OnInit {
  private layoutService = inject(LayoutService);
  chartData: any;
  chartOptions: any;

  constructor() {
    effect(() => {
      // Re-init chart colors if dark mode changes
      const isDark = this.layoutService.isDarkTheme();
      this.initChart(isDark);
    });
  }

  ngOnInit(): void {
    this.initChart(this.layoutService.isDarkTheme());
  }

  initChart(isDark: boolean): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = isDark ? '#e2e8f0' : '#475569';
    const textColorSecondary = isDark ? '#94a3b8' : '#94a3b8';
    const surfaceBorder = isDark ? '#334155' : '#e2e8f0';

    this.chartData = {
      labels: ['Mon (Sep 14)', 'Tue (Sep 15)', 'Wed (Sep 16)', 'Thu (Sep 17)', 'Fri (Sep 18)', 'Sat (Sep 19)', 'Today (Sep 20)'],
      datasets: [
        {
          label: 'Completed Services',
          data: [8, 11, 14, 12, 19, 22, 15],
          fill: true,
          borderColor: '#ff6a00',
          backgroundColor: 'rgba(255, 106, 0, 0.12)',
          tension: 0.4,
          pointBackgroundColor: '#ff6a00',
          pointBorderColor: '#fff',
          pointHoverRadius: 6,
          pointRadius: 4
        },
        {
          label: 'Appointments Booked',
          data: [6, 9, 11, 10, 15, 18, 12],
          fill: false,
          borderColor: '#3b82f6',
          borderDash: [5, 5],
          tension: 0.4,
          pointBackgroundColor: '#3b82f6',
          pointRadius: 3
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: textColor,
            usePointStyle: true,
            boxWidth: 8,
            font: { size: 12, weight: 600 }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          padding: 10,
          cornerRadius: 6
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: { size: 11.5 }
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary,
            font: { size: 11.5 },
            stepSize: 5
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }
}
