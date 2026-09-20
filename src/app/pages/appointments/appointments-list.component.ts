import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CycleDataService } from '../../services/cycle-data.service';
import { Appointment, AppointmentStatus } from '../../models/cycle-management.models';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    TagModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast></p-toast>
    <p-confirmdialog></p-confirmdialog>

    <div class="flex flex-col gap-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">Appointments</h1>
            <span class="text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
              {{ filteredAppointments.length }} Bookings
            </span>
          </div>
          <p class="text-sm text-muted-color mt-1">Schedule, track and allocate workshop service bookings.</p>
        </div>

        <div class="flex items-center gap-3">
          <p-button
            label="+ New Appointment"
            icon="pi pi-calendar-plus"
            routerLink="/appointments/new"
          ></p-button>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="card p-4 shadow-sm border border-surface-200 dark:border-surface-700">
        <div class="grid grid-cols-12 gap-4 items-end">
          <div class="col-span-12 sm:col-span-6 md:col-span-3">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Customer / Bike Search</label>
            <div class="relative w-full">
              <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-color"></i>
              <input
                pInputText
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Search name, phone, bike..."
                class="w-full pl-9"
              />
            </div>
          </div>

          <div class="col-span-12 sm:col-span-6 md:col-span-2">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Status</label>
            <p-select
              [options]="statusOptions"
              [(ngModel)]="selectedStatus"
              placeholder="All Statuses"
              [showClear]="true"
              styleClass="w-full"
            ></p-select>
          </div>

          <div class="col-span-12 sm:col-span-6 md:col-span-3">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Technician</label>
            <p-select
              [options]="technicianOptions"
              [(ngModel)]="selectedTechnician"
              placeholder="All Technicians"
              [showClear]="true"
              styleClass="w-full"
            ></p-select>
          </div>

          <div class="col-span-12 sm:col-span-6 md:col-span-2">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Date Filter</label>
            <p-select
              [options]="dateOptions"
              [(ngModel)]="selectedDateFilter"
              placeholder="All Dates"
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

      <!-- Appointments Table -->
      <div class="card p-0 shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
        <p-table
          [value]="filteredAppointments"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[10, 20, 50]"
          [rowHover]="true"
          responsiveLayout="scroll"
          styleClass="p-datatable-sm"
        >
          <ng-template #header>
            <tr>
              <th pSortableColumn="id" style="min-width: 8rem">Appointment ID <p-sortIcon field="id"></p-sortIcon></th>
              <th pSortableColumn="customerName" style="min-width: 11rem">Customer <p-sortIcon field="customerName"></p-sortIcon></th>
              <th pSortableColumn="cycleModel" style="min-width: 12rem">Bicycle <p-sortIcon field="cycleModel"></p-sortIcon></th>
              <th style="min-width: 14rem">Service</th>
              <th pSortableColumn="technicianName" style="min-width: 10rem">Technician <p-sortIcon field="technicianName"></p-sortIcon></th>
              <th pSortableColumn="date" style="min-width: 8rem">Date <p-sortIcon field="date"></p-sortIcon></th>
              <th style="min-width: 7rem">Time</th>
              <th pSortableColumn="status" style="min-width: 8.5rem">Status <p-sortIcon field="status"></p-sortIcon></th>
              <th style="min-width: 7rem" class="text-center">Actions</th>
            </tr>
          </ng-template>

          <ng-template #body let-apt>
            <tr>
              <td>
                <span class="font-mono text-xs font-bold text-primary cursor-pointer hover:underline" (click)="viewDetails(apt)">
                  {{ apt.id }}
                </span>
              </td>
              <td>
                <div class="font-semibold text-surface-900 dark:text-surface-0 text-sm">{{ apt.customerName }}</div>
                <div class="text-xs text-muted-color">{{ apt.contactPhone }}</div>
              </td>
              <td>
                <div class="text-sm font-medium text-surface-800 dark:text-surface-100">{{ apt.cycleModel }}</div>
                <span class="inline-block text-[11px] px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-muted-color">
                  {{ apt.cycleType }}
                </span>
              </td>
              <td>
                <span class="text-xs font-medium text-surface-800 dark:text-surface-200">{{ apt.serviceType }}</span>
              </td>
              <td>
                <div class="text-xs text-surface-700 dark:text-surface-300 flex items-center gap-1.5">
                  <i class="pi pi-user text-muted-color text-[11px]"></i>
                  {{ apt.technicianName }}
                </div>
              </td>
              <td>
                <span class="text-xs font-medium text-surface-800 dark:text-surface-200 font-mono">{{ apt.date }}</span>
              </td>
              <td>
                <span class="text-xs px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 font-mono text-surface-700 dark:text-surface-300">
                  {{ apt.time }}
                </span>
              </td>
              <td>
                <p-tag
                  [value]="apt.status"
                  [severity]="getStatusSeverity(apt.status)"
                  [rounded]="true"
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
                    pTooltip="View Details"
                    tooltipPosition="top"
                    (click)="viewDetails(apt)"
                  ></p-button>
                  <p-button
                    *ngIf="apt.status === 'Scheduled'"
                    icon="pi pi-check"
                    [rounded]="true"
                    [text]="true"
                    severity="success"
                    size="small"
                    pTooltip="Confirm Appointment"
                    tooltipPosition="top"
                    (click)="updateStatus(apt, 'Confirmed')"
                  ></p-button>
                  <p-button
                    *ngIf="apt.status === 'Confirmed'"
                    icon="pi pi-play"
                    [rounded]="true"
                    [text]="true"
                    severity="info"
                    size="small"
                    pTooltip="Start Service"
                    tooltipPosition="top"
                    (click)="updateStatus(apt, 'In Service')"
                  ></p-button>
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    size="small"
                    pTooltip="Cancel / Delete"
                    tooltipPosition="top"
                    (click)="confirmDelete(apt)"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template #emptymessage>
            <tr>
              <td colspan="9" class="text-center p-8 text-muted-color">
                <i class="pi pi-calendar-times text-4xl mb-3 block text-surface-400"></i>
                <div class="font-medium text-base text-surface-700 dark:text-surface-300">No appointments found</div>
                <p class="text-xs text-muted-color mt-1">Try clearing filters or book a new appointment.</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Appointment Detail Dialog -->
    <p-dialog
      [(visible)]="detailDialogVisible"
      [header]="'Appointment Details • ' + (selectedAppointment?.id || '')"
      [modal]="true"
      [style]="{ width: '90vw', maxWidth: '580px' }"
      [draggable]="false"
    >
      <div *ngIf="selectedAppointment" class="space-y-4 pt-2 text-sm">
        <div class="p-3 bg-surface-50 dark:bg-surface-800/60 rounded-lg flex justify-between items-center">
          <div>
            <div class="text-xs text-muted-color">Date & Time</div>
            <div class="font-bold text-surface-900 dark:text-surface-0 font-mono">{{ selectedAppointment.date }} at {{ selectedAppointment.time }}</div>
          </div>
          <p-tag [value]="selectedAppointment.status" [severity]="getStatusSeverity(selectedAppointment.status)"></p-tag>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="p-3 border border-surface-200 dark:border-surface-700 rounded">
            <div class="text-xs text-muted-color uppercase font-semibold mb-1">Customer</div>
            <div class="font-bold text-surface-900 dark:text-surface-0">{{ selectedAppointment.customerName }}</div>
            <div class="text-xs text-muted-color mt-0.5">{{ selectedAppointment.contactPhone }}</div>
          </div>

          <div class="p-3 border border-surface-200 dark:border-surface-700 rounded">
            <div class="text-xs text-muted-color uppercase font-semibold mb-1">Bicycle</div>
            <div class="font-bold text-surface-900 dark:text-surface-0">{{ selectedAppointment.cycleModel }}</div>
            <div class="text-xs text-muted-color mt-0.5">Type: {{ selectedAppointment.cycleType }}</div>
          </div>
        </div>

        <div class="p-3 border border-surface-200 dark:border-surface-700 rounded space-y-2">
          <div>
            <span class="text-xs text-muted-color uppercase font-semibold block">Service Requested</span>
            <span class="font-medium text-surface-900 dark:text-surface-0">{{ selectedAppointment.serviceType }}</span>
          </div>
          <div>
            <span class="text-xs text-muted-color uppercase font-semibold block">Technician Assigned</span>
            <span class="text-xs text-surface-700 dark:text-surface-300 font-medium">{{ selectedAppointment.technicianName }} ({{ selectedAppointment.technicianId }})</span>
          </div>
          <div *ngIf="selectedAppointment.notes">
            <span class="text-xs text-muted-color uppercase font-semibold block">Customer Notes</span>
            <p class="text-xs text-surface-700 dark:text-surface-300 italic bg-surface-100 dark:bg-surface-800 p-2 rounded mt-1">
              "{{ selectedAppointment.notes }}"
            </p>
          </div>
        </div>

        <div class="flex justify-between items-center pt-2">
          <span class="text-xs text-muted-color">Booked: {{ selectedAppointment.createdAt }}</span>
          <div class="flex gap-2">
            <p-button
              *ngIf="selectedAppointment.status !== 'Cancelled' && selectedAppointment.status !== 'Completed'"
              label="Cancel Booking"
              severity="danger"
              [outlined]="true"
              size="small"
              (click)="updateStatus(selectedAppointment, 'Cancelled')"
            ></p-button>
            <p-button
              *ngIf="selectedAppointment.status === 'Scheduled'"
              label="Confirm Booking"
              icon="pi pi-check"
              size="small"
              (click)="updateStatus(selectedAppointment, 'Confirmed')"
            ></p-button>
          </div>
        </div>
      </div>
    </p-dialog>
  `
})
export class AppointmentsListComponent implements OnInit {
  protected dataService = inject(CycleDataService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  searchQuery = '';
  selectedStatus: string | null = null;
  selectedTechnician: string | null = null;
  selectedDateFilter: string | null = null;

  detailDialogVisible = false;
  selectedAppointment: Appointment | null = null;

  statusOptions = [
    { label: 'Scheduled', value: 'Scheduled' },
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'In Service', value: 'In Service' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'No Show', value: 'No Show' }
  ];

  technicianOptions = [
    { label: 'Alex Rivera', value: 'Alex Rivera' },
    { label: 'David Chen', value: 'David Chen' },
    { label: 'Sara Jenkins', value: 'Sara Jenkins' },
    { label: 'Michael Scott', value: 'Michael Scott' }
  ];

  dateOptions = [
    { label: 'Today (Sep 20)', value: '2026-09-20' },
    { label: 'Tomorrow (Sep 21)', value: '2026-09-21' },
    { label: 'Yesterday (Sep 19)', value: '2026-09-19' }
  ];

  ngOnInit(): void {}

  get filteredAppointments(): Appointment[] {
    return this.dataService.appointments().filter(apt => {
      const matchesSearch = !this.searchQuery ||
        apt.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        apt.customerName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        apt.cycleModel.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        apt.contactPhone.includes(this.searchQuery);

      const matchesStatus = !this.selectedStatus || apt.status === this.selectedStatus;
      const matchesTech = !this.selectedTechnician || apt.technicianName === this.selectedTechnician;
      const matchesDate = !this.selectedDateFilter || apt.date === this.selectedDateFilter;

      return matchesSearch && matchesStatus && matchesTech && matchesDate;
    });
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = null;
    this.selectedTechnician = null;
    this.selectedDateFilter = null;
  }

  getStatusSeverity(status: AppointmentStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Service': return 'warn';
      case 'Confirmed': return 'info';
      case 'Scheduled': return 'secondary';
      case 'Cancelled': return 'danger';
      case 'No Show': return 'danger';
      default: return 'info';
    }
  }

  viewDetails(apt: Appointment): void {
    this.selectedAppointment = apt;
    this.detailDialogVisible = true;
  }

  updateStatus(apt: Appointment, newStatus: AppointmentStatus): void {
    this.dataService.updateAppointmentStatus(apt.id, newStatus);
    apt.status = newStatus;
    this.messageService.add({
      severity: 'success',
      summary: 'Appointment Updated',
      detail: `Status changed to ${newStatus}.`
    });
    this.detailDialogVisible = false;
  }

  confirmDelete(apt: Appointment): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to remove appointment "${apt.id}" for ${apt.customerName}?`,
      header: 'Confirm Removal',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.dataService.deleteAppointment(apt.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: `Appointment ${apt.id} deleted.`
        });
      }
    });
  }
}
