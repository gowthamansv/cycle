import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { MiscService } from '../../services/misc.service';
import { TicketService } from '../../services/ticket.service';
import { MiscUser, TicketResponseDto } from '../../models/api.models';

@Component({
  selector: 'app-technician-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    ButtonModule,
    TagModule,
    CardModule
  ],
  template: `
    <div *ngIf="user; else notFound" class="flex flex-col gap-6">
      <!-- Profile Header -->
      <div class="bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-start gap-4">
          <div class="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-2xl border border-orange-500/20">
            {{ getUserInitials(user) }}
          </div>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">{{ getUserFullName(user) }}</h1>
              <p-tag value="Active Staff" severity="success"></p-tag>
            </div>
            <div class="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-0.5">Workshop Staff User</div>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-color mt-1">
              <span><i class="pi pi-id-card mr-1 text-[11px]"></i>ID: #{{ user.id ? (user.id.substring(0, 8) | uppercase) : 'N/A' }}</span>
              <span *ngIf="user.email"><i class="pi pi-envelope mr-1 text-[11px]"></i>{{ user.email }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <p-button
            label="Back"
            icon="pi pi-arrow-left"
            severity="secondary"
            [outlined]="true"
            routerLink="/technicians"
            size="small"
          ></p-button>
          <p-button
            label="+ Assign Service"
            icon="pi pi-wrench"
            routerLink="/services/new"
            size="small"
            styleClass="bg-orange-500 hover:bg-orange-600 border-none text-white font-semibold"
          ></p-button>
        </div>
      </div>

      <!-- Performance Metrics Grid -->
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-6 md:col-span-4">
          <div class="card p-4 mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
            <span class="text-xs text-muted-color uppercase font-semibold">Active Queue</span>
            <div class="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{{ activeJobsCount }} Tickets</div>
          </div>
        </div>

        <div class="col-span-6 md:col-span-4">
          <div class="card p-4 mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
            <span class="text-xs text-muted-color uppercase font-semibold">Completed Services</span>
            <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{{ completedJobsCount }} Tickets</div>
          </div>
        </div>

        <div class="col-span-12 md:col-span-4">
          <div class="card p-4 mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
            <span class="text-xs text-muted-color uppercase font-semibold">Total Assigned</span>
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{{ assignedJobs.length }} Tickets</div>
          </div>
        </div>
      </div>

      <!-- Assigned Jobs Queue Table -->
      <div class="card p-5 shadow-sm border border-surface-200 dark:border-surface-700">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 uppercase tracking-wider flex items-center gap-2">
              <i class="pi pi-wrench text-orange-500"></i>
              Current Assigned Tickets Queue
            </h3>
            <p class="text-xs text-muted-color">Live tickets assigned to {{ getUserFullName(user) }} from GET /api/tickets</p>
          </div>
        </div>

        <p-table [value]="assignedJobs" responsiveLayout="scroll" styleClass="p-datatable-sm">
          <ng-template #header>
            <tr>
              <th>Ticket ID</th>
              <th>Customer</th>
              <th>Bicycle</th>
              <th>Service Scope</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </ng-template>
          <ng-template #body let-t>
            <tr>
              <td>
                <span class="font-mono text-xs font-bold text-primary">
                  #{{ t.id ? (t.id.substring(0, 8) | uppercase) : 'TCK' }}
                </span>
              </td>
              <td>
                <div class="font-semibold text-sm text-surface-900 dark:text-surface-0">{{ t.customerName || 'Customer' }}</div>
                <div class="text-xs text-muted-color">{{ t.contactPhone || '—' }}</div>
              </td>
              <td>
                <div class="text-xs font-medium text-surface-800 dark:text-surface-200">{{ t.cycleModel || 'Bicycle' }}</div>
                <div *ngIf="t.serialNumber" class="text-[11px] text-muted-color font-mono">{{ t.serialNumber }}</div>
              </td>
              <td>
                <div class="text-xs truncate max-w-[200px]">{{ t.udF6 || t.description || 'General Service' }}</div>
              </td>
              <td>
                <p-tag [value]="t.priority || 'Normal'" severity="info"></p-tag>
              </td>
              <td>
                <p-tag [value]="t.status || 'Active'" [severity]="t.status === 'Completed' ? 'success' : 'warn'"></p-tag>
              </td>
              <td>
                <span class="text-xs text-muted-color font-mono">{{ t.createdAt | date:'short' }}</span>
              </td>
            </tr>
          </ng-template>
          <ng-template #emptymessage>
            <tr>
              <td colspan="7" class="text-center p-8 text-muted-color">
                <i class="pi pi-inbox text-3xl mb-2 block"></i>
                No service tickets currently assigned to this staff member.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <ng-template #notFound>
      <div class="card text-center p-12">
        <i class="pi pi-user-times text-5xl text-surface-400 mb-3"></i>
        <h3 class="text-lg font-bold text-surface-900 dark:text-surface-0">Staff Profile Not Found</h3>
        <p class="text-sm text-muted-color mb-4">The technician or staff record could not be found.</p>
        <p-button label="Back to Technicians" icon="pi pi-arrow-left" routerLink="/technicians"></p-button>
      </div>
    </ng-template>
  `
})
export class TechnicianDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private miscService = inject(MiscService);
  private ticketService = inject(TicketService);

  user: MiscUser | null = null;
  assignedJobs: TicketResponseDto[] = [];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadUser(id);
      }
    });
  }

  loadUser(id: string): void {
    const existing = this.miscService.users().find(u => u.id === id);
    if (existing) {
      this.user = existing;
    } else {
      this.miscService.getUsers().subscribe({
        next: (users) => {
          this.user = (users || []).find(u => u.id === id) || null;
        }
      });
    }

    this.ticketService.getTickets().subscribe({
      next: (tickets) => {
        this.assignedJobs = (tickets || []).filter(t => t.assigneeId === id);
      },
      error: () => {
        this.assignedJobs = [];
      }
    });
  }

  get activeJobsCount(): number {
    return this.assignedJobs.filter(t => {
      const s = (t.status || '').toLowerCase();
      return !s.includes('complete') && !s.includes('closed');
    }).length;
  }

  get completedJobsCount(): number {
    return this.assignedJobs.filter(t => {
      const s = (t.status || '').toLowerCase();
      return s.includes('complete') || s.includes('closed');
    }).length;
  }

  getUserFullName(user: MiscUser): string {
    const parts = [user.firstName, user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : (user.email || 'Staff Member');
  }

  getUserInitials(user: MiscUser): string {
    const first = user.firstName ? user.firstName.charAt(0).toUpperCase() : '';
    const last = user.lastName ? user.lastName.charAt(0).toUpperCase() : '';
    return first + last || (user.email ? user.email.charAt(0).toUpperCase() : 'S');
  }
}
