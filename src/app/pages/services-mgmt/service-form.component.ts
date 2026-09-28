import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { CycleDataService } from '../../services/cycle-data.service';
import { FreewheelCatalogService } from '../../services/freewheel-catalog.service';
import { CreateServiceTicketDto, ServiceCatalogItem, ServiceDepartment } from '../../models/cycle-management.models';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    SelectModule,
    InputNumberModule,
    TextareaModule,
    CheckboxModule,
    FileUploadModule,
    ButtonModule,
    MessageModule,
    ToastModule,
    CardModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="max-w-4xl mx-auto">
      <!-- Breadcrumb Navigation Bar -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <div class="flex items-center gap-2 text-xs text-muted-color mb-1">
            <a routerLink="/services" class="hover:text-primary">Services</a>
            <i class="pi pi-chevron-right text-[10px]"></i>
            <span class="text-surface-900 dark:text-surface-0 font-medium">New Service Ticket</span>
          </div>
          <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">Create FREEWHEEL FACTORY Service Order</h1>
          <p class="text-sm text-muted-color">Register maintenance, 3D bike fit, suspension rebuild or custom service ticket.</p>
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
      <div class="card p-6 md:p-8 shadow-sm border border-surface-200 dark:border-surface-700">
        <form [formGroup]="serviceForm" (ngSubmit)="onSubmit()" class="space-y-6">

          <!-- Section 1: Customer & Bicycle Selection -->
          <div class="border-b border-surface-200 dark:border-surface-700 pb-5">
            <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 mb-1 flex items-center gap-2">
              <i class="pi pi-user text-orange-500"></i>
              Customer & Bicycle
            </h3>
            <p class="text-xs text-muted-color mb-4">Select existing registered customer and their bicycle, or input details.</p>

            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 md:col-span-6">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Customer <span class="text-red-500">*</span>
                </label>
                <p-select
                  [options]="customerOptions"
                  formControlName="customerId"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Customer"
                  (onChange)="onCustomerChange($event.value)"
                  styleClass="w-full"
                  [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('customerId') }"
                ></p-select>
                <p-message
                  *ngIf="isFieldInvalid('customerId')"
                  severity="error"
                  text="Customer selection is required."
                  styleClass="mt-1"
                ></p-message>
              </div>

              <div class="col-span-12 md:col-span-6">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Bicycle Model <span class="text-red-500">*</span>
                </label>
                <p-select
                  [options]="availableBicycles"
                  formControlName="cycleId"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Bicycle"
                  styleClass="w-full"
                  [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('cycleId') }"
                ></p-select>
                <p-message
                  *ngIf="isFieldInvalid('cycleId')"
                  severity="error"
                  text="Bicycle selection is required."
                  styleClass="mt-1"
                ></p-message>
              </div>

              <div class="col-span-12 md:col-span-4">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Company / Club Name</label>
                <input
                  pInputText
                  formControlName="companyName"
                  placeholder="e.g. Vance Logistics"
                  class="w-full"
                />
              </div>

              <div class="col-span-12 md:col-span-4">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Contact Phone <span class="text-red-500">*</span>
                </label>
                <input
                  pInputText
                  formControlName="contactPhone"
                  placeholder="+1 (555) 000-0000"
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

              <div class="col-span-12 md:col-span-4">
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
                  text="Valid email is required."
                  styleClass="mt-1"
                ></p-message>
              </div>
            </div>
          </div>

          <!-- Section 2: FREEWHEEL FACTORY Standard Service Selection -->
          <div class="border-b border-surface-200 dark:border-surface-700 pb-5">
            <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 mb-1 flex items-center gap-2">
              <i class="pi pi-cog text-orange-500"></i>
              Standard Service Package & Department
            </h3>
            <p class="text-xs text-muted-color mb-4">Choose from 20 standardized service modules across 8 workshop departments.</p>

            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 md:col-span-6">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Standard Service Module <span class="text-red-500">*</span>
                </label>
                <p-select
                  [options]="serviceCatalogOptions"
                  formControlName="serviceCatalogId"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Standard Service Module"
                  (onChange)="onCatalogServiceChange($event.value)"
                  styleClass="w-full"
                ></p-select>
              </div>

              <div class="col-span-12 md:col-span-6">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Workshop Department</label>
                <p-select
                  [options]="departmentOptions"
                  formControlName="department"
                  placeholder="Select Department"
                  styleClass="w-full"
                ></p-select>
              </div>

              <div class="col-span-12 md:col-span-4">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Workflow Status <span class="text-red-500">*</span>
                </label>
                <p-select
                  [options]="statusOptions"
                  formControlName="statusId"
                  optionLabel="label"
                  optionValue="value"
                  styleClass="w-full"
                ></p-select>
              </div>

              <div class="col-span-12 md:col-span-4">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Priority <span class="text-red-500">*</span>
                </label>
                <p-select
                  [options]="priorityOptions"
                  formControlName="priorityId"
                  optionLabel="label"
                  optionValue="value"
                  styleClass="w-full"
                ></p-select>
              </div>

              <div class="col-span-12 md:col-span-4">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Assignee (Technician) <span class="text-red-500">*</span>
                </label>
                <p-select
                  [options]="technicianOptions"
                  formControlName="assigneeId"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Technician"
                  styleClass="w-full"
                  [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('assigneeId') }"
                ></p-select>
              </div>

              <div class="col-span-12 md:col-span-6">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Estimated Labor Cost (₹)</label>
                <p-inputnumber
                  formControlName="estimatedCost"
                  mode="decimal"
                  styleClass="w-full"
                ></p-inputnumber>
              </div>

              <div class="col-span-12 md:col-span-6">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Estimated Duration (Minutes)</label>
                <p-inputnumber
                  formControlName="estimatedMinutes"
                  styleClass="w-full"
                ></p-inputnumber>
              </div>
            </div>

            <!-- SOP Checklist Preview if service selected -->
            <div *ngIf="selectedServiceSOP.length > 0" class="mt-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700">
              <div class="text-xs font-bold uppercase text-orange-600 mb-2 flex items-center gap-1.5">
                <i class="pi pi-list-check"></i>
                Technician Standard Operating Procedures ({{ selectedServiceSOP.length }} Steps):
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-surface-700 dark:text-surface-300">
                <div *ngFor="let step of selectedServiceSOP; let i = index" class="flex items-start gap-2">
                  <span class="w-4 h-4 rounded-full bg-orange-500/20 text-orange-600 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {{ i + 1 }}
                  </span>
                  <span>{{ step }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Description & Attachments -->
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                Service Description / Diagnostic Notes <span class="text-red-500">*</span>
              </label>
              <textarea
                pTextarea
                formControlName="description"
                rows="4"
                placeholder="Detail symptoms, required parts, customer specifications, torque specs..."
                class="w-full"
                [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('description') }"
              ></textarea>
              <p-message
                *ngIf="isFieldInvalid('description')"
                severity="error"
                text="Service description is required (min 5 characters)."
                styleClass="mt-1"
              ></p-message>
            </div>

            <div>
              <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Inspection Photos / Bike Images</label>
              <p-fileupload
                mode="basic"
                chooseLabel="Attach Diagnostic Photos / Docs"
                accept="image/*,.pdf"
                [maxFileSize]="5000000"
                [auto]="true"
                styleClass="p-button-outlined p-button-secondary w-full"
              ></p-fileupload>
              <span class="text-[11px] text-muted-color block mt-1">Accepts PNG, JPG, PDF up to 5MB</span>
            </div>

            <div class="flex items-center gap-2 pt-2">
              <p-checkbox formControlName="notifyCustomer" [binary]="true" inputId="notifyCustomer"></p-checkbox>
              <label for="notifyCustomer" class="text-xs text-surface-700 dark:text-surface-300 cursor-pointer">
                Send automatic SMS & Email confirmation with Digital Passport tracking link
              </label>
            </div>
          </div>

          <!-- Form Actions -->
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
              styleClass="bg-orange-500 hover:bg-orange-600 border-none font-semibold"
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
  private messageService = inject(MessageService);
  protected dataService = inject(CycleDataService);
  protected catalogService = inject(FreewheelCatalogService);

  serviceForm!: FormGroup;
  submitting = false;

  customerOptions: { label: string; value: string }[] = [];
  availableBicycles: { label: string; value: string }[] = [];
  serviceCatalogOptions: { label: string; value: string }[] = [];
  selectedServiceSOP: string[] = [];

  statusOptions = [
    { label: 'Waiting', value: 'WAITING' },
    { label: 'Assigned', value: 'ASSIGNED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  priorityOptions = [
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' },
    { label: 'Urgent', value: 'URGENT' }
  ];

  technicianOptions: { label: string; value: string }[] = [];

  departmentOptions = [
    { label: 'Bike Service', value: 'Bike Service' },
    { label: 'Performance & Race', value: 'Performance & Race' },
    { label: 'Bike Fit & Ergonomics', value: 'Bike Fit & Ergonomics' },
    { label: 'Suspension Lab', value: 'Suspension Lab' },
    { label: 'Wheels & Tyres', value: 'Wheels & Tyres' },
    { label: 'Components & Drivetrain', value: 'Components & Drivetrain' },
    { label: 'Mobile & Event Support', value: 'Mobile & Event Support' },
    { label: 'Inspection & Digital', value: 'Inspection & Digital' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadOptions();
    this.handleQueryParams();
  }

  private initForm(): void {
    this.serviceForm = this.fb.group({
      customerId: ['', Validators.required],
      cycleId: ['', Validators.required],
      companyName: [''],
      contactPhone: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      statusId: ['WAITING', Validators.required],
      priorityId: ['MEDIUM', Validators.required],
      assigneeId: ['', Validators.required],
      serviceCatalogId: [''],
      department: ['Bike Service'],
      category: ['Bike Service'],
      description: ['', [Validators.required, Validators.minLength(5)]],
      estimatedCost: [850],
      estimatedMinutes: [60],
      notifyCustomer: [true]
    });
  }

  private loadOptions(): void {
    this.customerOptions = this.dataService.customers().map(c => ({
      label: `${c.name} (${c.phone})`,
      value: c.id
    }));

    this.technicianOptions = this.dataService.technicians().map(t => ({
      label: `${t.name} — ${t.specialization}`,
      value: t.id
    }));

    this.serviceCatalogOptions = this.catalogService.services().map(s => ({
      label: `#${s.categoryNumber} - ${s.name} (${s.department} • ₹${s.basePrice})`,
      value: s.id
    }));
  }

  private handleQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['serviceId']) {
        const s = this.catalogService.getServiceById(params['serviceId']);
        if (s) {
          this.serviceForm.patchValue({
            serviceCatalogId: s.id,
            department: s.department,
            category: s.department,
            estimatedCost: s.basePrice,
            estimatedMinutes: s.estimatedMinutes,
            description: `${s.name}: ${s.description}`
          });
          this.selectedServiceSOP = s.sopChecklist;
        }
      }
    });
  }

  onCustomerChange(customerId: string): void {
    const customer = this.dataService.customers().find(c => c.id === customerId);
    if (!customer) {
      this.availableBicycles = [];
      return;
    }

    this.serviceForm.patchValue({
      contactPhone: customer.phone,
      contactEmail: customer.email,
      companyName: customer.companyName || ''
    });

    const bikes = this.dataService.bicycles().filter(b => b.customerId === customerId);
    this.availableBicycles = bikes.map(b => ({
      label: `${b.brand} ${b.model} (${b.type}) [S/N: ${b.serialNumber}]`,
      value: b.id
    }));

    if (this.availableBicycles.length > 0) {
      this.serviceForm.patchValue({ cycleId: this.availableBicycles[0].value });
    } else {
      this.serviceForm.patchValue({ cycleId: '' });
    }
  }

  onCatalogServiceChange(serviceId: string): void {
    const s = this.catalogService.getServiceById(serviceId);
    if (s) {
      this.serviceForm.patchValue({
        department: s.department,
        category: s.department,
        estimatedCost: s.basePrice,
        estimatedMinutes: s.estimatedMinutes
      });
      if (!this.serviceForm.get('description')?.value || this.serviceForm.get('description')?.value.length < 15) {
        this.serviceForm.patchValue({
          description: `${s.name}: ${s.description}`
        });
      }
      this.selectedServiceSOP = s.sopChecklist;
    } else {
      this.selectedServiceSOP = [];
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.serviceForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitting));
  }

  onSubmit(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Form Incomplete',
        detail: 'Please fill in all required fields.'
      });
      return;
    }

    this.submitting = true;
    const formVal = this.serviceForm.value;

    const newTicketDto: CreateServiceTicketDto = {
      customerId: formVal.customerId,
      cycleId: formVal.cycleId,
      companyName: formVal.companyName || '',
      statusId: formVal.statusId,
      priorityId: formVal.priorityId,
      assigneeId: formVal.assigneeId,
      contactPhone: formVal.contactPhone,
      contactEmail: formVal.contactEmail,
      description: formVal.description,
      department: formVal.department,
      serviceCatalogId: formVal.serviceCatalogId,
      category: formVal.department || formVal.category,
      estimatedCost: formVal.estimatedCost,
      estimatedMinutes: formVal.estimatedMinutes,
      enabled: true
    };

    try {
      const created = this.dataService.createTicket(newTicketDto);
      this.messageService.add({
        severity: 'success',
        summary: 'Service Ticket Created',
        detail: `Ticket #${created.id} has been successfully registered.`
      });

      setTimeout(() => {
        this.router.navigate(['/services']);
      }, 1000);
    } catch (err) {
      this.submitting = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create service ticket.'
      });
    }
  }
}
