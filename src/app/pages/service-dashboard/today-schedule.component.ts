import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TicketService } from '../../services/ticket.service';
import { TicketResponseDto } from '../../models/api.models';
import { AuthService } from '../../common/services/auth.service';
import { PosthogService } from '../../services/posthog.service';

@Component({
  selector: 'app-today-schedule-widget',
  standalone: true,
  imports: [CommonModule, RouterModule, TagModule, ButtonModule, TooltipModule],
  template: `
    <div class="card p-4 mb-0 h-full shadow-sm border border-surface-200 dark:border-surface-700 flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 flex items-center gap-2">
              <i class="pi pi-calendar text-orange-500"></i>
              Incoming Service Intake
            </h3>
            <p class="text-xs text-muted-color">New & recently assigned tickets awaiting technician bench</p>
          </div>
          <a routerLink="/services" (click)="trackDashboardNav('View All Services', '/services')" class="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            View All <i class="pi pi-arrow-right text-[10px]"></i>
          </a>
        </div>

        <div class="space-y-3 mt-2 overflow-y-auto max-h-[300px] pr-1">
          <div
            *ngFor="let ticket of intakeQueue()"
            class="p-3 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50/70 dark:bg-surface-800/40 hover:border-orange-300 dark:hover:border-orange-600 transition-colors"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-start gap-2.5">
                <div class="bg-orange-500/10 text-orange-600 dark:text-orange-400 font-mono text-xs font-bold px-2 py-1 rounded">
                  #{{ ticket.id ? (ticket.id.substring(0, 6) | uppercase) : 'TCK' }}
                </div>
                <div>
                  <div class="font-bold text-sm text-surface-900 dark:text-surface-0">{{ ticket.customerName || 'Customer' }}</div>
                  <div class="text-xs text-muted-color flex items-center gap-1 mt-0.5">
                    <i class="pi pi-compass text-[10px]"></i> {{ ticket.cycleModel || 'Bicycle' }}
                  </div>
                  <div class="text-xs font-medium text-surface-700 dark:text-surface-300 mt-1">
                    {{ ticket.udF6 || ticket.description || 'General Service' }}
                  </div>
                </div>
              </div>

              <div class="flex flex-col items-end gap-1">
                <p-tag
                  [value]="ticket.status || 'Active'"
                  [severity]="getStatusSeverity(ticket.status)"
                  [rounded]="true"
                  styleClass="text-[10px] px-2 py-0.5"
                ></p-tag>
                <span class="text-[11px] text-muted-color flex items-center gap-1">
                  <i class="pi pi-user text-[9px]"></i> {{ ticket.assigneeName || 'Unassigned' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="intakeQueue().length === 0" class="text-center py-10 text-muted-color text-xs flex flex-col items-center">
            <i class="pi pi-calendar-times text-3xl mb-2 text-surface-400"></i>
            <div class="font-medium text-surface-700 dark:text-surface-300">No New Intake Tickets</div>
            <p class="text-[11px] text-muted-color mt-1 max-w-xs">
              Appointments endpoint (GET /api/appointments) is not supported by the backend API. Displaying real intake tickets from GET /api/tickets.
            </p>
          </div>
        </div>
      </div>

      <div class="pt-3 border-t border-surface-200 dark:border-surface-700 mt-3 flex items-center justify-between text-xs text-muted-color">
        <span>Backend Source: GET /api/tickets</span>
        <a routerLink="/services/new" (click)="trackDashboardNav('New Service', '/services/new')" class="text-primary hover:underline font-semibold flex items-center gap-1">
          + New Service
        </a>
      </div>
    </div>
  `
})
export class TodayScheduleWidget {
  private ticketService = inject(TicketService);
  private authService = inject(AuthService);
  private posthogService = inject(PosthogService);

  trackDashboardNav(menuName: string, destination: string): void {
    this.posthogService.trackMenuClick(
      'dashboard_menu_clicked',
      {
        menuName,
        menuLocation: 'Dashboard Intake Widget',
        destination,
      },
      this.authService.getAnalyticsContext()
    );
  }

  // Derive incoming queue from actual backend tickets (e.g. New or Assigned or recent)
  intakeQueue = computed(() => {
    const list = this.ticketService.tickets();
    return list.filter(t => {
      const s = (t.status || '').toLowerCase();
      return s.includes('new') || s.includes('assign') || s.includes('waiting');
    }).slice(0, 5);
  });

  getStatusSeverity(status?: string | null): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const s = (status || '').toLowerCase();
    if (s.includes('complete')) return 'success';
    if (s.includes('progress')) return 'warn';
    if (s.includes('assign')) return 'info';
    if (s.includes('new') || s.includes('waiting')) return 'secondary';
    return 'info';
  }
}
