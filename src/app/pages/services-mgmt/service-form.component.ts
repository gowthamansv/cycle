import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CycleDataService } from '../../services/cycle-data.service';
import { TicketService } from '../../services/ticket.service';
import { MiscService } from '../../services/misc.service';
import { AppNotificationService } from '../../common/services/notification.service';
import { CreateTicketRequest } from '../../models/api.models';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    ButtonModule,
    MessageModule
  ],
  template: `
    <div class="max-w-4xl mx-auto">
      <!-- Breadcrumb & Header Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2 text-xs text-muted-color mb-1">
            <a routerLink="/services" class="hover:text-primary transition-colors">Services</a>
            <i class="pi pi-chevron-right text-[10px]"></i>
            <span class="text-surface-900 dark:text-surface-0 font-medium">New Service</span>
          </div>
          <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">Create Service Ticket</h1>
          <p class="text-sm text-muted-color">Submit a new repair & maintenance service order with backend synchronization.</p>
        </div>

        <p-button
          label="Back to Services"
          icon="pi pi-arrow-left"
          [outlined]="true"
          severity="secondary"
          routerLink="/services"
          size="small"
        ></p-button>
      </div>

      <!-- Main Form Card -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-200 dark:border-surface-700">
        <form [formGroup]="serviceForm" (ngSubmit)="onSubmit()" class="space-y-6">

          <!-- Section 1: Customer & Cycle Selection -->
          <div>
            <div class="flex items-center gap-2 pb-3 mb-4 border-b border-surface-200 dark:border-surface-700">
              <div class="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
                <i class="pi pi-user text-sm"></i>
              </div>
              <div>
                <h3 class="text-base font-semibold text-surface-900 dark:text-surface-0">Customer & Cycle Information</h3>
                <p class="text-xs text-muted-color">Select customer and associated cycle from system lookups</p>
              </div>
            </div>

            <div class="grid grid-cols-12 gap-4">
              <!-- Customer -->
              <div class="col-span-12 md:col-span-6">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Customer <span class="text-red-500">*</span>
                </label>
                <p-select
                  [options]="customerOptions"
                  formControlName="customerId"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Customer (from /api/misc/customers)"
                  [filter]="true"
                  filterBy="label"
                  (onChange)="onCustomerChange($event.value)"
                  styleClass="w-full"
                  [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('customerId') }"
                ></p-select>
                <p-message
                  *ngIf="isFieldInvalid('customerId')"
                  severity="error"
                  text="Customer is required."
                  styleClass="mt-1"
                ></p-message>
              </div>

              <!-- Cycle -->
              <div class="col-span-12 md:col-span-6">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Cycle / Bicycle <span class="text-red-500">*</span>
                </label>
                <p-select
                  [options]="cycleOptions"
                  formControlName="cycleId"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Cycle"
                  [filter]="true"
                  filterBy="label"
                  styleClass="w-full"
                  [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('cycleId') }"
                ></p-select>
                <p-message
                  *ngIf="isFieldInvalid('cycleId')"
                  severity="error"
                  text="Cycle selection is required."
                  styleClass="mt-1"
                ></p-message>
              </div>

              <!-- Company Name -->
              <div class="col-span-12">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Company / Organization Name
                </label>
                <input
                  pInputText
                  formControlName="companyName"
                  placeholder="e.g. Acme Corp, Vance Logistics (optional)"
                  class="w-full"
                />
              </div>
            </div>
          </div>

          <!-- Section 2: Workflow & Assignment (Misc Lookups) -->
          <div>
            <div class="flex items-center gap-2 pb-3 mb-4 border-b border-surface-200 dark:border-surface-700">
              <div class="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
                <i class="pi pi-sliders-h text-sm"></i>
              </div>
              <div>
                <h3 class="text-base font-semibold text-surface-900 dark:text-surface-0">Workflow & Assignment</h3>
                <p class="text-xs text-muted-color">Configure status, priority and assigned technician from misc endpoints</p>
              </div>
            </div>

            <div class="grid grid-cols-12 gap-4">
              <!-- Status -->
              <div class="col-span-12 md:col-span-4">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Status <span class="text-red-500">*</span>
                </label>
                <p-select
                  [options]="statusOptions"
                  formControlName="statusId"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Status (from /api/misc/statuses)"
                  styleClass="w-full"
                  [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('statusId') }"
                ></p-select>
                <p-message
                  *ngIf="isFieldInvalid('statusId')"
                  severity="error"
                  text="Status is required."
                  styleClass="mt-1"
                ></p-message>
              </div>

              <!-- Priority -->
              <div class="col-span-12 md:col-span-4">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Priority <span class="text-red-500">*</span>
                </label>
                <p-select
                  [options]="priorityOptions"
                  formControlName="priorityId"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Priority (from /api/misc/priorities)"
                  styleClass="w-full"
                  [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('priorityId') }"
                ></p-select>
                <p-message
                  *ngIf="isFieldInvalid('priorityId')"
                  severity="error"
                  text="Priority is required."
                  styleClass="mt-1"
                ></p-message>
              </div>

              <!-- Assignee -->
              <div class="col-span-12 md:col-span-4">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Assignee / Technician <span class="text-red-500">*</span>
                </label>
                <p-select
                  [options]="assigneeOptions"
                  formControlName="assigneeId"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Assignee (from /api/misc/users)"
                  [filter]="true"
                  filterBy="label"
                  styleClass="w-full"
                  [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('assigneeId') }"
                ></p-select>
                <p-message
                  *ngIf="isFieldInvalid('assigneeId')"
                  severity="error"
                  text="Assignee is required."
                  styleClass="mt-1"
                ></p-message>
              </div>
            </div>
          </div>

          <!-- Section 3: Contact Info & Description -->
          <div>
            <div class="flex items-center gap-2 pb-3 mb-4 border-b border-surface-200 dark:border-surface-700">
              <div class="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
                <i class="pi pi-comment text-sm"></i>
              </div>
              <div>
                <h3 class="text-base font-semibold text-surface-900 dark:text-surface-0">Contact & Service Details</h3>
                <p class="text-xs text-muted-color">Specify contact details and comprehensive service description</p>
              </div>
            </div>

            <div class="grid grid-cols-12 gap-4">
              <!-- Contact Phone -->
              <div class="col-span-12 md:col-span-6">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Contact Phone <span class="text-red-500">*</span>
                </label>
                <input
                  pInputText
                  formControlName="contactPhone"
                  placeholder="+1 (555) 000-0000 or phone number"
                  class="w-full"
                  [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('contactPhone') }"
                />
                <p-message
                  *ngIf="isFieldInvalid('contactPhone')"
                  severity="error"
                  text="Contact phone is required."
                  styleClass="mt-1"
                ></p-message>
              </div>

              <!-- Contact Email -->
              <div class="col-span-12 md:col-span-6">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Contact Email <span class="text-red-500">*</span>
                </label>
                <input
                  pInputText
                  type="email"
                  formControlName="contactEmail"
                  placeholder="user@example.com"
                  class="w-full"
                  [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('contactEmail') }"
                />
                <p-message
                  *ngIf="isFieldInvalid('contactEmail')"
                  severity="error"
                  text="Valid contact email is required."
                  styleClass="mt-1"
                ></p-message>
              </div>

              <!-- Description -->
              <div class="col-span-12">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Service Description <span class="text-red-500">*</span>
                </label>
                <textarea
                  pTextarea
                  formControlName="description"
                  rows="4"
                  placeholder="Describe service requirements, issues reported, customer requests or diagnostic findings..."
                  class="w-full"
                  [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('description') }"
                ></textarea>
                <p-message
                  *ngIf="isFieldInvalid('description')"
                  severity="error"
                  text="Service description is required."
                  styleClass="mt-1"
                ></p-message>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end gap-3 pt-6 border-t border-surface-200 dark:border-surface-700">
            <p-button
              label="Cancel"
              severity="secondary"
              [outlined]="true"
              routerLink="/services"
              [disabled]="submitting"
            ></p-button>
            <p-button
              type="submit"
              label="Create Service Order"
              icon="pi pi-check"
              [loading]="submitting"
              styleClass="bg-orange-500 hover:bg-orange-600 border-none font-semibold text-white px-5"
            ></p-button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ServiceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(AppNotificationService);
  protected dataService = inject(CycleDataService);
  protected ticketService = inject(TicketService);
  protected miscService = inject(MiscService);

  serviceForm!: FormGroup;
  submitting = false;

  // Dropdown options for requested fields
  customerOptions: { label: string; value: string }[] = [];
  cycleOptions: { label: string; value: string }[] = [];
  statusOptions: { label: string; value: string }[] = [];
  priorityOptions: { label: string; value: string }[] = [];
  assigneeOptions: { label: string; value: string }[] = [];

  ngOnInit(): void {
    this.initForm();
    this.loadMiscLookups();
    this.handleQueryParams();
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
      description: ['', Validators.required]
    });
  }

  private loadMiscLookups(): void {
    this.miscService.loadAllLookups().subscribe({
      next: (lookups) => {
        // 1. Customers (from /api/misc/customers)
        if (lookups.customers && lookups.customers.length > 0) {
          this.customerOptions = lookups.customers.map(c => ({
            label: `${c.name} (${c.phoneNumber || 'No Phone'})`,
            value: c.id
          }));
        } else {
          this.customerOptions = this.dataService.customers().map(c => ({
            label: `${c.name} (${c.phone})`,
            value: c.id
          }));
        }

        // 2. Statuses (from /api/misc/statuses)
        if (lookups.statuses && lookups.statuses.length > 0) {
          this.statusOptions = lookups.statuses.map(s => ({
            label: s.name,
            value: s.id
          }));
          if (!this.serviceForm.get('statusId')?.value) {
            this.serviceForm.patchValue({ statusId: this.statusOptions[0].value });
          }
        } else {
          this.statusOptions = [
            { label: 'Waiting', value: '46c820b1-50e5-4f7f-8cae-736a61b8fbf1' },
            { label: 'Assigned', value: '46c820b1-50e5-4f7f-8cae-736a61b8fbf2' },
            { label: 'In Progress', value: '46c820b1-50e5-4f7f-8cae-736a61b8fbf3' },
            { label: 'Completed', value: '46c820b1-50e5-4f7f-8cae-736a61b8fbf4' }
          ];
          this.serviceForm.patchValue({ statusId: this.statusOptions[0].value });
        }

        // 3. Priorities (from /api/misc/priorities)
        if (lookups.priorities && lookups.priorities.length > 0) {
          this.priorityOptions = lookups.priorities.map(p => ({
            label: p.name,
            value: p.id
          }));
          const medium = this.priorityOptions.find(p => p.label.toLowerCase().includes('medium')) || this.priorityOptions[0];
          if (!this.serviceForm.get('priorityId')?.value) {
            this.serviceForm.patchValue({ priorityId: medium.value });
          }
        } else {
          this.priorityOptions = [
            { label: 'Low', value: 'e5e9b862-246d-4767-aeb8-796ec1ba0001' },
            { label: 'Medium', value: 'e5e9b862-246d-4767-aeb8-796ec1ba0002' },
            { label: 'High', value: 'e5e9b862-246d-4767-aeb8-796ec1ba0003' },
            { label: 'Urgent', value: 'e5e9b862-246d-4767-aeb8-796ec1ba0004' }
          ];
          this.serviceForm.patchValue({ priorityId: this.priorityOptions[1].value });
        }

        // 4. Assignees / Users (from /api/misc/users)
        if (lookups.users && lookups.users.length > 0) {
          this.assigneeOptions = lookups.users.map(u => ({
            label: `${(u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.email)} (${u.email})`,
            value: u.id
          }));
          if (!this.serviceForm.get('assigneeId')?.value) {
            this.serviceForm.patchValue({ assigneeId: this.assigneeOptions[0].value });
          }
        } else {
          this.assigneeOptions = this.dataService.technicians().map(t => ({
            label: `${t.name} — ${t.specialization}`,
            value: t.id
          }));
          if (this.assigneeOptions.length > 0) {
            this.serviceForm.patchValue({ assigneeId: this.assigneeOptions[0].value });
          }
        }

        // Default initial cycles from bicycles store
        this.populateCycleOptions();
      },
      error: () => {
        // Fallback gracefully on local data
        this.customerOptions = this.dataService.customers().map(c => ({
          label: `${c.name} (${c.phone})`,
          value: c.id
        }));
        this.assigneeOptions = this.dataService.technicians().map(t => ({
          label: `${t.name} — ${t.specialization}`,
          value: t.id
        }));
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
        // Option linked to this customer
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

    if (this.cycleOptions.length > 0 && !this.serviceForm.get('cycleId')?.value) {
      this.serviceForm.patchValue({ cycleId: this.cycleOptions[0].value });
    }
  }

  private handleQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['customerId']) {
        this.serviceForm.patchValue({ customerId: params['customerId'] });
        this.onCustomerChange(params['customerId']);
      }
      if (params['cycleId']) {
        this.serviceForm.patchValue({ cycleId: params['cycleId'] });
      }
      if (params['description']) {
        this.serviceForm.patchValue({ description: params['description'] });
      }
    });
  }

  onCustomerChange(customerId: string): void {
    const backendCust = this.miscService.customers().find(c => c.id === customerId);
    const localCust = this.dataService.customers().find(c => c.id === customerId);

    const phone = backendCust?.phoneNumber || localCust?.phone || '';
    const email = backendCust?.email || localCust?.email || '';
    const company = localCust?.companyName || '';

    this.serviceForm.patchValue({
      contactPhone: phone,
      contactEmail: email,
      companyName: company
    });

    this.populateCycleOptions(customerId);
    if (this.cycleOptions.length > 0) {
      this.serviceForm.patchValue({ cycleId: this.cycleOptions[0].value });
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
        'Please fill in all required fields marked with *.'
      );
      return;
    }

    this.submitting = true;
    const formVal = this.serviceForm.value;

    const createPayload: CreateTicketRequest = {
      customerId: formVal.customerId,
      cycleId: formVal.cycleId,
      companyName: formVal.companyName?.trim() ? formVal.companyName.trim() : null,
      statusId: formVal.statusId,
      priorityId: formVal.priorityId,
      assigneeId: formVal.assigneeId,
      contactPhone: formVal.contactPhone,
      contactEmail: formVal.contactEmail,
      description: formVal.description
    };

    this.ticketService.createTicket(createPayload).subscribe({
      next: (ticketResponse) => {
        this.submitting = false;

        // Sync local cache
        try {
          this.dataService.createTicket({
            customerId: formVal.customerId,
            cycleId: formVal.cycleId,
            companyName: formVal.companyName || '',
            statusId: formVal.statusId,
            priorityId: formVal.priorityId,
            assigneeId: formVal.assigneeId,
            contactPhone: formVal.contactPhone,
            contactEmail: formVal.contactEmail,
            description: formVal.description,
            department: 'Bike Service',
            category: 'Bike Service',
            estimatedCost: 0,
            estimatedMinutes: 0,
            enabled: true
          });
        } catch {
          // ignore local mirror errors
        }

        this.notificationService.showApiSuccess(
          'create',
          'Service ticket',
          `Ticket #${ticketResponse.id || 'NEW'} registered successfully in backend!`
        );

        setTimeout(() => {
          this.router.navigate(['/services']);
        }, 1000);
      },
      error: (err) => {
        this.submitting = false;
        this.notificationService.handleApiError('create service ticket', err);
      }
    });
  }
}
