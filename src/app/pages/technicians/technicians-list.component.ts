import { Component, OnInit, inject } from '@angular/core';
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
import { CycleDataService } from '../../services/cycle-data.service';
import { Technician, TechnicianAvailability } from '../../models/cycle-management.models';
import { UserService } from '../../services/user.service';
import { MiscService } from '../../services/misc.service';
import { AuthService } from '../../common/services/auth.service';
import { AppNotificationService } from '../../common/services/notification.service';
import { CreateUserRequest } from '../../models/api.models';

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
              {{ filteredTechnicians.length }} Staff Members
            </span>
          </div>
          <p class="text-sm text-muted-color mt-1">Manage workshop staff, mechanical specializations, certifications and active queue capacities.</p>
        </div>

        <div class="flex items-center gap-3" *ngIf="authService.isAdmin()">
          <p-button
            label="+ Add Staff / User"
            icon="pi pi-user-plus"
            (click)="openAddUserModal()"
          ></p-button>
        </div>
      </div>

      <!-- Quick Metrics Ribbon -->
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-6 sm:col-span-3">
          <div class="card p-3 mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <div>
              <span class="text-xs text-muted-color uppercase font-semibold">Active Staff</span>
              <div class="text-xl font-bold text-surface-900 dark:text-surface-0">{{ dataService.technicians().length }}</div>
            </div>
            <div class="w-8 h-8 rounded bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
              <i class="pi pi-users"></i>
            </div>
          </div>
        </div>

        <div class="col-span-6 sm:col-span-3">
          <div class="card p-3 mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <div>
              <span class="text-xs text-muted-color uppercase font-semibold">On Bench / Working</span>
              <div class="text-xl font-bold text-amber-600 dark:text-amber-400">{{ getCountByAvailability('On Job') }}</div>
            </div>
            <div class="w-8 h-8 rounded bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
              <i class="pi pi-wrench"></i>
            </div>
          </div>
        </div>

        <div class="col-span-6 sm:col-span-3">
          <div class="card p-3 mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <div>
              <span class="text-xs text-muted-color uppercase font-semibold">Available</span>
              <div class="text-xl font-bold text-emerald-600 dark:text-emerald-400">{{ getCountByAvailability('Available') }}</div>
            </div>
            <div class="w-8 h-8 rounded bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
              <i class="pi pi-check-circle"></i>
            </div>
          </div>
        </div>

        <div class="col-span-6 sm:col-span-3">
          <div class="card p-3 mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <div>
              <span class="text-xs text-muted-color uppercase font-semibold">Avg Rating</span>
              <div class="text-xl font-bold text-purple-600 dark:text-purple-400">4.85 ★</div>
            </div>
            <div class="w-8 h-8 rounded bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600">
              <i class="pi pi-star-fill"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Technicians Table -->
      <div class="card p-0 shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
        <p-table
          [value]="filteredTechnicians"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 15, 20]"
          [rowHover]="true"
          responsiveLayout="scroll"
          styleClass="p-datatable-sm"
        >
          <ng-template #header>
            <tr>
              <th pSortableColumn="name" style="min-width: 14rem">Technician <p-sortIcon field="name"></p-sortIcon></th>
              <th style="min-width: 15rem">Specialization</th>
              <th pSortableColumn="activeJobsCount" style="min-width: 8rem" class="text-center">Active Jobs <p-sortIcon field="activeJobsCount"></p-sortIcon></th>
              <th pSortableColumn="completedJobsCount" style="min-width: 9rem" class="text-center">Completed <p-sortIcon field="completedJobsCount"></p-sortIcon></th>
              <th pSortableColumn="availability" style="min-width: 9rem">Availability <p-sortIcon field="availability"></p-sortIcon></th>
              <th pSortableColumn="status" style="min-width: 7.5rem">Status <p-sortIcon field="status"></p-sortIcon></th>
              <th style="min-width: 8rem" class="text-center">Actions</th>
            </tr>
          </ng-template>

          <ng-template #body let-tech>
            <tr>
              <td>
                <div class="flex items-center gap-3">
                  <img [src]="tech.avatar" [alt]="tech.name" class="w-10 h-10 rounded-full border border-surface-200 dark:border-surface-700 object-cover" />
                  <div>
                    <a [routerLink]="['/technicians', tech.id]" class="font-bold text-surface-900 dark:text-surface-0 text-sm hover:text-primary hover:underline">
                      {{ tech.name }}
                    </a>
                    <div class="text-[11px] text-muted-color">{{ tech.email }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="text-xs font-semibold text-surface-800 dark:text-surface-200">{{ tech.specialization }}</div>
                <div class="text-[11px] text-muted-color truncate max-w-[200px]">{{ tech.certification || 'Certified Bike Tech' }}</div>
              </td>
              <td class="text-center">
                <span class="inline-flex items-center justify-center font-bold text-xs bg-orange-100 dark:bg-orange-950/60 text-orange-600 px-2.5 py-0.5 rounded-full">
                  {{ tech.activeJobsCount }}
                </span>
              </td>
              <td class="text-center">
                <span class="font-semibold text-xs text-surface-700 dark:text-surface-300">
                  {{ tech.completedJobsCount }}
                </span>
              </td>
              <td>
                <p-tag
                  [value]="tech.availability"
                  [severity]="getAvailabilitySeverity(tech.availability)"
                  [rounded]="true"
                  styleClass="text-xs"
                ></p-tag>
              </td>
              <td>
                <p-tag
                  [value]="tech.status"
                  [severity]="tech.status === 'Active' ? 'success' : 'secondary'"
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
                    pTooltip="View Profile & Workload"
                    [routerLink]="['/technicians', tech.id]"
                  ></p-button>
                  <p-button
                    icon="pi pi-sync"
                    [rounded]="true"
                    [text]="true"
                    severity="info"
                    size="small"
                    pTooltip="Toggle Shift State"
                    (click)="toggleAvailability(tech)"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template #emptymessage>
            <tr>
              <td colspan="7" class="text-center p-8 text-muted-color">
                <i class="pi pi-user-times text-4xl mb-3 block text-surface-400"></i>
                No technician profiles found.
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
            <input pInputText [(ngModel)]="newUser.firstName" placeholder="Jane" class="w-full" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Last Name *</label>
            <input pInputText [(ngModel)]="newUser.lastName" placeholder="Smith" class="w-full" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Email Address *</label>
            <input pInputText type="email" [(ngModel)]="newUser.email" placeholder="jane.smith@freewheel.com" class="w-full" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Phone Number *</label>
            <input pInputText [(ngModel)]="newUser.phoneNumber" placeholder="+1 (555) 999-8888" class="w-full" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Password</label>
          <input pInputText type="password" [(ngModel)]="newUser.password" placeholder="Temporary password" class="w-full" />
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
  protected dataService = inject(CycleDataService);
  protected userService = inject(UserService);
  protected miscService = inject(MiscService);
  protected authService = inject(AuthService);
  private notificationService = inject(AppNotificationService);

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
    this.loadLookups();
  }

  private loadLookups(): void {
    this.miscService.getRoles().subscribe({
      next: (roles) => {
        this.roleOptions = roles.map(r => ({ label: r.name, value: r.id }));
        if (this.roleOptions.length > 0 && this.newUser.roleIds.length === 0) {
          this.newUser.roleIds = [this.roleOptions[0].value];
        }
      },
      error: () => {
        this.roleOptions = [
          { label: 'Admin', value: 'c90538a7-7be6-4443-8ce0-ebfe701fa001' },
          { label: 'Employee', value: 'c90538a7-7be6-4443-8ce0-ebfe701fa002' },
          { label: 'User', value: 'c90538a7-7be6-4443-8ce0-ebfe701fa003' }
        ];
      }
    });

    this.miscService.getGroups().subscribe({
      next: (groups) => {
        this.groupOptions = groups.map(g => ({ label: g.name, value: g.id }));
      },
      error: () => {}
    });
  }

  get filteredTechnicians(): Technician[] {
    return this.dataService.technicians();
  }

  getCountByAvailability(avail: TechnicianAvailability): number {
    return this.dataService.technicians().filter(t => t.availability === avail).length;
  }

  getAvailabilitySeverity(avail: TechnicianAvailability): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (avail) {
      case 'Available': return 'success';
      case 'On Job': return 'warn';
      case 'On Break': return 'info';
      case 'Off Duty': return 'secondary';
      default: return 'info';
    }
  }

  toggleAvailability(tech: Technician): void {
    const next: TechnicianAvailability = tech.availability === 'Available' ? 'On Job' :
                                         tech.availability === 'On Job' ? 'On Break' :
                                         tech.availability === 'On Break' ? 'Available' : 'Available';

    this.dataService.updateTechnicianStatus(tech.id, next);
    tech.availability = next;
    this.notificationService.showInfo(
      'Status Updated',
      `${tech.name} marked as "${next}".`
    );
  }

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
      next: (res) => {
        this.isSubmitting = false;
        this.addUserDialogVisible = false;

        this.notificationService.showApiSuccess(
          'create',
          'Staff User',
          `Staff member ${this.newUser.firstName} ${this.newUser.lastName} registered successfully on backend!`
        );

        // Refresh user lookups
        this.miscService.getUsers().subscribe();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.notificationService.handleApiError('create staff user', err);
      }
    });
  }
}
