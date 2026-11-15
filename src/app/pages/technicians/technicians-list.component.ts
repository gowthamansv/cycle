import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { UserService } from '../../services/user.service';
import { MiscService } from '../../services/misc.service';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../common/services/auth.service';
import { AppNotificationService } from '../../common/services/notification.service';
import { CreateUserRequest, MiscUser } from '../../models/api.models';

@Component({
  selector: 'app-technicians-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    TagModule,
    DialogModule,
    TooltipModule,
    MessageModule
  ],
  template: `
    <div class="flex flex-col gap-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">Technicians & Mechanics</h1>
            <span class="text-xs px-2.5 py-1 rounded-full font-semibold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
              {{ users().length }} Staff Members
            </span>
          </div>
          <p class="text-sm text-muted-color mt-1">Live workshop staff directory and active ticket assignments powered by <code class="font-mono text-xs bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded">/api/misc/users</code>.</p>
        </div>

        <div class="flex items-center gap-3" *ngIf="authService.isAdmin()">
          <p-button
            label="Refresh"
            icon="pi pi-refresh"
            [outlined]="true"
            severity="secondary"
            size="small"
            [loading]="miscService.isLoading()"
            (click)="loadStaff()"
          ></p-button>

          <p-button
            label="+ Add Staff / User"
            icon="pi pi-user-plus"
            (click)="openAddUserModal()"
            styleClass="bg-orange-500 hover:bg-orange-600 border-none text-white font-semibold shadow-sm"
            size="small"
          ></p-button>
        </div>
      </div>

      <!-- Quick Metrics Ribbon -->
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-6 sm:col-span-3">
          <div class="card p-3 mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <div>
              <span class="text-xs text-muted-color uppercase font-semibold">Total Staff</span>
              <div class="text-xl font-bold text-surface-900 dark:text-surface-0">{{ users().length }}</div>
            </div>
            <div class="w-8 h-8 rounded bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
              <i class="pi pi-users"></i>
            </div>
          </div>
        </div>

        <div class="col-span-6 sm:col-span-3">
          <div class="card p-3 mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <div>
              <span class="text-xs text-muted-color uppercase font-semibold">Staff With Active Tasks</span>
              <div class="text-xl font-bold text-amber-600 dark:text-amber-400">{{ staffWithActiveJobsCount() }}</div>
            </div>
            <div class="w-8 h-8 rounded bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
              <i class="pi pi-wrench"></i>
            </div>
          </div>
        </div>

        <div class="col-span-6 sm:col-span-3">
          <div class="card p-3 mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <div>
              <span class="text-xs text-muted-color uppercase font-semibold">Available Staff</span>
              <div class="text-xl font-bold text-emerald-600 dark:text-emerald-400">{{ availableStaffCount() }}</div>
            </div>
            <div class="w-8 h-8 rounded bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
              <i class="pi pi-check-circle"></i>
            </div>
          </div>
        </div>

        <div class="col-span-6 sm:col-span-3">
          <div class="card p-3 mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <div>
              <span class="text-xs text-muted-color uppercase font-semibold">Assigned Tickets</span>
              <div class="text-xl font-bold text-purple-600 dark:text-purple-400">{{ totalAssignedTicketsCount() }}</div>
            </div>
            <div class="w-8 h-8 rounded bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600">
              <i class="pi pi-ticket"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Technicians Table -->
      <div class="card p-0 shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
        <p-table
          [value]="users()"
          [loading]="miscService.isLoading()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 15, 20]"
          [rowHover]="true"
          responsiveLayout="scroll"
          styleClass="p-datatable-sm"
        >
          <ng-template #header>
            <tr>
              <th style="min-width: 14rem">Staff Member</th>
              <th style="min-width: 14rem">Email Address</th>
              <th style="min-width: 8rem" class="text-center">Active Jobs</th>
              <th style="min-width: 9rem" class="text-center">Completed</th>
              <th style="min-width: 8rem">Status</th>
              <th style="min-width: 8rem" class="text-center">Actions</th>
            </tr>
          </ng-template>

          <ng-template #body let-user>
            <tr>
              <td>
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center text-xs shrink-0">
                    {{ getUserInitials(user) }}
                  </div>
                  <div>
                    <a [routerLink]="['/technicians', user.id]" class="font-bold text-surface-900 dark:text-surface-0 text-sm hover:text-primary hover:underline">
                      {{ getUserFullName(user) }}
                    </a>
                    <div class="text-[11px] text-muted-color font-mono">ID: #{{ user.id ? (user.id.substring(0, 8) | uppercase) : 'N/A' }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="text-xs font-mono text-surface-800 dark:text-surface-200">{{ user.email || '—' }}</div>
              </td>
              <td class="text-center">
                <span class="inline-flex items-center justify-center font-bold text-xs bg-orange-100 dark:bg-orange-950/60 text-orange-600 px-2.5 py-0.5 rounded-full">
                  {{ getActiveJobsForUser(user.id) }}
                </span>
              </td>
              <td class="text-center">
                <span class="font-semibold text-xs text-surface-700 dark:text-surface-300">
                  {{ getCompletedJobsForUser(user.id) }}
                </span>
              </td>
              <td>
                <p-tag
                  value="Active Staff"
                  severity="success"
                  styleClass="text-xs"
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
                    pTooltip="View Staff Profile & Workload"
                    [routerLink]="['/technicians', user.id]"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template #emptymessage>
            <tr>
              <td colspan="6" class="text-center p-8 text-muted-color">
                <i class="pi pi-user-times text-4xl mb-3 block text-surface-400"></i>
                <div class="font-medium text-surface-700 dark:text-surface-300">No staff members found.</div>
                <div class="text-xs text-muted-color mt-1">No user records currently returned by GET /api/misc/users.</div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Add Staff / User Modal (Live Backend POST /api/users) -->
    <p-dialog
      [(visible)]="addUserDialogVisible"
      header="Register New Staff / User (Backend Linked)"
      [modal]="true"
      [style]="{ width: '90vw', maxWidth: '560px' }"
      [draggable]="false"
    >
      <div class="space-y-4 pt-2">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">First Name *</label>
            <input pInputText [(ngModel)]="newUser.firstName" placeholder="First Name" class="w-full" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Last Name *</label>
            <input pInputText [(ngModel)]="newUser.lastName" placeholder="Last Name" class="w-full" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Email Address *</label>
            <input pInputText type="email" [(ngModel)]="newUser.email" placeholder="staff@example.com" class="w-full" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Phone Number *</label>
            <input pInputText [(ngModel)]="newUser.phoneNumber" placeholder="+1 (555) 000-0000" class="w-full" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Password *</label>
          <input pInputText type="password" [(ngModel)]="newUser.password" placeholder="At least 8 characters" class="w-full" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Roles (from /api/misc/roles) *</label>
          <p-multiselect
            [options]="roleOptions"
            [(ngModel)]="newUser.roleIds"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Roles"
            styleClass="w-full"
          ></p-multiselect>
        </div>

        <div>
          <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Groups / Departments (from /api/misc/groups)</label>
          <p-multiselect
            [options]="groupOptions"
            [(ngModel)]="newUser.groupIds"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Workshop Groups"
            styleClass="w-full"
          ></p-multiselect>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <p-button label="Cancel" severity="secondary" [outlined]="true" [disabled]="isSubmitting" (click)="addUserDialogVisible = false"></p-button>
          <p-button label="Create User" icon="pi pi-check" [loading]="isSubmitting" (click)="saveUser()"></p-button>
        </div>
      </div>
    </p-dialog>
  `
})
export class TechniciansListComponent implements OnInit {
  protected userService = inject(UserService);
  protected miscService = inject(MiscService);
  protected ticketService = inject(TicketService);
  protected authService = inject(AuthService);
  private notificationService = inject(AppNotificationService);

