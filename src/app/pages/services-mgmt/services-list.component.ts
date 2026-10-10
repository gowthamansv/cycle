import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { TextareaModule } from 'primeng/textarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';

import QRCode from 'qrcode';
import { TicketService } from '../../services/ticket.service';
import { MiscService } from '../../services/misc.service';
import { CycleDataService } from '../../services/cycle-data.service';
import { AppConfigService } from '../../app.config.service';
import { AppNotificationService } from '../../common/services/notification.service';
import {
  TicketResponseDto,
  UpdateTicketRequest,
  CreateTicketRequest,
  MiscStatus,
  MiscPriority,
  MiscUser,
  MiscCustomer
} from '../../models/api.models';

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    DialogModule,
    TooltipModule,
    TextareaModule,
    ProgressSpinnerModule,
    MessageModule
  ],
  template: `
    <div class="flex flex-col gap-6 max-w-[1600px] mx-auto pb-10">

      <!-- ========================================================= -->
      <!-- 1. PAGE HEADER                                            -->
      <!-- ========================================================= -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface-0 dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm">
        <div>
          <div class="flex items-center gap-2 text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">
            <i class="pi pi-wrench"></i> Operations
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">
            Service Management
          </h1>
          <p class="text-sm text-muted-color mt-1">
            Manage bicycle service jobs, technician assignments, status workflows and customer repair orders.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <p-button
            label="Refresh"
            icon="pi pi-refresh"
            [outlined]="true"
            severity="secondary"
            (click)="loadData()"
            [loading]="isLoading()"
            size="small"
          ></p-button>

          <p-button
            label="Create Service"
            icon="pi pi-plus"
            (click)="openCreateDialog()"
            styleClass="bg-orange-500 hover:bg-orange-600 border-none text-white font-semibold shadow-sm"
            size="small"
          ></p-button>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- 2. SUMMARY CARDS (API-DRIVEN METRICS)                     -->
      <!-- ========================================================= -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <!-- Total Services -->
        <div class="bg-surface-0 dark:bg-surface-900 p-4 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-semibold text-muted-color uppercase">Total Services</span>
            <div class="text-2xl font-bold text-surface-900 dark:text-surface-0 mt-1">
              {{ metrics().total }}
            </div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-600 dark:text-surface-300">
            <i class="pi pi-list text-lg"></i>
          </div>
        </div>

        <!-- New / Waiting -->
        <div class="bg-surface-0 dark:bg-surface-900 p-4 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-semibold text-muted-color uppercase">New</span>
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {{ metrics().newCount }}
            </div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <i class="pi pi-clock text-lg"></i>
          </div>
        </div>

        <!-- Assigned -->
        <div class="bg-surface-0 dark:bg-surface-900 p-4 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-semibold text-muted-color uppercase">Assigned</span>
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {{ metrics().assigned }}
            </div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <i class="pi pi-user-check text-lg"></i>
          </div>
        </div>

        <!-- In Progress -->
        <div class="bg-surface-0 dark:bg-surface-900 p-4 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-semibold text-muted-color uppercase">In Progress</span>
            <div class="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {{ metrics().inProgress }}
            </div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <i class="pi pi-cog pi-spin text-lg"></i>
          </div>
        </div>

        <!-- Completed -->
        <div class="bg-surface-0 dark:bg-surface-900 p-4 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <span class="text-xs font-semibold text-muted-color uppercase">Completed</span>
            <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {{ metrics().completed }}
            </div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <i class="pi pi-check-circle text-lg"></i>
          </div>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- 3. FILTERS TOOLBAR                                        -->
      <!-- ========================================================= -->
      <div class="bg-surface-0 dark:bg-surface-900 p-4 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-2 text-xs text-muted-color">
          <i class="pi pi-filter text-orange-500"></i>
          <span class="font-semibold uppercase tracking-wider">Filters:</span>
        </div>

        <!-- Filter Selectors -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Status Filter -->
          <p-select
            [options]="statusFilterOptions"
            [(ngModel)]="selectedStatusFilter"
            (onChange)="applyFilters()"
            placeholder="All Statuses"
            styleClass="w-40 text-sm"
          ></p-select>

          <!-- Technician Filter -->
          <p-select
            [options]="technicianFilterOptions"
            [(ngModel)]="selectedTechnicianFilter"
            (onChange)="applyFilters()"
            placeholder="All Technicians"
            styleClass="w-48 text-sm"
          ></p-select>

          <!-- Priority Filter -->
          <p-select
            [options]="priorityFilterOptions"
            [(ngModel)]="selectedPriorityFilter"
            (onChange)="applyFilters()"
            placeholder="All Priorities"
            styleClass="w-36 text-sm"
          ></p-select>

          <!-- Reset Filters -->
          <p-button
            *ngIf="hasActiveFilters"
            icon="pi pi-filter-slash"
            label="Clear"
            [outlined]="true"
            severity="secondary"
            size="small"
            (click)="clearFilters()"
            pTooltip="Clear active filters"
          ></p-button>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- 4. ERROR STATE BANNER                                     -->
      <!-- ========================================================= -->
      <div *ngIf="loadError()" class="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center justify-between">
        <div class="flex items-center gap-3 text-red-700 dark:text-red-300">
          <i class="pi pi-exclamation-triangle text-xl"></i>
          <div>
            <div class="font-semibold text-sm">Unable to load services from backend</div>
            <div class="text-xs text-red-600 dark:text-red-400">{{ loadErrorMessage() }}</div>
          </div>
        </div>
        <p-button
          label="Retry"
          icon="pi pi-refresh"
          severity="danger"
          size="small"
          (click)="loadData()"
        ></p-button>
      </div>

      <!-- ========================================================= -->
      <!-- 5. MAIN SERVICE TABLE                                     -->
      <!-- ========================================================= -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden">
        <p-table
          [value]="filteredTickets()"
          [loading]="isLoading()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[10, 20, 50]"
          responsiveLayout="scroll"
          styleClass="p-datatable-sm p-datatable-striped"
        >
          <!-- Table Header -->
          <ng-template pTemplate="header">
            <tr>
              <th class="w-28 text-xs font-semibold text-muted-color uppercase">Service ID</th>
              <th class="text-xs font-semibold text-muted-color uppercase">Customer</th>
              <th class="text-xs font-semibold text-muted-color uppercase">Bicycle</th>
              <th class="text-xs font-semibold text-muted-color uppercase">Contact</th>
              <th class="text-xs font-semibold text-muted-color uppercase">Technician</th>
              <th class="w-28 text-xs font-semibold text-muted-color uppercase">Priority</th>
              <th class="w-32 text-xs font-semibold text-muted-color uppercase">Status</th>
              <th class="w-32 text-xs font-semibold text-muted-color uppercase">Created</th>
              <th class="w-28 text-right text-xs font-semibold text-muted-color uppercase">Actions</th>
            </tr>
          </ng-template>

          <!-- Table Body -->
          <ng-template pTemplate="body" let-ticket>
            <tr class="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
              <!-- Service ID -->
              <td>
                <span
                  class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-200 border border-surface-200 dark:border-surface-700"
                  [pTooltip]="ticket.id"
                >
                  #{{ ticket.id ? (ticket.id.substring(0, 8) | uppercase) : 'N/A' }}
                </span>
              </td>

              <!-- Customer -->
              <td>
                <div class="font-semibold text-sm text-surface-900 dark:text-surface-0">
                  {{ ticket.customerName || 'Customer' }}
                </div>
                <div *ngIf="ticket.companyName" class="text-xs text-muted-color flex items-center gap-1 mt-0.5">
                  <i class="pi pi-building text-[10px]"></i>
                  <span>{{ ticket.companyName }}</span>
                </div>
              </td>

              <!-- Bicycle -->
              <td>
                <div class="text-sm font-medium text-surface-800 dark:text-surface-200">
                  {{ ticket.cycleModel || 'Cycle' }}
                </div>
                <div *ngIf="ticket.serialNumber" class="text-xs font-mono text-muted-color mt-0.5">
                  S/N: {{ ticket.serialNumber }}
                </div>
              </td>

              <!-- Contact -->
              <td>
                <div class="text-xs text-surface-700 dark:text-surface-300 flex items-center gap-1">
                  <i class="pi pi-phone text-[10px] text-muted-color"></i>
                  <span>{{ ticket.contactPhone || '—' }}</span>
                </div>
                <div *ngIf="ticket.contactEmail" class="text-xs text-muted-color flex items-center gap-1 mt-0.5 truncate max-w-[180px]">
                  <i class="pi pi-envelope text-[10px]"></i>
                  <span class="truncate">{{ ticket.contactEmail }}</span>
                </div>
              </td>

              <!-- Technician -->
              <td>
                <div *ngIf="ticket.assigneeName" class="flex items-center gap-1.5 text-xs text-surface-800 dark:text-surface-200 font-medium">
                  <div class="w-5 h-5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center text-[10px] font-bold">
                    {{ ticket.assigneeName.charAt(0) | uppercase }}
                  </div>
                  <span>{{ ticket.assigneeName }}</span>
                </div>
                <span *ngIf="!ticket.assigneeName" class="text-xs text-muted-color italic">Unassigned</span>
              </td>

              <!-- Priority Badge -->
              <td>
                <p-tag
                  [value]="ticket.priority || 'Medium'"
                  [severity]="getPrioritySeverity(ticket.priority)"
                  styleClass="text-xs font-semibold"
                ></p-tag>
              </td>

              <!-- Status Badge -->
              <td>
                <p-tag
                  [value]="ticket.status || 'New'"
                  [severity]="getStatusSeverity(ticket.status)"
                  styleClass="text-xs font-semibold"
                ></p-tag>
              </td>

              <!-- Created Date -->
              <td>
                <div class="text-xs text-surface-700 dark:text-surface-300">
                  {{ ticket.createdAt ? (ticket.createdAt | date:'mediumDate') : '—' }}
                </div>
                <div class="text-[10px] text-muted-color">
                  {{ ticket.createdAt ? (ticket.createdAt | date:'shortTime') : '' }}
                </div>
              </td>

              <!-- Actions -->
              <td class="text-right">
                <div class="flex items-center justify-end gap-1">
                  <!-- View Details -->
                  <p-button
                    icon="pi pi-eye"
                    [rounded]="true"
                    [text]="true"
                    severity="secondary"
                    size="small"
                    pTooltip="View Details"
                    (click)="openViewDialog(ticket)"
                  ></p-button>

                  <!-- Edit Ticket -->
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    [text]="true"
                    severity="primary"
                    size="small"
                    pTooltip="Edit Service"
                    (click)="openEditDialog(ticket)"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <!-- Empty State -->
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="9" class="text-center py-12">
                <div class="flex flex-col items-center justify-center gap-3">
                  <div class="w-14 h-14 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-400">
                    <i class="pi pi-inbox text-2xl"></i>
                  </div>
                  <div>
                    <h3 class="text-base font-semibold text-surface-900 dark:text-surface-0">No services found</h3>
                    <p class="text-xs text-muted-color mt-1">
                      {{ hasActiveFilters ? 'No services matched your filter criteria.' : 'No service jobs have been registered in the database yet.' }}
                    </p>
                  </div>
                  <p-button
                    *ngIf="!hasActiveFilters"
                    label="Create Service"
                    icon="pi pi-plus"
                    size="small"
                    (click)="openCreateDialog()"
                    styleClass="bg-orange-500 hover:bg-orange-600 border-none text-white font-semibold mt-1"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

    </div>

    <!-- ========================================================= -->
    <!-- 6. CREATE SERVICE MODAL (9 REQUESTED FIELDS)             -->
    <!-- ========================================================= -->
    <p-dialog
      header="Create Service Ticket"
      [(visible)]="createDialogVisible"
      [modal]="true"
      [style]="{ width: '680px', maxWidth: '95vw' }"
      [draggable]="false"
      [resizable]="false"
    >
      <form [formGroup]="createForm" (ngSubmit)="submitCreate()" class="space-y-4 pt-2">
        <!-- Customer & Cycle -->
        <div class="grid grid-cols-12 gap-3">
          <!-- Customer -->
          <div class="col-span-12 sm:col-span-6">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">
              Customer <span class="text-red-500">*</span>
            </label>
            <p-select
              [options]="customerOptions"
              formControlName="customerId"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Customer"
              [filter]="true"
              filterBy="label"
              (onChange)="onCustomerSelect($event.value)"
              styleClass="w-full text-sm"
              [ngClass]="{ 'ng-invalid ng-dirty': isCreateFieldInvalid('customerId') }"
            ></p-select>
            <small *ngIf="isCreateFieldInvalid('customerId')" class="text-red-500 text-xs mt-0.5 block">Customer is required.</small>
          </div>

          <!-- Cycle -->
          <div class="col-span-12 sm:col-span-6">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">
              Cycle / Bicycle <span class="text-red-500">*</span>
            </label>
            <p-select
              [options]="cycleOptions"
              formControlName="cycleId"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Bicycle"
              [filter]="true"
              filterBy="label"
              styleClass="w-full text-sm"
              [ngClass]="{ 'ng-invalid ng-dirty': isCreateFieldInvalid('cycleId') }"
            ></p-select>
            <small *ngIf="isCreateFieldInvalid('cycleId')" class="text-red-500 text-xs mt-0.5 block">Cycle is required.</small>
          </div>
        </div>

        <!-- Company Name -->
        <div>
          <label class="block text-xs font-semibold text-muted-color uppercase mb-1">
            Company / Club Name
          </label>
          <input
            pInputText
            formControlName="companyName"
            placeholder="e.g. Vance Logistics (optional)"
            class="w-full text-sm"
          />
        </div>

        <!-- Status, Priority, Assignee -->
        <div class="grid grid-cols-12 gap-3">
          <!-- Status -->
          <div class="col-span-12 sm:col-span-4">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">
              Status <span class="text-red-500">*</span>
            </label>
            <p-select
              [options]="statusOptions"
              formControlName="statusId"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Status"
              styleClass="w-full text-sm"
              [ngClass]="{ 'ng-invalid ng-dirty': isCreateFieldInvalid('statusId') }"
            ></p-select>
            <small *ngIf="isCreateFieldInvalid('statusId')" class="text-red-500 text-xs mt-0.5 block">Status is required.</small>
          </div>

          <!-- Priority -->
          <div class="col-span-12 sm:col-span-4">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">
              Priority <span class="text-red-500">*</span>
            </label>
            <p-select
              [options]="priorityOptions"
              formControlName="priorityId"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Priority"
              styleClass="w-full text-sm"
              [ngClass]="{ 'ng-invalid ng-dirty': isCreateFieldInvalid('priorityId') }"
            ></p-select>
            <small *ngIf="isCreateFieldInvalid('priorityId')" class="text-red-500 text-xs mt-0.5 block">Priority is required.</small>
          </div>

          <!-- Assignee -->
          <div class="col-span-12 sm:col-span-4">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">
              Technician / Assignee <span class="text-red-500">*</span>
            </label>
            <p-select
              [options]="assigneeOptions"
              formControlName="assigneeId"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Technician"
              [filter]="true"
              filterBy="label"
              styleClass="w-full text-sm"
              [ngClass]="{ 'ng-invalid ng-dirty': isCreateFieldInvalid('assigneeId') }"
            ></p-select>
            <small *ngIf="isCreateFieldInvalid('assigneeId')" class="text-red-500 text-xs mt-0.5 block">Technician is required.</small>
          </div>
        </div>

        <!-- Contact Phone & Email -->
        <div class="grid grid-cols-12 gap-3">
          <div class="col-span-12 sm:col-span-6">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">
              Contact Phone <span class="text-red-500">*</span>
            </label>
            <input
              pInputText
              formControlName="contactPhone"
              placeholder="+1 (555) 000-0000"
              class="w-full text-sm"
              [ngClass]="{ 'ng-invalid ng-dirty': isCreateFieldInvalid('contactPhone') }"
            />
            <small *ngIf="isCreateFieldInvalid('contactPhone')" class="text-red-500 text-xs mt-0.5 block">Phone number is required.</small>
          </div>

          <div class="col-span-12 sm:col-span-6">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">
              Contact Email <span class="text-red-500">*</span>
            </label>
            <input
              pInputText
              type="email"
              formControlName="contactEmail"
              placeholder="user@example.com"
              class="w-full text-sm"
              [ngClass]="{ 'ng-invalid ng-dirty': isCreateFieldInvalid('contactEmail') }"
            />
            <small *ngIf="isCreateFieldInvalid('contactEmail')" class="text-red-500 text-xs mt-0.5 block">Valid email is required.</small>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-xs font-semibold text-muted-color uppercase mb-1">
            Service Description <span class="text-red-500">*</span>
          </label>
          <textarea
            pTextarea
            formControlName="description"
            rows="3"
            placeholder="Provide diagnostic notes, symptoms, or maintenance instructions..."
            class="w-full text-sm"
            [ngClass]="{ 'ng-invalid ng-dirty': isCreateFieldInvalid('description') }"
          ></textarea>
          <small *ngIf="isCreateFieldInvalid('description')" class="text-red-500 text-xs mt-0.5 block">Description is required.</small>
        </div>

        <!-- Dialog Actions -->
        <div class="flex items-center justify-end gap-2 pt-4 border-t border-surface-200 dark:border-surface-700">
          <p-button
            label="Cancel"
            [outlined]="true"
            severity="secondary"
            size="small"
            (click)="createDialogVisible = false"
            [disabled]="isSubmitting"
          ></p-button>
          <p-button
            type="submit"
            label="Create Service Order"
            icon="pi pi-check"
            size="small"
            [loading]="isSubmitting"
            styleClass="bg-orange-500 hover:bg-orange-600 border-none text-white font-semibold"
          ></p-button>
        </div>
      </form>
    </p-dialog>

    <!-- ========================================================= -->
    <!-- 7. EDIT SERVICE MODAL (PUT /api/tickets/{ticketId})       -->
    <!-- ========================================================= -->
    <p-dialog
      header="Edit Service Ticket"
      [(visible)]="editDialogVisible"
      [modal]="true"
      [style]="{ width: '600px', maxWidth: '95vw' }"
      [draggable]="false"
      [resizable]="false"
    >
      <form *ngIf="selectedTicketForEdit" [formGroup]="editForm" (ngSubmit)="submitEdit()" class="space-y-4 pt-2">
        <!-- Ticket Context Header -->
        <div class="p-3 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-between text-xs">
          <div>
            <span class="text-muted-color">Editing Ticket:</span>
            <span class="font-mono font-bold ml-1 text-surface-900 dark:text-surface-0">#{{ selectedTicketForEdit.id.substring(0, 8) | uppercase }}</span>
          </div>
          <div>
            <span class="text-muted-color">Customer:</span>
            <span class="font-semibold ml-1 text-surface-900 dark:text-surface-0">{{ selectedTicketForEdit.customerName }}</span>
          </div>
        </div>

        <!-- Status & Priority -->
        <div class="grid grid-cols-12 gap-3">
          <!-- Status -->
          <div class="col-span-12 sm:col-span-6">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Status</label>
            <p-select
              [options]="statusOptions"
              formControlName="statusId"
              optionLabel="label"
              optionValue="value"
              styleClass="w-full text-sm"
            ></p-select>
          </div>

          <!-- Priority -->
          <div class="col-span-12 sm:col-span-6">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Priority</label>
            <p-select
              [options]="priorityOptions"
              formControlName="priorityId"
              optionLabel="label"
              optionValue="value"
              styleClass="w-full text-sm"
            ></p-select>
          </div>
        </div>

        <!-- Assignee -->
        <div>
          <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Assigned Technician</label>
          <p-select
            [options]="assigneeOptions"
            formControlName="assigneeId"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Technician"
            [filter]="true"
            filterBy="label"
            styleClass="w-full text-sm"
          ></p-select>
        </div>

        <!-- Phone & Email -->
        <div class="grid grid-cols-12 gap-3">
          <div class="col-span-12 sm:col-span-6">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Contact Phone</label>
            <input
              pInputText
              formControlName="contactPhone"
              class="w-full text-sm"
            />
          </div>

          <div class="col-span-12 sm:col-span-6">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Contact Email</label>
            <input
              pInputText
              type="email"
              formControlName="contactEmail"
              class="w-full text-sm"
            />
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Description / Notes</label>
          <textarea
            pTextarea
            formControlName="description"
            rows="4"
            class="w-full text-sm"
          ></textarea>
        </div>

        <!-- Dialog Actions -->
        <div class="flex items-center justify-end gap-2 pt-4 border-t border-surface-200 dark:border-surface-700">
          <p-button
            label="Cancel"
            [outlined]="true"
            severity="secondary"
            size="small"
            (click)="editDialogVisible = false"
            [disabled]="isSubmitting"
          ></p-button>
          <p-button
            type="submit"
            label="Save Changes"
            icon="pi pi-check"
            size="small"
            [loading]="isSubmitting"
            styleClass="bg-orange-500 hover:bg-orange-600 border-none text-white font-semibold"
          ></p-button>
        </div>
      </form>
    </p-dialog>

    <!-- ========================================================= -->
    <!-- 8. VIEW SERVICE DETAILS MODAL                             -->
    <!-- ========================================================= -->
    <p-dialog
      header="Service Ticket Details"
      [(visible)]="viewDialogVisible"
      [modal]="true"
      [style]="{ width: '600px', maxWidth: '95vw' }"
      [draggable]="false"
      [resizable]="false"
    >
      <div *ngIf="selectedTicketForView" class="space-y-4 pt-2">
        <!-- Top Info Header -->
        <div class="flex items-center justify-between p-3.5 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
          <div>
            <div class="text-[11px] text-muted-color uppercase font-semibold">Service Ticket ID</div>
            <div class="font-mono text-sm font-bold text-surface-900 dark:text-surface-0 mt-0.5">
              {{ selectedTicketForView.id }}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <p-tag [value]="selectedTicketForView.priority || 'Medium'" [severity]="getPrioritySeverity(selectedTicketForView.priority)"></p-tag>
            <p-tag [value]="selectedTicketForView.status || 'New'" [severity]="getStatusSeverity(selectedTicketForView.status)"></p-tag>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-2 gap-4 text-xs">
          <!-- Customer -->
          <div class="p-3 rounded-lg bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700">
            <span class="text-muted-color font-semibold uppercase block mb-1">Customer Details</span>
            <div class="font-bold text-sm text-surface-900 dark:text-surface-0">{{ selectedTicketForView.customerName }}</div>
            <div *ngIf="selectedTicketForView.companyName" class="text-muted-color mt-0.5">{{ selectedTicketForView.companyName }}</div>
            <div class="mt-2 text-surface-700 dark:text-surface-300 flex items-center gap-1.5">
              <i class="pi pi-phone text-[10px]"></i>
              <span>{{ selectedTicketForView.contactPhone || 'No phone recorded' }}</span>
            </div>
            <div *ngIf="selectedTicketForView.contactEmail" class="text-surface-700 dark:text-surface-300 flex items-center gap-1.5 mt-1">
              <i class="pi pi-envelope text-[10px]"></i>
              <span>{{ selectedTicketForView.contactEmail }}</span>
            </div>
          </div>

          <!-- Bicycle -->
          <div class="p-3 rounded-lg bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700">
            <span class="text-muted-color font-semibold uppercase block mb-1">Bicycle Profile</span>
            <div class="font-bold text-sm text-surface-900 dark:text-surface-0">{{ selectedTicketForView.cycleModel || 'Cycle' }}</div>
            <div *ngIf="selectedTicketForView.serialNumber" class="text-muted-color font-mono mt-0.5">S/N: {{ selectedTicketForView.serialNumber }}</div>
            <div class="mt-2 text-surface-700 dark:text-surface-300">
              <span class="text-muted-color">Assigned Staff:</span>
              <div class="font-medium mt-0.5 text-surface-900 dark:text-surface-0">
                {{ selectedTicketForView.assigneeName || 'Unassigned' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="p-3.5 rounded-lg bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 text-xs">
          <span class="text-muted-color font-semibold uppercase block mb-1.5">Service Description / Diagnostic Notes</span>
          <p class="text-surface-800 dark:text-surface-200 whitespace-pre-line leading-relaxed">
            {{ selectedTicketForView.description || 'No detailed description provided.' }}
          </p>
        </div>

        <!-- QR Service Information Section -->
        <div class="p-3.5 rounded-lg bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 text-xs">
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-surface-200 dark:border-surface-700">
            <div class="font-bold text-surface-900 dark:text-surface-0 flex items-center gap-1.5 uppercase text-xs">
              <i class="pi pi-qrcode text-orange-500"></i>
              <span>QR Service Information</span>
            </div>
            <p-button
              *ngIf="viewQrDataUrl && selectedTicketForView.cycleId"
              label="Print QR"
              icon="pi pi-print"
              size="small"
              [outlined]="true"
              severity="secondary"
              (click)="printQrCode()"
              pTooltip="Print 3cm x 3cm bicycle QR code"
            ></p-button>
          </div>

          <div *ngIf="selectedTicketForView.cycleId; else noCycleIdTpl" class="flex flex-col sm:flex-row items-center gap-3.5">
            <!-- QR Preview Image -->
            <div class="bg-white p-2 rounded-lg border border-surface-200 dark:border-surface-700 shadow-sm shrink-0 flex items-center justify-center">
              <img *ngIf="viewQrDataUrl" [src]="viewQrDataUrl" alt="Cycle Service QR" class="w-20 h-20 object-contain" />
              <div *ngIf="!viewQrDataUrl && isGeneratingQr" class="w-20 h-20 flex items-center justify-center text-muted-color">
                <i class="pi pi-spin pi-spinner text-base"></i>
              </div>
            </div>

            <!-- QR Details & URL -->
            <div class="flex-1 text-center sm:text-left space-y-1">
              <div class="font-semibold text-surface-900 dark:text-surface-0">
                Scan to view bicycle service information
              </div>
              <div class="text-[11px] text-muted-color">
                Cycle ID: <span class="font-mono font-medium text-surface-800 dark:text-surface-200">{{ selectedTicketForView.cycleId }}</span>
              </div>
              <div class="p-1.5 rounded bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 font-mono text-[10px] break-all select-all text-surface-700 dark:text-surface-300">
                {{ viewQrUrl }}
              </div>
            </div>
          </div>

          <ng-template #noCycleIdTpl>
            <div class="text-xs text-muted-color italic py-2 text-center">
              No cycle ID associated with this ticket. QR code cannot be generated.
            </div>
          </ng-template>
        </div>

        <!-- Timestamps -->
        <div class="flex items-center justify-between text-[11px] text-muted-color px-1">
          <div>
            <span>Created: </span>
            <span class="font-medium text-surface-700 dark:text-surface-300">{{ selectedTicketForView.createdAt | date:'medium' }}</span>
          </div>
          <div *ngIf="selectedTicketForView.updatedAt">
            <span>Last Updated: </span>
            <span class="font-medium text-surface-700 dark:text-surface-300">{{ selectedTicketForView.updatedAt | date:'medium' }}</span>
          </div>
        </div>

        <!-- Dialog Action -->
        <div class="flex items-center justify-end gap-2 pt-4 border-t border-surface-200 dark:border-surface-700">
          <p-button
            label="Close"
            severity="secondary"
            [outlined]="true"
            size="small"
            (click)="viewDialogVisible = false"
          ></p-button>
          <p-button
            label="Edit Ticket"
            icon="pi pi-pencil"
            size="small"
            styleClass="bg-orange-500 hover:bg-orange-600 border-none text-white font-semibold"
            (click)="viewDialogVisible = false; openEditDialog(selectedTicketForView)"
          ></p-button>
        </div>
      </div>
    </p-dialog>
  `
})
export class ServicesListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  private miscService = inject(MiscService);
  private dataService = inject(CycleDataService);
  private configService = inject(AppConfigService);
  private notificationService = inject(AppNotificationService);

  // Reactive state
  tickets = this.ticketService.tickets;
  isLoading = this.ticketService.isLoading;
  loadError = signal<boolean>(false);
  loadErrorMessage = signal<string>('');

  // Filters state
  selectedStatusFilter: string | null = null;
  selectedTechnicianFilter: string | null = null;
  selectedPriorityFilter: string | null = null;

  statusFilterOptions: { label: string; value: string | null }[] = [];
  technicianFilterOptions: { label: string; value: string | null }[] = [];
  priorityFilterOptions: { label: string; value: string | null }[] = [];

  // Form options
  customerOptions: { label: string; value: string }[] = [];
  cycleOptions: { label: string; value: string }[] = [];
  statusOptions: { label: string; value: string }[] = [];
  priorityOptions: { label: string; value: string }[] = [];
  assigneeOptions: { label: string; value: string }[] = [];

  // Dialog Controls
  createDialogVisible = false;
  editDialogVisible = false;
  viewDialogVisible = false;
  isSubmitting = false;

  // QR Code state for View Details Modal
  viewQrDataUrl: string | null = null;
  viewQrUrl: string = '';
  isGeneratingQr = false;

  selectedTicketForEdit: TicketResponseDto | null = null;
  selectedTicketForView: TicketResponseDto | null = null;

  createForm!: FormGroup;
  editForm!: FormGroup;

  // Computed filtered tickets
  filteredTickets = computed(() => {
    const list = this.tickets();
    const statusFilter = this.selectedStatusFilter;
    const techFilter = this.selectedTechnicianFilter;
    const priorityFilter = this.selectedPriorityFilter;

    return list.filter((ticket) => {
      // 1. Status Filter
      if (statusFilter && ticket.statusId !== statusFilter && ticket.status !== statusFilter) {
        return false;
      }

      // 2. Technician Filter
      if (techFilter && ticket.assigneeId !== techFilter) {
        return false;
      }

      // 3. Priority Filter
      if (priorityFilter && ticket.priorityId !== priorityFilter && ticket.priority !== priorityFilter) {
        return false;
      }

      return true;
    });
  });

  // Computed Metrics from real API data
  metrics = computed(() => {
    const list = this.tickets();
    const total = list.length;
    let newCount = 0;
    let assigned = 0;
    let inProgress = 0;
    let completed = 0;

    for (const t of list) {
      const s = (t.status || '').toLowerCase();
      if (s.includes('new') || s.includes('waiting')) {
        newCount++;
      } else if (s.includes('assigned')) {
        assigned++;
      } else if (s.includes('progress') || s.includes('in progress')) {
        inProgress++;
      } else if (s.includes('completed') || s.includes('done')) {
        completed++;
      }
    }

    return { total, newCount, assigned, inProgress, completed };
  });

  get hasActiveFilters(): boolean {
    return !!(this.selectedStatusFilter || this.selectedTechnicianFilter || this.selectedPriorityFilter);
  }

  ngOnInit(): void {
    this.initForms();
    this.loadData();
  }

  private initForms(): void {
    this.createForm = this.fb.group({
      customerId: ['', Validators.required],
      cycleId: ['', Validators.required],
      companyName: [''],
      statusId: ['', Validators.required],
      priorityId: ['', Validators.required],
      assigneeId: ['', Validators.required],
      contactPhone: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      description: ['', Validators.required]
    });

    this.editForm = this.fb.group({
      statusId: ['', Validators.required],
      priorityId: ['', Validators.required],
      assigneeId: [''],
      contactPhone: [''],
      contactEmail: ['', Validators.email],
      description: ['']
    });
  }

  loadData(): void {
    this.loadError.set(false);
    this.loadErrorMessage.set('');

    // Fetch Tickets from API
    this.ticketService.getTickets().subscribe({
      next: () => {
        // Tickets loaded silently
      },
      error: (err) => {
        this.loadError.set(true);
        this.loadErrorMessage.set(err?.message || 'Failed to connect to /api/tickets');
        this.notificationService.handleApiError('load service tickets', err, 'Unable to load service tickets. Please try again.');
      }
    });

    // Fetch Misc Lookups
    this.miscService.loadAllLookups().subscribe({
      next: (lookups) => {
        // 1. Statuses
        if (lookups.statuses && lookups.statuses.length > 0) {
          this.statusOptions = lookups.statuses.map(s => ({ label: s.name, value: s.id }));
          this.statusFilterOptions = [
            { label: 'All Statuses', value: null },
            ...lookups.statuses.map(s => ({ label: s.name, value: s.id }))
          ];
        }

        // 2. Priorities
        if (lookups.priorities && lookups.priorities.length > 0) {
          this.priorityOptions = lookups.priorities.map(p => ({ label: p.name, value: p.id }));
          this.priorityFilterOptions = [
            { label: 'All Priorities', value: null },
            ...lookups.priorities.map(p => ({ label: p.name, value: p.id }))
          ];
        }

        // 3. Technicians / Users
        if (lookups.users && lookups.users.length > 0) {
          this.assigneeOptions = lookups.users.map(u => ({
            label: `${(u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.email)} (${u.email})`,
            value: u.id
          }));
          this.technicianFilterOptions = [
            { label: 'All Technicians', value: null },
            ...lookups.users.map(u => ({
              label: (u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.email) || u.id,
              value: u.id
            }))
          ];
        }

        // 4. Customers
        if (lookups.customers && lookups.customers.length > 0) {
          this.customerOptions = lookups.customers.map(c => ({
            label: `${c.name} (${c.phoneNumber || 'No Phone'})`,
            value: c.id
          }));
        }

        this.populateCycleOptions();
      }
    });
  }

  private populateCycleOptions(customerId?: string): void {
    const allBikes = this.dataService.bicycles();

    if (customerId) {
      const customerBikes = allBikes.filter(b => b.customerId === customerId);
      if (customerBikes.length > 0) {
        this.cycleOptions = customerBikes.map(b => ({
          label: `${b.brand} ${b.model} (${b.type || 'Cycle'}) [S/N: ${b.serialNumber || b.frameNumber || 'N/A'}]`,
          value: b.id
        }));
      } else {
        this.cycleOptions = [
          { label: `Primary Cycle (Customer ID: ${customerId.substring(0, 8)})`, value: customerId },
          ...allBikes.map(b => ({
            label: `${b.brand} ${b.model} (${b.customerName || 'Registered Bike'})`,
            value: b.id
          }))
        ];
      }
    } else {
      this.cycleOptions = allBikes.map(b => ({
        label: `${b.brand} ${b.model} (${b.customerName || 'Registered Bike'}) [${b.id}]`,
        value: b.id
      }));
    }
  }

  onCustomerSelect(customerId: string): void {
    const backendCust = this.miscService.customers().find(c => c.id === customerId);
    const localCust = this.dataService.customers().find(c => c.id === customerId);

    const phone = backendCust?.phoneNumber || localCust?.phone || '';
    const email = backendCust?.email || localCust?.email || '';
    const company = localCust?.companyName || '';

    this.createForm.patchValue({
      contactPhone: phone,
      contactEmail: email,
      companyName: company
    });

    this.populateCycleOptions(customerId);
    if (this.cycleOptions.length > 0) {
      this.createForm.patchValue({ cycleId: this.cycleOptions[0].value });
    }
  }

  applyFilters(): void {
    // triggers computed filteredTickets
  }

  clearFilters(): void {
    this.selectedStatusFilter = null;
    this.selectedTechnicianFilter = null;
    this.selectedPriorityFilter = null;
  }

  openCreateDialog(): void {
    // Fetch fresh lookups from Misc API whenever Create is clicked
    this.miscService.loadAllLookups().subscribe({
      next: (lookups) => {
        if (lookups.statuses && lookups.statuses.length > 0) {
          this.statusOptions = lookups.statuses.map(s => ({ label: s.name, value: s.id }));
        }
        if (lookups.priorities && lookups.priorities.length > 0) {
          this.priorityOptions = lookups.priorities.map(p => ({ label: p.name, value: p.id }));
        }
        if (lookups.users && lookups.users.length > 0) {
          this.assigneeOptions = lookups.users.map(u => ({
            label: `${(u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.email)} (${u.email})`,
            value: u.id
          }));
        }
        if (lookups.customers && lookups.customers.length > 0) {
          this.customerOptions = lookups.customers.map(c => ({
            label: `${c.name} (${c.phoneNumber || 'No Phone'})`,
            value: c.id
          }));
        }
        this.populateCycleOptions();

        this.createForm.reset({
          statusId: this.statusOptions.length > 0 ? this.statusOptions[0].value : '',
          priorityId: this.priorityOptions.length > 0 ? this.priorityOptions[0].value : '',
          assigneeId: this.assigneeOptions.length > 0 ? this.assigneeOptions[0].value : ''
        });
        this.createDialogVisible = true;
      },
      error: () => {
        this.createForm.reset({
          statusId: this.statusOptions.length > 0 ? this.statusOptions[0].value : '',
          priorityId: this.priorityOptions.length > 0 ? this.priorityOptions[0].value : '',
          assigneeId: this.assigneeOptions.length > 0 ? this.assigneeOptions[0].value : ''
        });
        this.createDialogVisible = true;
      }
    });
  }

  isCreateFieldInvalid(fieldName: string): boolean {
    const f = this.createForm.get(fieldName);
    return !!(f && f.invalid && (f.dirty || f.touched || this.isSubmitting));
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      this.notificationService.showError('Incomplete Form', 'Please fill in all required fields.');
      return;
    }

    this.isSubmitting = true;
    const val = this.createForm.value;

    const payload: CreateTicketRequest = {
      customerId: val.customerId,
      cycleId: val.cycleId,
      companyName: val.companyName?.trim() ? val.companyName.trim() : null,
      statusId: val.statusId,
      priorityId: val.priorityId,
      assigneeId: val.assigneeId,
      contactPhone: val.contactPhone,
      contactEmail: val.contactEmail,
      description: val.description
    };

    this.ticketService.createTicket(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.createDialogVisible = false;
        this.notificationService.showApiSuccess(
          'create',
          'Service ticket',
          `Ticket #${res.id?.substring(0, 8) || 'NEW'} created successfully.`
        );
        this.loadData();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.notificationService.handleApiError('create service ticket', err);
      }
    });
  }

  openEditDialog(ticket: TicketResponseDto): void {
    this.selectedTicketForEdit = ticket;

    // Fetch fresh lookups from Misc API whenever Edit is clicked
    this.miscService.loadAllLookups().subscribe({
      next: (lookups) => {
        if (lookups.statuses && lookups.statuses.length > 0) {
          this.statusOptions = lookups.statuses.map(s => ({ label: s.name, value: s.id }));
        }
        if (lookups.priorities && lookups.priorities.length > 0) {
          this.priorityOptions = lookups.priorities.map(p => ({ label: p.name, value: p.id }));
        }
        if (lookups.users && lookups.users.length > 0) {
          this.assigneeOptions = lookups.users.map(u => ({
            label: `${(u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.email)} (${u.email})`,
            value: u.id
          }));
        }

        // Match status by ID or by name
        const matchedStatus = this.statusOptions.find(
          s => s.value === ticket.statusId || s.label.toLowerCase() === (ticket.status || '').toLowerCase()
        );
        const statusVal = matchedStatus ? matchedStatus.value : (ticket.statusId || (this.statusOptions[0]?.value ?? ''));

        // Match priority by ID or by name
        const matchedPriority = this.priorityOptions.find(
          p => p.value === ticket.priorityId || p.label.toLowerCase() === (ticket.priority || '').toLowerCase()
        );
        const priorityVal = matchedPriority ? matchedPriority.value : (ticket.priorityId || (this.priorityOptions[0]?.value ?? ''));

        // Match assignee by ID or name
        const matchedAssignee = this.assigneeOptions.find(
          a => a.value === ticket.assigneeId || (ticket.assigneeName && a.label.toLowerCase().includes(ticket.assigneeName.toLowerCase()))
        );
        const assigneeVal = matchedAssignee ? matchedAssignee.value : (ticket.assigneeId || '');

        this.editForm.patchValue({
          statusId: statusVal,
          priorityId: priorityVal,
          assigneeId: assigneeVal,
          contactPhone: ticket.contactPhone || '',
          contactEmail: ticket.contactEmail || '',
          description: ticket.description || ''
        });

        this.editDialogVisible = true;
      },
      error: () => {
        // Fallback with current options if network fails
        this.editForm.patchValue({
          statusId: ticket.statusId,
          priorityId: ticket.priorityId,
          assigneeId: ticket.assigneeId,
          contactPhone: ticket.contactPhone,
          contactEmail: ticket.contactEmail,
          description: ticket.description
        });
        this.editDialogVisible = true;
      }
    });
  }

  submitEdit(): void {
    if (!this.selectedTicketForEdit) return;

    this.isSubmitting = true;
    const val = this.editForm.value;

    const payload: UpdateTicketRequest = {
      statusId: val.statusId,
      priorityId: val.priorityId,
      assigneeId: val.assigneeId || null,
      contactPhone: val.contactPhone,
      contactEmail: val.contactEmail,
      description: val.description
    };

    this.ticketService.updateTicket(this.selectedTicketForEdit.id, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.editDialogVisible = false;
        this.notificationService.showApiSuccess(
          'update',
          'Service ticket',
          'Service ticket updated successfully.'
        );
        this.loadData();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.notificationService.handleApiError('update service ticket', err);
      }
    });
  }

  openViewDialog(ticket: TicketResponseDto): void {
    this.selectedTicketForView = ticket;
    this.generateQrCodeForTicket(ticket);
    this.viewDialogVisible = true;
  }

  generateQrCodeForTicket(ticket: TicketResponseDto): void {
    this.viewQrDataUrl = null;
    this.viewQrUrl = '';

    if (!ticket || !ticket.cycleId) {
      return;
    }

    this.isGeneratingQr = true;
    const baseUrl = this.configService.apiUrl.replace(/\/+$/, '');
    this.viewQrUrl = `${baseUrl}/api/cycles/${ticket.cycleId}/service-info`;

    QRCode.toDataURL(this.viewQrUrl, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
      .then((url) => {
        this.viewQrDataUrl = url;
        this.isGeneratingQr = false;
      })
      .catch((err) => {
        console.error('Failed to generate QR code:', err);
        this.viewQrDataUrl = null;
        this.isGeneratingQr = false;
      });
  }

  printQrCode(): void {
    if (!this.viewQrDataUrl || !this.selectedTicketForView?.cycleId) {
      this.notificationService.showWarning('QR Unavailable', 'No valid QR code available to print.');
      return;
    }

    const cycleId = this.selectedTicketForView.cycleId;
    const cycleModel = this.selectedTicketForView.cycleModel || 'Cycle';
    const qrUrl = this.viewQrUrl;
    const qrDataUrl = this.viewQrDataUrl;

    const printWindow = window.open('', '_blank', 'width=450,height=550');
    if (!printWindow) {
      this.notificationService.showWarning('Popup Blocked', 'Please allow popups for printing the QR code.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cycle Service QR - ${cycleId}</title>
          <style>
            @page {
              size: auto;
              margin: 8mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              text-align: center;
              margin: 0;
              padding: 20px;
              color: #111827;
              background: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .qr-card {
              display: inline-block;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 16px;
              max-width: 320px;
              box-sizing: border-box;
              background: #ffffff;
            }
            .brand-title {
              font-size: 13px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #ea580c;
              margin-bottom: 2px;
            }
            .brand-subtitle {
              font-size: 11px;
              font-weight: 600;
              color: #374151;
              margin-bottom: 12px;
            }
            .qr-code-container {
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 0 auto 10px auto;
            }
            .qr-code-print {
              width: 3cm !important;
              height: 3cm !important;
              min-width: 3cm;
              min-height: 3cm;
              max-width: 3cm;
              max-height: 3cm;
              display: block;
              margin: 0 auto;
            }
            .cycle-info {
              font-size: 11px;
              font-weight: 700;
              color: #111827;
              margin-bottom: 2px;
            }
            .cycle-id {
              font-size: 10px;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              color: #4b5563;
              margin-bottom: 8px;
            }
            .scan-instruction {
              font-size: 10px;
              color: #4b5563;
              margin-bottom: 6px;
              font-weight: 500;
            }
            .qr-url {
              font-size: 8.5px;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              color: #4b5563;
              word-break: break-all;
              background: #f9fafb;
              padding: 4px 6px;
              border-radius: 4px;
              border: 1px solid #e5e7eb;
            }
            @media print {
              body {
                padding: 0;
              }
              .qr-card {
                border: 1px solid #d1d5db;
              }
              .qr-code-print {
                width: 5cm !important;
                height:5cm !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-card">
            <div class="brand-title">FREEWHEEL SERVICE CENTER</div>
            <div class="qr-code-container">
              <img src="${qrDataUrl}" alt="QR Code" class="qr-code-print" />
            </div>
            <div class="cycle-info">${cycleModel}</div>
          </div>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  getStatusSeverity(status?: string | null): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    if (!status) return 'info';
    const s = status.toLowerCase();
    if (s.includes('completed') || s.includes('done')) return 'success';
    if (s.includes('progress')) return 'warn';
    if (s.includes('assigned')) return 'info';
    if (s.includes('cancel')) return 'danger';
    if (s.includes('new') || s.includes('waiting')) return 'info';
    return 'secondary';
  }

  getPrioritySeverity(priority?: string | null): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    if (!priority) return 'secondary';
    const p = priority.toLowerCase();
    if (p.includes('urgent')) return 'danger';
    if (p.includes('high')) return 'warn';
    if (p.includes('medium')) return 'info';
    if (p.includes('low')) return 'secondary';
    return 'secondary';
  }
}
