import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CycleDataService } from '../../services/cycle-data.service';
import { TicketService } from '../../services/ticket.service';
import { MiscService } from '../../services/misc.service';
import { CycleService } from '../../services/cycle.service';
import { FreewheelCatalogService } from '../../services/freewheel-catalog.service';
import { AppNotificationService } from '../../common/services/notification.service';
import {
  CreateTicketRequest,
  UpdateTicketRequest,
  CustomerCycleLookup,
  MiscCustomer,
  MiscUser,
  MiscStatus,
  MiscPriority
} from '../../models/api.models';
import {
  SERVICE_TICKET_UDF_DEFINITIONS,
  buildServiceTicketUdfPayload,
  extractUdfFromTicket,
  ServiceTicketUdfFormValues
} from '../../features/service-ticket/models/service-ticket-udf-mapping';

interface CycleSpecSummary {
  id: string;
  brand: string;
  model: string;
  bicycleType: string;
  serialNumber: string;
  brakeSystem: string;
  drivetrain: string;
  wheelTyreSize: string;
  status?: string;
}

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    TextareaModule,
    ButtonModule,
    MessageModule,
    TagModule,
    TooltipModule
  ],
  template: `
    <div class="max-w-6xl mx-auto pb-16 px-4 sm:px-6">
      <!-- Breadcrumb & Header Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pt-2">
        <div>
          <div class="flex items-center gap-2 text-xs text-muted-color mb-1.5">
            <a routerLink="/services" class="hover:text-primary transition-colors flex items-center gap-1 font-medium">
              <i class="pi pi-wrench text-[11px]"></i>
              <span>Services</span>
            </a>
            <i class="pi pi-chevron-right text-[10px]"></i>
            <span class="text-surface-900 dark:text-surface-0 font-semibold">
              {{ isEditMode ? 'Edit Service Ticket' : 'Create Service Ticket' }}
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">
            {{ isEditMode ? 'Edit Service Ticket #' + (editTicketId ? editTicketId.substring(0, 8).toUpperCase() : '') : 'Create Service Ticket' }}
          </h1>
          <p class="text-xs sm:text-sm text-muted-color mt-0.5">
            {{ isEditMode 
              ? 'Update workshop progress, intake conditions, mechanic diagnostic notes, and work logs.' 
              : 'Register customer bicycle intake, log diagnostics, assign technician, and create workshop repair order.' }}
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <p-button
            label="Cancel"
            icon="pi pi-times"
            [outlined]="true"
            severity="secondary"
            routerLink="/services"
            size="small"
            [disabled]="submitting"
          ></p-button>
          <p-button
            [label]="isEditMode ? 'Save Changes' : 'Create Service Ticket'"
            [icon]="isEditMode ? 'pi pi-check' : 'pi pi-plus'"
            (click)="onSubmit()"
            [loading]="submitting"
            size="small"
            styleClass="bg-orange-500 hover:bg-orange-600 border-none font-semibold text-white px-4 shadow-sm"
          ></p-button>
        </div>
      </div>

      <!-- Main Form Container -->
      <form [formGroup]="serviceForm" (ngSubmit)="onSubmit()" class="space-y-6">

        <!-- ============================================================= -->
        <!-- SECTION 1: CUSTOMER AND BICYCLE                               -->
        <!-- ============================================================= -->
        <div class="bg-surface-0 dark:bg-surface-900 rounded-2xl p-5 sm:p-7 shadow-sm border border-surface-200 dark:border-surface-700">
          <div class="flex items-center gap-3 pb-4 mb-5 border-b border-surface-200 dark:border-surface-700">
            <div class="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
              <i class="pi pi-user text-base"></i>
            </div>
            <div>
              <h2 class="text-base font-bold text-surface-900 dark:text-surface-0">1. Customer and Bicycle</h2>
              <p class="text-xs text-muted-color">Select customer account and the specific bicycle being admitted for service</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- Customer Selection -->
            <div>
              <label class="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                Customer <span class="text-red-500">*</span>
              </label>
              <p-select
                [options]="customerOptions"
                formControlName="customerId"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Customer (Name or Phone)"
                [filter]="true"
                filterBy="label"
                (onChange)="onCustomerChange($event.value)"
                [loading]="isLoadingCustomers"
                [disabled]="isEditMode"
                appendTo="body"
                styleClass="w-full"
                [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('customerId') }"
              ></p-select>
              <div *ngIf="isFieldInvalid('customerId')" class="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                <i class="pi pi-exclamation-circle text-[11px]"></i>
                Customer selection is required.
              </div>
            </div>

            <!-- Bicycle Selection -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider">
                  Bicycle / Fleet Cycle <span class="text-red-500">*</span>
                </label>
                <button
                  *ngIf="serviceForm.get('customerId')?.value && !isEditMode"
                  type="button"
                  (click)="fetchCustomerCycles(serviceForm.get('customerId')?.value, true)"
                  class="text-[11px] text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium flex items-center gap-1 transition-colors"
                  [disabled]="isLoadingCycles"
                >
                  <i class="pi pi-refresh text-[10px]" [ngClass]="{ 'pi-spin': isLoadingCycles }"></i>
                  <span>Reload Cycles</span>
                </button>
              </div>

              <p-select
                [options]="cycleOptions"
                formControlName="cycleId"
                optionLabel="label"
                optionValue="value"
                [placeholder]="isLoadingCycles ? 'Loading customer cycles...' : (serviceForm.get('customerId')?.value ? 'Select Bicycle' : 'Select Customer first')"
                [filter]="true"
                filterBy="label"
                (onChange)="onCycleChange($event.value)"
                [loading]="isLoadingCycles"
                [disabled]="!serviceForm.get('customerId')?.value || isLoadingCycles || isEditMode"
                appendTo="body"
                styleClass="w-full"
                [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('cycleId') }"
              ></p-select>

              <!-- Helper Messages -->
              <div *ngIf="isFieldInvalid('cycleId')" class="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                <i class="pi pi-exclamation-circle text-[11px]"></i>
                Bicycle selection is required.
              </div>
              <div *ngIf="noCyclesFound && serviceForm.get('customerId')?.value" class="mt-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2">
                <i class="pi pi-info-circle text-amber-500 mt-0.5"></i>
                <div>
                  <span class="font-semibold">No bicycles registered for this customer.</span>
                  <p class="mt-0.5 text-[11px]">Please register a bicycle for this customer before creating a service ticket.</p>
                </div>
              </div>
            </div>

            <!-- Company / Organization Name (Optional) -->
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                Company / Organization / Fleet Account (Optional)
              </label>
              <input
                pInputText
                formControlName="companyName"
                placeholder="e.g. Acme Cycling Club, Vance Logistics, Metro Fleet (optional)"
                class="w-full"
              />
            </div>
          </div>

          <!-- Read-Only Bicycle Summary Card (Shown when bicycle is selected) -->
          <div *ngIf="selectedBicycle" class="mt-5 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-surface-50 to-orange-50/30 dark:from-surface-800/80 dark:to-orange-950/20 border border-orange-200/70 dark:border-orange-900/50 shadow-inner">
            <div class="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-orange-200/50 dark:border-orange-900/40">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-md bg-orange-500 text-white flex items-center justify-center text-xs">
                  <i class="pi pi-compass"></i>
                </div>
                <h3 class="text-xs sm:text-sm font-bold text-surface-900 dark:text-surface-0 uppercase tracking-wider">
                  Bicycle Information (Read-Only Specs)
                </h3>
              </div>
              <span class="font-mono text-[11px] text-muted-color">ID: {{ selectedBicycle.id }}</span>
            </div>

            <!-- 7 Key Bicycle Specs Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
              <!-- Brand -->
              <div class="p-2.5 rounded-lg bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700">
                <span class="text-muted-color font-semibold uppercase text-[10px] block mb-0.5">Brand</span>
                <span class="font-bold text-surface-900 dark:text-surface-0">{{ selectedBicycle.brand || '—' }}</span>
              </div>

              <!-- Model -->
              <div class="p-2.5 rounded-lg bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700">
                <span class="text-muted-color font-semibold uppercase text-[10px] block mb-0.5">Model</span>
                <span class="font-bold text-surface-900 dark:text-surface-0">{{ selectedBicycle.model || '—' }}</span>
              </div>

              <!-- Bicycle Type -->
              <div class="p-2.5 rounded-lg bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700">
                <span class="text-muted-color font-semibold uppercase text-[10px] block mb-0.5">Bicycle Type</span>
                <span class="font-medium text-surface-900 dark:text-surface-0">{{ selectedBicycle.bicycleType || 'Road / Hybrid' }}</span>
              </div>

              <!-- Frame Serial Number -->
              <div class="p-2.5 rounded-lg bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700">
                <span class="text-muted-color font-semibold uppercase text-[10px] block mb-0.5">Frame Serial Number</span>
                <span class="font-mono font-bold text-orange-600 dark:text-orange-400">{{ selectedBicycle.serialNumber || 'N/A' }}</span>
              </div>

              <!-- Brake System -->
              <div class="p-2.5 rounded-lg bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700">
                <span class="text-muted-color font-semibold uppercase text-[10px] block mb-0.5">Brake System</span>
                <span class="font-medium text-surface-900 dark:text-surface-0">{{ selectedBicycle.brakeSystem || 'Hydraulic Disc Brake' }}</span>
              </div>

              <!-- Drivetrain / Gear System -->
              <div class="p-2.5 rounded-lg bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700">
                <span class="text-muted-color font-semibold uppercase text-[10px] block mb-0.5">Drivetrain / Gear System</span>
                <span class="font-medium text-surface-900 dark:text-surface-0">{{ selectedBicycle.drivetrain || 'Shimano 12-Speed' }}</span>
              </div>

              <!-- Wheel / Tyre Size -->
              <div class="p-2.5 rounded-lg bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 col-span-2 sm:col-span-1 lg:col-span-2">
                <span class="text-muted-color font-semibold uppercase text-[10px] block mb-0.5">Wheel / Tyre Size</span>
                <span class="font-medium text-surface-900 dark:text-surface-0">{{ selectedBicycle.wheelTyreSize || '700x32c Tubeless Ready' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================================= -->
        <!-- SECTION 2: SERVICE DETAILS                                    -->
        <!-- ============================================================= -->
        <div class="bg-surface-0 dark:bg-surface-900 rounded-2xl p-5 sm:p-7 shadow-sm border border-surface-200 dark:border-surface-700">
          <div class="flex items-center gap-3 pb-4 mb-5 border-b border-surface-200 dark:border-surface-700">
            <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
              <i class="pi pi-cog text-base"></i>
            </div>
            <div>
              <h2 class="text-base font-bold text-surface-900 dark:text-surface-0">2. Service Details</h2>
              <p class="text-xs text-muted-color">Specify reported symptoms, priority level, service status, and catalogue jobs</p>
            </div>
          </div>

          <div class="space-y-5">
            <!-- Reported Issue (Description) -->
            <div>
              <label class="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                Reported Issue / Customer Complaint <span class="text-red-500">*</span>
              </label>
              <textarea
                pTextarea
                formControlName="description"
                rows="3"
                placeholder="Describe the primary complaint or symptoms reported by customer (e.g. chain skipping on 3rd cog, spongy brake lever, bottom bracket creak)..."
                class="w-full"
                [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('description') }"
              ></textarea>
              <div *ngIf="isFieldInvalid('description')" class="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                <i class="pi pi-exclamation-circle text-[11px]"></i>
                Reported issue description is required.
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <!-- Priority -->
              <div>
                <label class="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                  Priority <span class="text-red-500">*</span>
                </label>
                <p-select
                  [options]="priorityOptions"
                  formControlName="priorityId"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Priority"
                  appendTo="body"
                  styleClass="w-full"
                  [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('priorityId') }"
                ></p-select>
                <div *ngIf="isFieldInvalid('priorityId')" class="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                  <i class="pi pi-exclamation-circle text-[11px]"></i>
                  Priority is required.
                </div>
              </div>

              <!-- Status -->
              <div>
                <label class="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                  Initial Status <span class="text-red-500">*</span>
                </label>
                <p-select
                  [options]="statusOptions"
                  formControlName="statusId"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Status"
                  appendTo="body"
                  styleClass="w-full"
                  [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('statusId') }"
                ></p-select>
                <div *ngIf="isFieldInvalid('statusId')" class="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                  <i class="pi pi-exclamation-circle text-[11px]"></i>
                  Status is required.
                </div>
              </div>

              <!-- Requested Service(s) from Catalogue (UDF6) -->
              <div class="md:col-span-2">
                <label class="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                  Requested Service(s) from Catalogue (Optional)
                </label>
                <p-multiselect
                  [options]="serviceCatalogueOptions"
                  [(ngModel)]="selectedRequestedServices"
                  [ngModelOptions]="{standalone: true}"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select one or more services from catalogue"
                  appendTo="body"
                  styleClass="w-full"
                  display="chip"
                  [filter]="true"
                  (onChange)="syncCatalogueServicesToUdf()"
                ></p-multiselect>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================================= -->
        <!-- SECTION 3: TICKET ASSIGNMENT                                  -->
        <!-- ============================================================= -->
        <div class="bg-surface-0 dark:bg-surface-900 rounded-2xl p-5 sm:p-7 shadow-sm border border-surface-200 dark:border-surface-700">
          <div class="flex items-center gap-3 pb-4 mb-5 border-b border-surface-200 dark:border-surface-700">
            <div class="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
              <i class="pi pi-id-card text-base"></i>
            </div>
            <div>
              <h2 class="text-base font-bold text-surface-900 dark:text-surface-0">3. Ticket Assignment</h2>
              <p class="text-xs text-muted-color">Assign ticket to certified workshop technician / lead mechanic</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                Assignee / Technician <span class="text-red-500">*</span>
              </label>
              <p-select
                [options]="assigneeOptions"
                formControlName="assigneeId"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Assignee / Technician"
                [filter]="true"
                filterBy="label"
                [loading]="isLoadingAssignees"
                appendTo="body"
                styleClass="w-full"
                [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('assigneeId') }"
              ></p-select>
              <div *ngIf="isFieldInvalid('assigneeId')" class="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                <i class="pi pi-exclamation-circle text-[11px]"></i>
                Technician assignment is required.
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================================= -->
        <!-- SECTION 4: CONTACT INFORMATION                                -->
        <!-- ============================================================= -->
        <div class="bg-surface-0 dark:bg-surface-900 rounded-2xl p-5 sm:p-7 shadow-sm border border-surface-200 dark:border-surface-700">
          <div class="flex items-center gap-3 pb-4 mb-5 border-b border-surface-200 dark:border-surface-700">
            <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <i class="pi pi-phone text-base"></i>
            </div>
            <div>
              <h2 class="text-base font-bold text-surface-900 dark:text-surface-0">4. Contact Information</h2>
              <p class="text-xs text-muted-color">Verified customer communication channels for job updates and approvals</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- Phone -->
            <div>
              <label class="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                Contact Phone <span class="text-red-500">*</span>
              </label>
              <input
                pInputText
                formControlName="contactPhone"
                placeholder="+1 (555) 000-0000"
                class="w-full"
                [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('contactPhone') }"
              />
              <div *ngIf="isFieldInvalid('contactPhone')" class="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                <i class="pi pi-exclamation-circle text-[11px]"></i>
                Contact phone is required.
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                Contact Email <span class="text-red-500">*</span>
              </label>
              <input
                pInputText
                type="email"
                formControlName="contactEmail"
                placeholder="customer@example.com"
                class="w-full"
                [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('contactEmail') }"
              />
              <div *ngIf="isFieldInvalid('contactEmail')" class="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                <i class="pi pi-exclamation-circle text-[11px]"></i>
                Valid contact email is required.
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================================= -->
        <!-- SECTION 5: BICYCLE INTAKE CONDITION AND ADDITIONAL NOTES (UDF)-->
        <!-- ============================================================= -->
        <div class="bg-surface-0 dark:bg-surface-900 rounded-2xl p-5 sm:p-7 shadow-sm border border-surface-200 dark:border-surface-700">
          <div class="flex items-center gap-3 pb-4 mb-5 border-b border-surface-200 dark:border-surface-700">
            <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <i class="pi pi-clipboard text-base"></i>
            </div>
            <div>
              <h2 class="text-base font-bold text-surface-900 dark:text-surface-0">5. Bicycle Intake Condition and Additional Notes</h2>
              <p class="text-xs text-muted-color">Log condition rating, distance travelled, pre-existing damage, accessories, and inspection records</p>
            </div>
          </div>

          <div class="space-y-5">
            <!-- Row 1: Condition (UDF1) & Approx Distance (UDF3) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                  Bicycle Condition at Intake (UDF1)
                </label>
                <p-select
                  [options]="conditionOptions"
                  formControlName="udF1"
                  placeholder="Select Condition"
                  appendTo="body"
                  styleClass="w-full"
                ></p-select>
              </div>

              <div>
                <label class="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                  Approx. Distance Travelled (UDF3)
                </label>
                <input
                  pInputText
                  formControlName="udF3"
                  placeholder="e.g. 1500 km or 900 miles"
                  class="w-full"
                />
              </div>
            </div>

            <!-- Visible Damage / Pre-existing Defects (UDF2) -->
            <div>
              <label class="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                Visible Damage / Pre-existing Defects (UDF2)
              </label>
              <textarea
                pTextarea
                formControlName="udF2"
                rows="2"
                placeholder="Note any pre-existing scratches, paint chips, frame dents, rim dings, or cracked components..."
                class="w-full"
              ></textarea>
            </div>

            <!-- Components Requiring Attention (UDF7) -->
            <div>
              <label class="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                Components Requiring Attention (UDF7)
              </label>
              <div class="flex flex-wrap gap-1.5 mb-2">
                <button
                  type="button"
                  *ngFor="let comp of commonComponents"
                  (click)="toggleComponent(comp)"
                  [class]="isComponentSelected(comp) 
                    ? 'px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500 text-white shadow-sm transition-all' 
                    : 'px-2.5 py-1 rounded-full text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all'"
                >
                  <i class="pi mr-1" [ngClass]="isComponentSelected(comp) ? 'pi-check' : 'pi-plus'"></i>
                  {{ comp }}
                </button>
              </div>
              <input
                pInputText
                formControlName="udF7"
                placeholder="Selected components: Brakes, Chain, Drivetrain..."
                class="w-full text-xs"
              />
            </div>

            <!-- Accessories Received (UDF4) -->
            <div>
              <label class="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                Accessories Received with Bicycle (UDF4)
              </label>
              <div class="flex flex-wrap gap-1.5 mb-2">
                <button
                  type="button"
                  *ngFor="let acc of commonAccessories"
                  (click)="toggleAccessory(acc)"
                  [class]="isAccessorySelected(acc) 
                    ? 'px-2.5 py-1 rounded-full text-xs font-semibold bg-primary text-white shadow-sm transition-all' 
                    : 'px-2.5 py-1 rounded-full text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all'"
                >
                  <i class="pi mr-1" [ngClass]="isAccessorySelected(acc) ? 'pi-check' : 'pi-plus'"></i>
                  {{ acc }}
                </button>
              </div>
              <input
                pInputText
                formControlName="udF4"
                placeholder="e.g. Pedals, Front Light, Water Bottle Cage, Bike Computer..."
                class="w-full text-xs"
              />
            </div>

            <!-- Intake Photo Reference (UDF5) -->
            <div>
              <label class="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                Intake Photo Reference (UDF5)
              </label>
              <input
                pInputText
                formControlName="udF5"
                placeholder="URL or identifier only if supported by backend (leave blank if unsupported)"
                class="w-full"
              />
              <span class="text-[11px] text-muted-color mt-1 block">
                Note: Backend stores URL/ID references only. Base64 photo payloads are omitted to match API contract.
              </span>
            </div>

            <!-- Collapsible Mechanic Diagnostic & Work Log (UDF8, UDF9, UDF10) -->
            <div class="border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden bg-surface-50/50 dark:bg-surface-800/30 mt-4">
              <button
                type="button"
                (click)="showMechanicSection = !showMechanicSection"
                class="w-full p-4 flex items-center justify-between text-left hover:bg-surface-100/60 dark:hover:bg-surface-800/60 transition-colors"
              >
                <div class="flex items-center gap-2">
                  <i class="pi pi-wrench text-orange-500"></i>
                  <span class="text-xs sm:text-sm font-bold text-surface-900 dark:text-surface-0">
                    Mechanic Diagnostic Findings & Work Log (UDF8, UDF9, UDF10)
                  </span>
                  <span class="text-[11px] text-muted-color">(Click to expand/collapse)</span>
                </div>
                <i class="pi text-xs text-muted-color" [ngClass]="showMechanicSection ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
              </button>

              <div *ngIf="showMechanicSection" class="p-5 pt-3 space-y-4 border-t border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900">
                <!-- Inspection Findings (UDF8) -->
                <div>
                  <label class="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                    Inspection Findings (UDF8)
                  </label>
                  <textarea
                    pTextarea
                    formControlName="udF8"
                    rows="2"
                    placeholder="Mechanic diagnostic findings (e.g. Chain wear at 0.75%, brake fluid darkened, front rim out of true by 1.2mm)..."
                    class="w-full"
                  ></textarea>
                </div>

                <!-- Repair Work Performed (UDF9) -->
                <div>
                  <label class="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                    Repair Work Performed / Work Completed (UDF9)
                  </label>
                  <textarea
                    pTextarea
                    formControlName="udF9"
                    rows="2"
                    placeholder="Summary of repair actions completed (e.g. Flushed hydraulic brakes, tuned gears, trued wheel)..."
                    class="w-full"
                  ></textarea>
                </div>

                <!-- Work Approval & Parts Replaced (UDF10) -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                      Work Approval Status
                    </label>
                    <p-select
                      [options]="approvalOptions"
                      [(ngModel)]="selectedApprovalStatus"
                      [ngModelOptions]="{standalone: true}"
                      placeholder="Select Approval"
                      appendTo="body"
                      styleClass="w-full"
                      (onChange)="syncApprovalToUdf()"
                    ></p-select>
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                      Parts Replaced & Additional Notes (UDF10)
                    </label>
                    <input
                      pInputText
                      formControlName="udF10"
                      placeholder="e.g. [Approval: Approved] 1x Shimano CN-M8100 12s Chain, 2x SwissStop Disc Pads"
                      class="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Action Footer -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
          <p-button
            label="Cancel"
            icon="pi pi-times"
            severity="secondary"
            [outlined]="true"
            routerLink="/services"
            [disabled]="submitting"
          ></p-button>
          <p-button
            type="submit"
            [label]="isEditMode ? 'Save Changes' : 'Create Service Ticket'"
            [icon]="isEditMode ? 'pi pi-check' : 'pi pi-plus'"
            [loading]="submitting"
            styleClass="bg-orange-500 hover:bg-orange-600 border-none font-semibold text-white px-6 shadow-sm"
          ></p-button>
        </div>

      </form>
    </div>
  `
})
export class ServiceFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(AppNotificationService);
  protected dataService = inject(CycleDataService);
  protected ticketService = inject(TicketService);
  protected miscService = inject(MiscService);
  protected cycleService = inject(CycleService);
  protected catalogService = inject(FreewheelCatalogService);

  serviceForm!: FormGroup;
  submitting = false;
  isEditMode = false;
  editTicketId: string | null = null;
  showMechanicSection = false;

  // Dropdown states & Loading flags
  isLoadingCustomers = false;
  isLoadingCycles = false;
  isLoadingAssignees = false;
  noCyclesFound = false;

  private cycleFetchSubscription?: Subscription;

  // Selected cycle model for 7 key specifications display
  selectedBicycle: CycleSpecSummary | null = null;

  // Dropdown options
  customerOptions: { label: string; value: string; data?: MiscCustomer }[] = [];
  cycleOptions: { label: string; value: string; data?: CustomerCycleLookup }[] = [];
  statusOptions: { label: string; value: string }[] = [];
  priorityOptions: { label: string; value: string }[] = [];
  assigneeOptions: { label: string; value: string; data?: MiscUser }[] = [];
  serviceCatalogueOptions: { label: string; value: string }[] = [];

  conditionOptions = SERVICE_TICKET_UDF_DEFINITIONS.find(d => d.field === 'udF1')?.options || [
    { label: 'Good (Clean & Well Kept)', value: 'Good' },
    { label: 'Fair (Normal Wear & Tear)', value: 'Fair' },
    { label: 'Poor (Excessive Grime / Heavy Wear)', value: 'Poor' },
    { label: 'Severely Damaged (Crash / Structural)', value: 'Severely Damaged' }
  ];

  approvalOptions = [
    { label: 'Approved by Customer', value: 'Approved' },
    { label: 'Pending Customer Approval', value: 'Pending Approval' },
    { label: 'Declined', value: 'Declined' },
    { label: 'Not Applicable', value: 'Not Applicable' }
  ];

  selectedApprovalStatus = 'Approved';
  selectedRequestedServices: string[] = [];
  selectedComponentsList: string[] = [];
  selectedAccessoriesList: string[] = [];

  commonComponents = [
    'Brakes',
    'Chain',
    'Cassette',
    'Wheels & Spokes',
    'Tyres & Tubes',
    'Suspension / Fork',
    'Electrical / Battery',
    'Bottom Bracket / Bearings',
    'Handlebars / Cockpit',
    'Pedals'
  ];

  commonAccessories = [
    'Pedals',
    'Front Light',
    'Rear Light',
    'Water Bottle Cage',
    'Lock / Chain',
    'Bike Computer / GPS',
    'Saddle Bag',
    'Bell',
    'Helmet',
    'None'
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadCatalogServices();
    this.loadMiscLookups();
    this.checkEditModeAndParams();
  }

  ngOnDestroy(): void {
    if (this.cycleFetchSubscription) {
      this.cycleFetchSubscription.unsubscribe();
    }
  }

  private initForm(): void {
    this.serviceForm = this.fb.group({
      customerId: ['', Validators.required],
      cycleId: ['', Validators.required],
      companyName: [''],
      statusId: ['', Validators.required],
      priorityId: ['', Validators.required],
      assigneeId: ['', Validators.required],
      contactPhone: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      description: ['', [Validators.required, Validators.minLength(3)]],
      // UDF fields (Single Source of Truth)
      udF1: ['Good'], // Bicycle Condition at Intake
      udF2: [''],     // Visible Damage / Defects
      udF3: [''],     // Approx Distance Travelled
      udF4: [''],     // Accessories Received
      udF5: [''],     // Intake Photo Reference
      udF6: [''],     // Bicycle Type / Requested Services
      udF7: [''],     // Components Requiring Attention
      udF8: [''],     // Inspection Findings
      udF9: [''],     // Repair Work Performed
      udF10: ['']     // Work Approval & Parts Replaced
    });
  }

  private loadCatalogServices(): void {
    const services = this.catalogService.services();
    this.serviceCatalogueOptions = services.map(s => ({
      label: `${s.name} (${s.department} • ₹${s.basePrice})`,
      value: s.name
    }));
  }

  private loadMiscLookups(): void {
    this.isLoadingCustomers = true;
    this.isLoadingAssignees = true;

    this.miscService.loadAllLookups().subscribe({
      next: (lookups) => {
        this.isLoadingCustomers = false;
        this.isLoadingAssignees = false;

        // 1. Customers
        if (lookups.customers && lookups.customers.length > 0) {
          this.customerOptions = lookups.customers.map(c => ({
            label: `${c.name} (${c.phoneNumber || 'No Phone'})`,
            value: c.id,
            data: c
          }));
        } else {
          this.customerOptions = this.dataService.customers().map(c => ({
            label: `${c.name} (${c.phone})`,
            value: c.id,
            data: { id: c.id, name: c.name, phoneNumber: c.phone, email: c.email }
          }));
        }

        // 2. Statuses
        if (lookups.statuses && lookups.statuses.length > 0) {
          this.statusOptions = lookups.statuses.map(s => ({
            label: s.name,
            value: s.id
          }));
        } else {
          this.statusOptions = [
            { label: 'Waiting', value: '46c820b1-50e5-4f7f-8cae-736a61b8fbf1' },
            { label: 'Assigned', value: '46c820b1-50e5-4f7f-8cae-736a61b8fbf2' },
            { label: 'In Progress', value: '46c820b1-50e5-4f7f-8cae-736a61b8fbf3' },
            { label: 'Completed', value: '46c820b1-50e5-4f7f-8cae-736a61b8fbf4' }
          ];
        }
        if (!this.serviceForm.get('statusId')?.value && this.statusOptions.length > 0) {
          this.serviceForm.patchValue({ statusId: this.statusOptions[0].value });
        }

        // 3. Priorities
        if (lookups.priorities && lookups.priorities.length > 0) {
          this.priorityOptions = lookups.priorities.map(p => ({
            label: p.name,
            value: p.id
          }));
        } else {
          this.priorityOptions = [
            { label: 'Low', value: 'e5e9b862-246d-4767-aeb8-796ec1ba0001' },
            { label: 'Medium', value: 'e5e9b862-246d-4767-aeb8-796ec1ba0002' },
            { label: 'High', value: 'e5e9b862-246d-4767-aeb8-796ec1ba0003' },
            { label: 'Urgent', value: 'e5e9b862-246d-4767-aeb8-796ec1ba0004' }
          ];
        }
        if (!this.serviceForm.get('priorityId')?.value && this.priorityOptions.length > 0) {
          const medium = this.priorityOptions.find(p => p.label.toLowerCase().includes('medium')) || this.priorityOptions[0];
          this.serviceForm.patchValue({ priorityId: medium.value });
        }

        // 4. Assignees (Users / Technicians)
        if (lookups.users && lookups.users.length > 0) {
          this.assigneeOptions = lookups.users.map(u => ({
            label: `${(u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.email)} (${u.email || 'Staff'})`,
            value: u.id,
            data: u
          }));
        } else {
          this.assigneeOptions = this.dataService.technicians().map(t => ({
            label: `${t.name} — ${t.specialization}`,
            value: t.id
          }));
        }
        if (!this.serviceForm.get('assigneeId')?.value && this.assigneeOptions.length > 0) {
          this.serviceForm.patchValue({ assigneeId: this.assigneeOptions[0].value });
        }

        // Handle initial query params after lookups are loaded
        this.processInitialParameters();
      },
      error: () => {
        this.isLoadingCustomers = false;
        this.isLoadingAssignees = false;
        this.customerOptions = this.dataService.customers().map(c => ({
          label: `${c.name} (${c.phone})`,
          value: c.id
        }));
        this.assigneeOptions = this.dataService.technicians().map(t => ({
          label: `${t.name} — ${t.specialization}`,
          value: t.id
        }));
        this.processInitialParameters();
      }
    });
  }

  private checkEditModeAndParams(): void {
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    const editIdFromQuery = this.route.snapshot.queryParamMap.get('editTicketId') || this.route.snapshot.queryParamMap.get('id');
    const ticketId = idFromRoute || editIdFromQuery;

    if (ticketId) {
      this.isEditMode = true;
      this.editTicketId = ticketId;
      this.loadExistingTicket(ticketId);
    }
  }

  private processInitialParameters(): void {
    if (this.isEditMode) return;

    this.route.queryParams.subscribe(params => {
      const customerId = params['customerId'];
      const cycleId = params['cycleId'];
      const desc = params['description'];

      if (customerId) {
        this.serviceForm.patchValue({ customerId });
        this.onCustomerChange(customerId, cycleId);
      }
      if (desc) {
        this.serviceForm.patchValue({ description: desc });
      }
    });
  }

  private loadExistingTicket(ticketId: string): void {
    this.ticketService.getTicketById(ticketId).subscribe({
      next: (ticket) => {
        if (!ticket) return;

        const udfValues = extractUdfFromTicket(ticket);

        this.serviceForm.patchValue({
          customerId: ticket.customerId,
          cycleId: ticket.cycleId,
          companyName: ticket.companyName || '',
          statusId: ticket.statusId,
          priorityId: ticket.priorityId,
          assigneeId: ticket.assigneeId,
          contactPhone: ticket.contactPhone,
          contactEmail: ticket.contactEmail,
          description: ticket.description || '',
          udF1: udfValues.udF1 || 'Good',
          udF2: udfValues.udF2 || '',
          udF3: udfValues.udF3 || '',
          udF4: udfValues.udF4 || '',
          udF5: udfValues.udF5 || '',
          udF6: udfValues.udF6 || '',
          udF7: udfValues.udF7 || '',
          udF8: udfValues.udF8 || '',
          udF9: udfValues.udF9 || '',
          udF10: udfValues.udF10 || ''
        });

        // Parse accessories and components lists
        if (udfValues.udF4) {
          this.selectedAccessoriesList = udfValues.udF4.split(',').map(s => s.trim()).filter(Boolean);
        }
        if (udfValues.udF7) {
          this.selectedComponentsList = udfValues.udF7.split(',').map(s => s.trim()).filter(Boolean);
        }
        if (udfValues.udF6) {
          this.selectedRequestedServices = udfValues.udF6.split(',').map(s => s.trim()).filter(Boolean);
        }
        if (udfValues.udF8 || udfValues.udF9 || udfValues.udF10) {
          this.showMechanicSection = true;
        }

        // Fetch customer cycles to display bicycle details
        if (ticket.customerId) {
          this.fetchCustomerCycles(ticket.customerId, false, ticket.cycleId);
        }
      },
      error: (err) => {
        this.notificationService.handleApiError('load ticket details', err, 'Unable to load ticket details for editing.');
      }
    });
  }

  /**
   * Called when Customer selection changes:
   * 1. Prepopulates contact phone and email from customer data.
   * 2. Clears previous cycle selection and options immediately.
   * 3. Fetches cycles via GET /api/misc/customers/{customerId}/cycles.
   */
  onCustomerChange(customerId: string, targetCycleId?: string): void {
    if (!customerId || !customerId.trim()) {
      this.serviceForm.patchValue({
        cycleId: '',
        contactPhone: '',
        contactEmail: '',
        companyName: ''
      });
      this.cycleOptions = [];
      this.selectedBicycle = null;
      this.noCyclesFound = false;
      return;
    }

    // Prepopulate contact details from customer records
    const custOption = this.customerOptions.find(c => c.value === customerId);
    const backendCust = custOption?.data || this.miscService.customers().find(c => c.id === customerId);
    const localCust = this.dataService.customers().find(c => c.id === customerId);

    const phone = backendCust?.phoneNumber || localCust?.phone || '';
    const email = backendCust?.email || localCust?.email || '';
    const company = localCust?.companyName || '';

    this.serviceForm.patchValue({
      contactPhone: phone,
      contactEmail: email,
      companyName: company || this.serviceForm.get('companyName')?.value || ''
    });

    // Fetch cycles for customer
    this.fetchCustomerCycles(customerId, true, targetCycleId);
  }

  /**
   * Fetches cycles specifically registered for the given customer ID.
   * Cancels any in-flight requests and handles empty / error states.
   */
  fetchCustomerCycles(customerId: string, autoSelectFirst = true, targetCycleId?: string): void {
    if (!customerId || !customerId.trim()) return;

    // 1. Clear previous cycle selections immediately
    this.serviceForm.patchValue({ cycleId: '' });
    this.cycleOptions = [];
    this.selectedBicycle = null;
    this.noCyclesFound = false;
    this.isLoadingCycles = true;

    // 2. Cancel any pending request
    if (this.cycleFetchSubscription) {
      this.cycleFetchSubscription.unsubscribe();
    }

    // 3. Call GET /api/misc/customers/{customerId}/cycles
    this.cycleFetchSubscription = this.miscService.getCustomerCycles(customerId).pipe(
      catchError((err) => {
        this.isLoadingCycles = false;
        console.log(err)
        this.notificationService.showWarning(
          'Cycles API Notice',
          `Could not retrieve cycles from /api/misc/customers/${customerId}/cycles. Falling back to local fleet.`
        );
        return of([] as CustomerCycleLookup[]);
      })
    ).subscribe({
      next: (cycles) => {
        this.isLoadingCycles = false;

        let mappedCycles: CustomerCycleLookup[] = cycles || [];

        // If backend returned empty, check local fleet for this customer
        if (mappedCycles.length === 0) {
          const fleetBikes = this.dataService.bicycles().filter(b => b.customerId === customerId);
          if (fleetBikes.length > 0) {
            mappedCycles = fleetBikes.map(b => ({
              id: b.id,
              cycleId: b.id,
              customerId: b.customerId,
              brand: b.brand,
              model: b.model,
              serialNumber: b.serialNumber || b.frameNumber,
              frameNumber: b.frameNumber,
              bicycleType: b.type,
              brakeSystem: b.brakeType,
              drivetrain: b.gearSystem,
              wheelSize: b.wheelSize,
              tyreSize: b.tyreSize,
              status: b.status
            }));
          }
        }

        if (mappedCycles.length > 0) {
          this.noCyclesFound = false;
          this.cycleOptions = mappedCycles.map(c => {
            const cycleId = c.id || c.cycleId || '';
            const brand = c.brand ? `${c.brand} ` : '';
            const model = c.model || c.cycleModel || 'Bicycle';
            const sn = c.serialNumber || c.frameNumber ? ` [S/N: ${c.serialNumber || c.frameNumber}]` : '';
            const type = c.bicycleType || c.type ? ` • ${c.bicycleType || c.type}` : '';
            return {
              label: `${brand}${model}${type}${sn}`,
              value: cycleId,
              data: c
            };
          });

          // Determine cycle to select
          let selectedId = '';
          if (targetCycleId && this.cycleOptions.some(o => o.value === targetCycleId)) {
            selectedId = targetCycleId;
          } else if (autoSelectFirst && this.cycleOptions.length > 0) {
            selectedId = this.cycleOptions[0].value;
          }

          if (selectedId) {
            this.serviceForm.patchValue({ cycleId: selectedId });
            this.onCycleChange(selectedId);
          }
        } else {
          this.noCyclesFound = true;
          this.cycleOptions = [];
          this.selectedBicycle = null;
        }
      },
      error: () => {
        this.isLoadingCycles = false;
        this.noCyclesFound = true;
        this.cycleOptions = [];
        this.selectedBicycle = null;
      }
    });
  }

  /**
   * Called when bicycle is selected in the dropdown.
   * Updates the read-only 7-spec summary card.
   */
  onCycleChange(cycleId: string): void {
    if (!cycleId) {
      this.selectedBicycle = null;
      return;
    }

    const selectedOption = this.cycleOptions.find(o => o.value === cycleId);
    const cycleData = selectedOption?.data;
    const fleetBike = this.dataService.bicycles().find(b => b.id === cycleId);

    const brand = cycleData?.brand || fleetBike?.brand || 'Premium Brand';
    const model = cycleData?.model || cycleData?.cycleModel || fleetBike?.model || 'Road / Hybrid Model';
    const bicycleType = cycleData?.bicycleType || cycleData?.type || fleetBike?.type || 'Road';
    const serialNumber = cycleData?.serialNumber || cycleData?.frameNumber || fleetBike?.serialNumber || fleetBike?.frameNumber || 'N/A';
    const brakeSystem = cycleData?.brakeSystem || cycleData?.brakeType || fleetBike?.brakeType || 'Hydraulic Disc Brake';
    const drivetrain = cycleData?.drivetrain || cycleData?.gearSystem || fleetBike?.gearSystem || 'Shimano 12-Speed';
    const wheelSize = cycleData?.wheelSize || fleetBike?.wheelSize || '700c';
    const tyreSize = cycleData?.tyreSize || fleetBike?.tyreSize || '32c Tubeless';
    const wheelTyreSize = `${wheelSize} • ${tyreSize}`;

    this.selectedBicycle = {
      id: cycleId,
      brand,
      model,
      bicycleType,
      serialNumber,
      brakeSystem,
      drivetrain,
      wheelTyreSize,
      status: cycleData?.status || fleetBike?.status || 'Active'
    };

    // Auto populate UDF6 bicycle type if empty
    if (!this.serviceForm.get('udF6')?.value) {
      this.serviceForm.patchValue({
        udF6: `${brand} ${model} (${bicycleType})`
      });
    }
  }

  toggleComponent(comp: string): void {
    const idx = this.selectedComponentsList.indexOf(comp);
    if (idx >= 0) {
      this.selectedComponentsList.splice(idx, 1);
    } else {
      this.selectedComponentsList.push(comp);
    }
    this.serviceForm.patchValue({
      udF7: this.selectedComponentsList.join(', ')
    });
  }

  isComponentSelected(comp: string): boolean {
    return this.selectedComponentsList.includes(comp);
  }

  toggleAccessory(acc: string): void {
    if (acc === 'None') {
      this.selectedAccessoriesList = ['None'];
    } else {
      this.selectedAccessoriesList = this.selectedAccessoriesList.filter(a => a !== 'None');
      const idx = this.selectedAccessoriesList.indexOf(acc);
      if (idx >= 0) {
        this.selectedAccessoriesList.splice(idx, 1);
      } else {
        this.selectedAccessoriesList.push(acc);
      }
    }
    this.serviceForm.patchValue({
      udF4: this.selectedAccessoriesList.join(', ')
    });
  }

  isAccessorySelected(acc: string): boolean {
    return this.selectedAccessoriesList.includes(acc);
  }

  syncCatalogueServicesToUdf(): void {
    if (this.selectedRequestedServices.length > 0) {
      this.serviceForm.patchValue({
        udF6: this.selectedRequestedServices.join(', ')
      });
    }
  }

  syncApprovalToUdf(): void {
    let current = this.serviceForm.get('udF10')?.value || '';
    if (this.selectedApprovalStatus && !current.includes(this.selectedApprovalStatus)) {
      current = current ? `[Approval: ${this.selectedApprovalStatus}] ${current}` : `[Approval: ${this.selectedApprovalStatus}]`;
      this.serviceForm.patchValue({ udF10: current });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.serviceForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitting));
  }

  onSubmit(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      this.notificationService.showWarning(
        'Form Incomplete',
        'Please complete all required fields marked with *.'
      );
      return;
    }

    this.submitting = true;
    const formVal = this.serviceForm.value;

    // Build centralized UDF payload through mapping helper
    const udfPayload = buildServiceTicketUdfPayload({
      udF1: formVal.udF1,
      udF2: formVal.udF2,
      udF3: formVal.udF3,
      udF4: formVal.udF4,
      udF5: formVal.udF5,
      udF6: this.selectedRequestedServices.length > 0 ? this.selectedRequestedServices.join(', ') : formVal.udF6,
      udF7: formVal.udF7,
      udF8: formVal.udF8,
      udF9: formVal.udF9,
      udF10: formVal.udF10
    });

    if (this.isEditMode && this.editTicketId) {
      // UPDATE TICKET
      const updatePayload: UpdateTicketRequest = {
        statusId: formVal.statusId,
        priorityId: formVal.priorityId,
        assigneeId: formVal.assigneeId,
        contactPhone: formVal.contactPhone,
        contactEmail: formVal.contactEmail,
        description: formVal.description,
        ...udfPayload
      };

      this.ticketService.updateTicket(this.editTicketId, updatePayload).subscribe({
        next: () => {
          this.submitting = false;
          this.notificationService.showApiSuccess(
            'update',
            'Service ticket',
            `Ticket #${this.editTicketId?.substring(0, 8).toUpperCase()} updated successfully.`
          );
          setTimeout(() => {
            this.router.navigate(['/services']);
          }, 800);
        },
        error: (err) => {
          this.submitting = false;
          this.notificationService.handleApiError('update service ticket', err);
        }
      });
    } else {
      // CREATE TICKET
      const createPayload: CreateTicketRequest = {
        customerId: formVal.customerId,
        cycleId: formVal.cycleId,
        companyName: formVal.companyName?.trim() ? formVal.companyName.trim() : null,
        statusId: formVal.statusId,
        priorityId: formVal.priorityId,
        assigneeId: formVal.assigneeId,
        contactPhone: formVal.contactPhone,
        contactEmail: formVal.contactEmail,
        description: formVal.description,
        ...udfPayload
      };

      this.ticketService.createTicket(createPayload).subscribe({
        next: (res) => {
          this.submitting = false;
          this.notificationService.showApiSuccess(
            'create',
            'Service ticket',
            `Service Ticket #${res.id ? res.id.substring(0, 8).toUpperCase() : 'NEW'} created successfully in backend database!`
          );
          setTimeout(() => {
            this.router.navigate(['/services']);
          }, 800);
        },
        error: (err) => {
          this.submitting = false;
          this.notificationService.handleApiError('create service ticket', err);
        }
      });
    }
  }
}