  users = this.miscService.users;
  tickets = this.ticketService.tickets;

  addUserDialogVisible = false;
  isSubmitting = false;

  newUser = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    roleIds: [] as string[],
    groupIds: [] as string[]
  };

  roleOptions: { label: string; value: string }[] = [];
  groupOptions: { label: string; value: string }[] = [];

  ngOnInit(): void {
    this.loadStaff();
    this.loadLookups();
  }

  loadStaff(): void {
    this.miscService.getUsers().subscribe();
    this.ticketService.getTickets().subscribe();
  }

  private loadLookups(): void {
    this.miscService.getRoles().subscribe({
      next: (roles) => {
        this.roleOptions = (roles || []).map(r => ({ label: r.name, value: r.id }));
        if (this.roleOptions.length > 0 && this.newUser.roleIds.length === 0) {
          this.newUser.roleIds = [this.roleOptions[0].value];
        }
      },
      error: () => {
        this.roleOptions = [];
      }
    });

    this.miscService.getGroups().subscribe({
      next: (groups) => {
        this.groupOptions = (groups || []).map(g => ({ label: g.name, value: g.id }));
      },
      error: () => {
        this.groupOptions = [];
      }
    });
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

  getActiveJobsForUser(userId: string): number {
    return this.tickets().filter(t => {
      if (t.assigneeId !== userId) return false;
      const s = (t.status || '').toLowerCase();
      return !s.includes('complete') && !s.includes('closed');
    }).length;
  }

  getCompletedJobsForUser(userId: string): number {
    return this.tickets().filter(t => {
      if (t.assigneeId !== userId) return false;
      const s = (t.status || '').toLowerCase();
      return s.includes('complete') || s.includes('closed');
    }).length;
  }

  staffWithActiveJobsCount = computed(() => {
    const staffIds = new Set(
      this.tickets()
        .filter(t => {
          const s = (t.status || '').toLowerCase();
          return !s.includes('complete') && !s.includes('closed') && !!t.assigneeId;
        })
        .map(t => t.assigneeId)
    );
    return staffIds.size;
  });

  availableStaffCount = computed(() => {
    const total = this.users().length;
    const busy = this.staffWithActiveJobsCount();
    return Math.max(0, total - busy);
  });

  totalAssignedTicketsCount = computed(() => {
    return this.tickets().filter(t => !!t.assigneeId).length;
  });

  openAddUserModal(): void {
    this.newUser = {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      roleIds: this.roleOptions.length > 0 ? [this.roleOptions[0].value] : [],
      groupIds: []
    };
    this.addUserDialogVisible = true;
  }

  saveUser(): void {
    if (!this.newUser.firstName.trim() || !this.newUser.email.trim() || !this.newUser.phoneNumber.trim()) {
      this.notificationService.showWarning(
        'Incomplete Details',
        'First Name, Email, and Phone Number are required.'
      );
      return;
    }

    this.isSubmitting = true;
    const reqPayload: CreateUserRequest = {
      firstName: this.newUser.firstName.trim(),
      lastName: this.newUser.lastName.trim(),
      email: this.newUser.email.trim(),
      phoneNumber: this.newUser.phoneNumber.trim(),
      password: this.newUser.password.trim() || 'Temporary123!',
      roleIds: this.newUser.roleIds,
      groupIds: this.newUser.groupIds
    };

    this.userService.createUser(reqPayload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.addUserDialogVisible = false;

        this.notificationService.showApiSuccess(
          'create',
          'Staff User',
          `Staff member ${this.newUser.firstName} ${this.newUser.lastName} registered successfully on backend!`
        );

        // Refresh user list
        this.miscService.getUsers().subscribe();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.notificationService.handleApiError('create staff user', err);
      }
    });
  }
}
