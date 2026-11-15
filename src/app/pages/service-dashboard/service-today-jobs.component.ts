import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { TicketService } from '../../services/ticket.service';
import { TicketResponseDto } from '../../models/api.models';

@Component({
  selector: 'app-service-today-jobs',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    TagModule,
    ButtonModule,
    DialogModule,
    TooltipModule
  ],
  template: `
    <div class="card p-4 mb-6 shadow-sm border border-surface-200 dark:border-surface-700">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 class="text-lg font-bold text-surface-900 dark:text-surface-0 flex items-center gap-2">
            <i class="pi pi-wrench text-orange-500"></i>
            Live Workshop Service Tickets
          </h3>
          <p class="text-xs text-muted-color">Actual service tickets from backend API (GET /api/tickets)</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-200 px-2.5 py-1 rounded-full font-medium">
            {{ tickets().length }} Total Tickets
          </span>
          <p-button
            icon="pi pi-refresh"
            [rounded]="true"
            [text]="true"
            severity="secondary"
            size="small"
            pTooltip="Refresh Tickets"
            (click)="refreshTickets()"
            [loading]="ticketService.isLoading()"
          ></p-button>
        </div>
      </div>

      <p-table
        [value]="tickets()"
        [loading]="ticketService.isLoading()"
        [paginator]="true"
        [rows]="5"
        [rowsPerPageOptions]="[5, 10, 15, 20]"
        [rowHover]="true"
        [responsiveLayout]="'stack'"
        breakpoint="768px"
        styleClass="p-datatable-sm"
      >
        <ng-template #header>
          <tr>
            <th style="min-width: 7rem">Ticket ID</th>
            <th style="min-width: 10rem">Customer</th>
            <th style="min-width: 12rem">Bicycle</th>
            <th style="min-width: 13rem">Service Description</th>
            <th style="min-width: 9rem">Technician</th>
            <th style="min-width: 7rem">Priority</th>
            <th style="min-width: 8rem">Status</th>
            <th style="min-width: 6rem" class="text-center">Action</th>
          </tr>
        </ng-template>
        <ng-template #body let-ticket>
          <tr>
            <td>
              <span class="font-mono text-xs font-semibold text-primary cursor-pointer hover:underline" (click)="viewTicketDetails(ticket)">
                #{{ ticket.id ? (ticket.id.substring(0, 8) | uppercase) : 'N/A' }}
              </span>
            </td>
            <td>
              <div class="font-medium text-surface-900 dark:text-surface-0 text-sm">{{ ticket.customerName || 'Customer' }}</div>
              <div class="text-xs text-muted-color">{{ ticket.contactPhone || '—' }}</div>
            </td>
            <td>
              <div class="text-sm font-semibold text-surface-800 dark:text-surface-100">{{ ticket.cycleModel || 'Bicycle' }}</div>
              <span *ngIf="ticket.serialNumber" class="inline-block text-[11px] px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-muted-color font-mono">
                S/N: {{ ticket.serialNumber }}
              </span>
            </td>
            <td>
              <div class="text-sm text-surface-800 dark:text-surface-100 line-clamp-1" [pTooltip]="ticket.udF6 || ticket.description || 'General Service'">
                {{ ticket.udF6 || ticket.description || 'General Service' }}
              </div>
              <div *ngIf="ticket.udF1" class="text-[11px] text-muted-color">Condition: {{ ticket.udF1 }}</div>
            </td>
            <td>
              <div class="flex items-center gap-1.5 text-xs text-surface-700 dark:text-surface-200">
                <i class="pi pi-user text-muted-color text-[11px]"></i>
                {{ ticket.assigneeName || 'Unassigned' }}
              </div>
            </td>
            <td>
              <p-tag
                [value]="ticket.priority || 'Normal'"
                [severity]="getPrioritySeverity(ticket.priority)"
                [rounded]="true"
                styleClass="text-[11px] px-2 py-0.5"
              ></p-tag>
            </td>
            <td>
              <p-tag
                [value]="ticket.status || 'Active'"
                [severity]="getStatusSeverity(ticket.status)"
                [rounded]="true"
                styleClass="text-[11px] px-2 py-0.5"
              ></p-tag>
            </td>
            <td class="text-center">
              <div class="flex items-center justify-center gap-1">
                <p-button
                  icon="pi pi-eye"
                  [rounded]="true"
                  [text]="true"
                  severity="secondary"
                  size="small"
                  pTooltip="View Details"
                  tooltipPosition="top"
                  (click)="viewTicketDetails(ticket)"
                ></p-button>
                <p-button
                  icon="pi pi-arrow-right"
                  [rounded]="true"
                  [text]="true"
                  severity="primary"
                  size="small"
                  pTooltip="Open in Services"
                  tooltipPosition="top"
                  routerLink="/services"
                ></p-button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr>
            <td colspan="8" class="text-center p-8 text-muted-color">
              <i class="pi pi-inbox text-4xl mb-2 block text-surface-400"></i>
              <div class="font-medium text-surface-700 dark:text-surface-300">No service tickets available</div>
              <div class="text-xs text-muted-color mt-1">There are currently no active tickets returned by GET /api/tickets.</div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Ticket Detail Modal -->
    <p-dialog
      [(visible)]="ticketDialogVisible"
      [header]="'Ticket Details • #' + (selectedTicket?.id ? (selectedTicket!.id.substring(0, 8) | uppercase) : '')"
      [modal]="true"
      [style]="{ width: '90vw', maxWidth: '600px' }"
      [draggable]="false"
      [resizable]="false"
    >
      <div *ngIf="selectedTicket" class="space-y-4 text-sm pt-2">
        <div class="grid grid-cols-2 gap-4 p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
          <div>
            <div class="text-xs text-muted-color">Customer</div>
            <div class="font-bold text-surface-900 dark:text-surface-0">{{ selectedTicket.customerName || 'Customer' }}</div>
            <div class="text-xs text-muted-color">{{ selectedTicket.contactPhone || '—' }}</div>
            <div *ngIf="selectedTicket.contactEmail" class="text-xs text-muted-color">{{ selectedTicket.contactEmail }}</div>
          </div>
          <div>
            <div class="text-xs text-muted-color">Bicycle</div>
            <div class="font-bold text-surface-900 dark:text-surface-0">{{ selectedTicket.cycleModel || 'Bicycle' }}</div>
            <div *ngIf="selectedTicket.serialNumber" class="text-xs text-muted-color font-mono">S/N: {{ selectedTicket.serialNumber }}</div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div class="p-2.5 rounded border border-surface-200 dark:border-surface-700">
            <div class="text-[11px] text-muted-color uppercase">Technician</div>
            <div class="font-medium text-surface-800 dark:text-surface-100">{{ selectedTicket.assigneeName || 'Unassigned' }}</div>
          </div>
          <div class="p-2.5 rounded border border-surface-200 dark:border-surface-700">
            <div class="text-[11px] text-muted-color uppercase">Priority</div>
            <div class="font-medium text-surface-800 dark:text-surface-100">{{ selectedTicket.priority || 'Normal' }}</div>
          </div>
          <div class="p-2.5 rounded border border-surface-200 dark:border-surface-700">
            <div class="text-[11px] text-muted-color uppercase">Status</div>
            <div class="font-bold text-surface-900 dark:text-surface-0">{{ selectedTicket.status || 'Active' }}</div>
          </div>
        </div>

        <div *ngIf="selectedTicket.udF6 || selectedTicket.description">
          <div class="text-xs font-semibold text-muted-color mb-1">Service & Work Scope</div>
          <div class="p-3 bg-surface-100 dark:bg-surface-800 rounded text-surface-800 dark:text-surface-200">
            <div class="font-medium">{{ selectedTicket.udF6 || selectedTicket.description }}</div>
            <p *ngIf="selectedTicket.udF1" class="mt-2 text-xs text-muted-color border-t border-surface-200 dark:border-surface-700 pt-1.5">
              <strong>Intake Condition:</strong> {{ selectedTicket.udF1 }}
            </p>
            <p *ngIf="selectedTicket.udF2" class="mt-1 text-xs text-muted-color">
              <strong>Defects / Damage:</strong> {{ selectedTicket.udF2 }}
            </p>
          </div>
        </div>

        <div class="text-xs text-muted-color flex justify-between border-t border-surface-200 dark:border-surface-700 pt-3">
          <span>Created: {{ selectedTicket.createdAt | date:'medium' }}</span>
          <span *ngIf="selectedTicket.updatedAt">Updated: {{ selectedTicket.updatedAt | date:'medium' }}</span>
        </div>

        <div class="flex justify-end pt-2">
          <p-button
            label="Close"
            severity="secondary"
            [outlined]="true"
            size="small"
            (click)="ticketDialogVisible = false"
          ></p-button>
          <p-button
            label="Manage in Services"
            icon="pi pi-arrow-right"
            size="small"
            routerLink="/services"
            styleClass="ml-2"
            (click)="ticketDialogVisible = false"
          ></p-button>
        </div>
      </div>
    </p-dialog>
  `
})
export class ServiceTodayJobsWidget {
  protected ticketService = inject(TicketService);

  tickets = this.ticketService.tickets;
  ticketDialogVisible = false;
  selectedTicket: TicketResponseDto | null = null;

  refreshTickets(): void {
    this.ticketService.getTickets().subscribe();
  }

  getStatusSeverity(status?: string | null): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const s = (status || '').toLowerCase();
    if (s.includes('complete') || s.includes('closed') || s.includes('done')) return 'success';
    if (s.includes('progress') || s.includes('working')) return 'warn';
    if (s.includes('assign')) return 'info';
    if (s.includes('new') || s.includes('waiting')) return 'secondary';
    if (s.includes('cancel')) return 'danger';
    return 'info';
  }

  getPrioritySeverity(priority?: string | null): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const p = (priority || '').toLowerCase();
    if (p.includes('urgent') || p.includes('critical')) return 'danger';
    if (p.includes('high')) return 'warn';
    if (p.includes('med')) return 'info';
    if (p.includes('low')) return 'secondary';
    return 'info';
  }

  viewTicketDetails(ticket: TicketResponseDto): void {
    this.selectedTicket = ticket;
    this.ticketDialogVisible = true;
  }
}
