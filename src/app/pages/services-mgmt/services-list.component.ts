import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { DrawerModule } from 'primeng/drawer';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CycleDataService } from '../../services/cycle-data.service';
import { ServiceTicket, TicketStatus, TicketPriority } from '../../models/cycle-management.models';

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    ToggleSwitchModule,
    TooltipModule,
    DrawerModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast></p-toast>
    <p-confirmdialog></p-confirmdialog>

    <div class="flex flex-col gap-6">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">Services</h1>
            <span class="text-xs px-2.5 py-1 rounded-full font-semibold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
              {{ filteredTickets.length }} Records
            </span>
          </div>
          <p class="text-sm text-muted-color mt-1">Manage bicycle maintenance and repair services.</p>
        </div>

        <div class="flex items-center gap-3">
          <p-button
            label="+ Add Service"
            icon="pi pi-plus"
            routerLink="/services/new"
          ></p-button>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="card p-4 shadow-sm border border-surface-200 dark:border-surface-700">
        <div class="grid grid-cols-12 gap-4 items-end">
          <div class="col-span-12 md:col-span-4">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Search Service / Customer / Bike</label>
            <div class="relative w-full">
              <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-color"></i>
              <input
                pInputText
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Search ticket, customer, bike, S/N..."
                class="w-full pl-9"
              />
            </div>
          </div>

          <div class="col-span-12 sm:col-span-6 md:col-span-3">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Category</label>
            <p-select
              [options]="categoryOptions"
              [(ngModel)]="selectedCategory"
              placeholder="All Categories"
              [showClear]="true"
              styleClass="w-full"
            ></p-select>
          </div>

          <div class="col-span-12 sm:col-span-6 md:col-span-3">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Status</label>
            <p-select
              [options]="statusOptions"
              [(ngModel)]="selectedStatus"
              placeholder="All Statuses"
              [showClear]="true"
              styleClass="w-full"
            ></p-select>
          </div>

          <div class="col-span-12 md:col-span-2 flex gap-2">
            <p-button
              label="Reset"
              icon="pi pi-filter-slash"
              [outlined]="true"
              severity="secondary"
              (click)="resetFilters()"
              styleClass="w-full"
            ></p-button>
          </div>
        </div>
      </div>

      <!-- Tickets Data Table -->
      <div class="card p-0 shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
        <p-table
          [value]="filteredTickets"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[10, 20, 50]"
          [rowHover]="true"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} services"
          responsiveLayout="scroll"
          styleClass="p-datatable-sm"
        >
          <ng-template #header>
            <tr>
              <th pSortableColumn="id" style="min-width: 6.5rem">Ticket ID <p-sortIcon field="id"></p-sortIcon></th>
              <th pSortableColumn="customerName" style="min-width: 10rem">Customer <p-sortIcon field="customerName"></p-sortIcon></th>
              <th pSortableColumn="cycleModel" style="min-width: 11rem">Cycle Model <p-sortIcon field="cycleModel"></p-sortIcon></th>
              <th style="min-width: 9rem">Serial No.</th>
              <th style="min-width: 9rem">Company</th>
              <th pSortableColumn="status" style="min-width: 7.5rem">Status <p-sortIcon field="status"></p-sortIcon></th>
              <th pSortableColumn="priority" style="min-width: 6.5rem">Priority <p-sortIcon field="priority"></p-sortIcon></th>
              <th style="min-width: 9rem">Assignee</th>
              <th style="min-width: 8.5rem">Phone</th>
              <th style="min-width: 9rem">Email</th>
              <th style="min-width: 13rem">Description</th>
              <th pSortableColumn="createdAt" style="min-width: 8rem">Created At <p-sortIcon field="createdAt"></p-sortIcon></th>
              <th style="min-width: 5rem" class="text-center">Active</th>
              <th style="min-width: 7rem" class="text-center">Actions</th>
            </tr>
          </ng-template>

          <ng-template #body let-ticket>
            <tr [class.opacity-60]="ticket.enabled === false">
              <td>
                <span class="font-mono text-xs font-bold text-primary cursor-pointer hover:underline" (click)="viewTicket(ticket)">
                  {{ ticket.id }}
                </span>
              </td>
              <td>
                <div class="font-semibold text-surface-900 dark:text-surface-0 text-sm">{{ ticket.customerName }}</div>
                <div class="text-[11px] text-muted-color">ID: {{ ticket.customerId }}</div>
              </td>
              <td>
                <div class="text-sm font-medium text-surface-800 dark:text-surface-100">{{ ticket.cycleModel }}</div>
                <div class="text-[11px] text-muted-color">ID: {{ ticket.cycleId }}</div>
              </td>
              <td>
                <span class="font-mono text-xs bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded text-surface-700 dark:text-surface-300">
                  {{ ticket.serialNumber }}
                </span>
              </td>
              <td>
                <span class="text-xs text-surface-600 dark:text-surface-300">{{ ticket.companyName || '—' }}</span>
              </td>
              <td>
                <p-tag
                  [value]="ticket.status"
                  [severity]="getStatusSeverity(ticket.status)"
                  [rounded]="true"
                  styleClass="text-xs"
                ></p-tag>
              </td>
              <td>
                <p-tag
                  [value]="ticket.priority"
                  [severity]="getPrioritySeverity(ticket.priority)"
                  styleClass="text-xs"
                ></p-tag>
              </td>
              <td>
                <div class="text-xs font-medium text-surface-800 dark:text-surface-200 flex items-center gap-1">
                  <i class="pi pi-user text-muted-color text-[10px]"></i>
                  {{ ticket.assigneeName }}
                </div>
              </td>
              <td>
                <span class="text-xs text-surface-700 dark:text-surface-300 font-mono">{{ ticket.contactPhone }}</span>
              </td>
              <td>
                <span class="text-xs text-muted-color truncate max-w-[120px] block" [pTooltip]="ticket.contactEmail">{{ ticket.contactEmail }}</span>
              </td>
              <td>
                <p class="text-xs text-surface-700 dark:text-surface-300 line-clamp-2 max-w-[200px]" [pTooltip]="ticket.description">
                  {{ ticket.description }}
                </p>
              </td>
              <td>
                <span class="text-xs text-muted-color">{{ ticket.createdAt }}</span>
              </td>
              <td class="text-center">
                <p-toggleswitch
                  [(ngModel)]="ticket.enabled"
                  (onChange)="confirmToggleEnabled(ticket)"
                ></p-toggleswitch>
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
                    (click)="viewTicket(ticket)"
                  ></p-button>
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    [text]="true"
                    severity="info"
                    size="small"
                    pTooltip="Edit Ticket"
                    tooltipPosition="top"
                    (click)="openEditDialog(ticket)"
                  ></p-button>
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    size="small"
                    pTooltip="Delete"
                    tooltipPosition="top"
                    (click)="confirmDelete(ticket)"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template #emptymessage>
            <tr>
              <td colspan="14" class="text-center p-8 text-muted-color">
                <i class="pi pi-inbox text-4xl mb-3 block text-surface-400"></i>
                <div class="font-medium text-base text-surface-700 dark:text-surface-300">No service tickets found</div>
                <p class="text-xs text-muted-color mt-1">Try adjusting your search queries or category filters.</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Quick Inspection Drawer -->
    <p-drawer
      [(visible)]="drawerVisible"
      position="right"
      [style]="{ width: '450px', maxWidth: '90vw' }"
      [header]="'Ticket ' + (selectedTicket?.id || '')"
    >
      <div *ngIf="selectedTicket" class="space-y-4 text-sm pt-1">
        <div class="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-700">
          <div class="flex items-center gap-2">
            <p-tag [value]="selectedTicket.status" [severity]="getStatusSeverity(selectedTicket.status)"></p-tag>
            <p-tag [value]="selectedTicket.priority + ' Priority'" [severity]="getPrioritySeverity(selectedTicket.priority)"></p-tag>
          </div>
          <span class="text-xs text-muted-color">Updated: {{ selectedTicket.updatedAt }}</span>
        </div>

        <div>
          <div class="text-xs font-semibold text-muted-color uppercase mb-1">Customer Information</div>
          <div class="p-3 bg-surface-50 dark:bg-surface-800/60 rounded-lg space-y-1">
            <div class="font-bold text-surface-900 dark:text-surface-0">{{ selectedTicket.customerName }}</div>
            <div class="text-xs text-surface-700 dark:text-surface-300"><i class="pi pi-phone text-[10px] mr-1"></i>{{ selectedTicket.contactPhone }}</div>
            <div class="text-xs text-surface-700 dark:text-surface-300"><i class="pi pi-envelope text-[10px] mr-1"></i>{{ selectedTicket.contactEmail }}</div>
            <div *ngIf="selectedTicket.companyName" class="text-xs text-muted-color"><i class="pi pi-building text-[10px] mr-1"></i>{{ selectedTicket.companyName }}</div>
          </div>
        </div>

        <div>
          <div class="text-xs font-semibold text-muted-color uppercase mb-1">Bicycle Details</div>
          <div class="p-3 bg-surface-50 dark:bg-surface-800/60 rounded-lg space-y-1">
            <div class="font-semibold text-surface-900 dark:text-surface-0">{{ selectedTicket.cycleModel }}</div>
            <div class="text-xs font-mono text-muted-color">Serial: {{ selectedTicket.serialNumber }}</div>
            <div class="text-xs text-muted-color">Bicycle ID: {{ selectedTicket.cycleId }}</div>
          </div>
        </div>

        <div>
          <div class="text-xs font-semibold text-muted-color uppercase mb-1">Assigned Technician</div>
          <div class="p-3 bg-surface-50 dark:bg-surface-800/60 rounded-lg flex items-center justify-between">
            <div class="font-medium text-surface-800 dark:text-surface-100 flex items-center gap-2">
              <i class="pi pi-user text-orange-500"></i>
              {{ selectedTicket.assigneeName }}
            </div>
            <span class="text-xs text-muted-color">ID: {{ selectedTicket.assigneeId }}</span>
          </div>
        </div>

        <div>
          <div class="text-xs font-semibold text-muted-color uppercase mb-1">Description / Issue Log</div>
          <div class="p-3 rounded bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-200 text-xs leading-relaxed">
            {{ selectedTicket.description }}
          </div>
        </div>

        <div class="pt-4 flex gap-2">
          <p-button label="Edit Service" icon="pi pi-pencil" styleClass="w-full" (click)="openEditDialog(selectedTicket); drawerVisible = false"></p-button>
        </div>
      </div>
    </p-drawer>

    <!-- Edit Dialog -->
    <p-dialog
      [(visible)]="editDialogVisible"
      [header]="'Edit Service Ticket • ' + (editingTicket?.id || '')"
      [modal]="true"
      [style]="{ width: '90vw', maxWidth: '600px' }"
      [draggable]="false"
    >
      <div *ngIf="editingTicket" class="space-y-4 pt-2">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Status</label>
            <p-select
              [options]="statusOptions"
              [(ngModel)]="editingTicket.status"
              styleClass="w-full"
            ></p-select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Priority</label>
            <p-select
              [options]="priorityOptions"
              [(ngModel)]="editingTicket.priority"
              styleClass="w-full"
            ></p-select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Assigned Technician</label>
          <p-select
            [options]="technicianOptions"
            [(ngModel)]="editingTicket.assigneeId"
            optionLabel="name"
            optionValue="id"
            styleClass="w-full"
          ></p-select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Description</label>
          <textarea
            pInputTextarea
            [(ngModel)]="editingTicket.description"
            rows="4"
            class="w-full"
          ></textarea>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <p-button label="Cancel" severity="secondary" [outlined]="true" (click)="editDialogVisible = false"></p-button>
          <p-button label="Save Changes" icon="pi pi-check" (click)="saveEditedTicket()"></p-button>
        </div>
      </div>
    </p-dialog>
  `
})
export class ServicesListComponent implements OnInit {
  protected dataService = inject(CycleDataService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  searchQuery = '';
  selectedCategory: string | null = null;
  selectedStatus: string | null = null;

  drawerVisible = false;
  selectedTicket: ServiceTicket | null = null;

  editDialogVisible = false;
  editingTicket: ServiceTicket | null = null;

  categoryOptions = [
    { label: 'Drivetrain & Brakes', value: 'Drivetrain & Brakes' },
    { label: 'Suspension', value: 'Suspension' },
    { label: 'Overhaul', value: 'Overhaul' },
    { label: 'Annual Tune-up', value: 'Annual Tune-up' },
    { label: 'E-Bike Diagnostics', value: 'E-Bike Diagnostics' },
    { label: 'Wheel & Cockpit', value: 'Wheel & Cockpit' },
    { label: 'General Maintenance', value: 'General Maintenance' }
  ];

  statusOptions = [
    { label: 'Waiting', value: 'Waiting' },
    { label: 'Assigned', value: 'Assigned' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' }
  ];

  priorityOptions = [
    { label: 'Low', value: 'Low' },
    { label: 'Medium', value: 'Medium' },
    { label: 'High', value: 'High' },
    { label: 'Urgent', value: 'Urgent' }
  ];

  technicianOptions = [
    { id: 'TECH-001', name: 'Alex Rivera' },
    { id: 'TECH-002', name: 'David Chen' },
    { id: 'TECH-003', name: 'Sara Jenkins' },
    { id: 'TECH-004', name: 'Michael Scott' }
  ];

  ngOnInit(): void {}

  get filteredTickets(): ServiceTicket[] {
    return this.dataService.tickets().filter(ticket => {
      const matchesSearch = !this.searchQuery ||
        ticket.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        ticket.customerName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        ticket.cycleModel.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        ticket.serialNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (ticket.companyName && ticket.companyName.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesCategory = !this.selectedCategory || ticket.category === this.selectedCategory;
      const matchesStatus = !this.selectedStatus || ticket.status === this.selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = null;
    this.selectedStatus = null;
  }

  getStatusSeverity(status: TicketStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'warn';
      case 'Assigned': return 'info';
      case 'Waiting': return 'secondary';
      case 'Cancelled': return 'danger';
      default: return 'info';
    }
  }

  getPrioritySeverity(priority: TicketPriority): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (priority) {
      case 'Urgent': return 'danger';
      case 'High': return 'warn';
      case 'Medium': return 'info';
      case 'Low': return 'secondary';
      default: return 'info';
    }
  }

  viewTicket(ticket: ServiceTicket): void {
    this.selectedTicket = ticket;
    this.drawerVisible = true;
  }

  openEditDialog(ticket: ServiceTicket): void {
    this.editingTicket = { ...ticket };
    this.editDialogVisible = true;
  }

  saveEditedTicket(): void {
    if (this.editingTicket) {
      const tech = this.technicianOptions.find(t => t.id === this.editingTicket!.assigneeId);
      if (tech) {
        this.editingTicket.assigneeName = tech.name;
      }
      this.dataService.updateTicket(this.editingTicket.id, this.editingTicket);
      this.editDialogVisible = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Service Updated',
        detail: `Ticket ${this.editingTicket.id} updated successfully.`
      });
    }
  }

  confirmToggleEnabled(ticket: ServiceTicket): void {
    const action = ticket.enabled ? 'enable' : 'disable';
    this.messageService.add({
      severity: ticket.enabled ? 'info' : 'warn',
      summary: `Ticket ${ticket.enabled ? 'Enabled' : 'Disabled'}`,
      detail: `Ticket ${ticket.id} has been ${action}d.`
    });
  }

  confirmDelete(ticket: ServiceTicket): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete service ticket "${ticket.id}" for ${ticket.customerName}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.dataService.deleteTicket(ticket.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: `Ticket ${ticket.id} deleted.`
        });
      }
    });
  }
}
