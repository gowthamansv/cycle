import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
import { CreateServiceTicketDto } from '../../models/cycle-management.models';

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
          <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">Create Service Ticket</h1>
          <p class="text-sm text-muted-color">Register maintenance, diagnostic or custom repair job.</p>
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
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Company Name</label>
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

          <!-- Section 2: Service Classification & Assignment -->
          <div class="border-b border-surface-200 dark:border-surface-700 pb-5">
            <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 mb-1 flex items-center gap-2">
              <i class="pi pi-sliders-h text-orange-500"></i>
              Workflow & Assignment
            </h3>
            <p class="text-xs text-muted-color mb-4">Set workflow initial state, priority, and assign technician.</p>

            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 md:col-span-4">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Status <span class="text-red-500">*</span>
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
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Service Category</label>
                <p-select
                  [options]="categoryOptions"
                  formControlName="category"
                  placeholder="Select Category"
                  styleClass="w-full"
                ></p-select>
              </div>

              <div class="col-span-12 md:col-span-6">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Estimated Cost ($)</label>
                <p-inputnumber
                  formControlName="estimatedCost"
                  mode="currency"
                  currency="USD"
                  locale="en-US"
                  styleClass="w-full"
                ></p-inputnumber>
              </div>
            </div>
          </div>

          <!-- Section 3: Description & Attachments -->
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                Service Description / Notes <span class="text-red-500">*</span>
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
                Send automatic SMS & Email confirmation to customer
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
              label="Save Service"
              icon="pi pi-check"
              [loading]="submitting"
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
  private messageService = inject(MessageService);
  protected dataService = inject(CycleDataService);

  serviceForm!: FormGroup;
  submitting = false;

  customerOptions: { label: string; value: string }[] = [];
  availableBicycles: { label: string; value: string }[] = [];

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

  categoryOptions = [
    { label: 'Drivetrain & Brakes', value: 'Drivetrain & Brakes' },
    { label: 'Suspension', value: 'Suspension' },
    { label: 'Overhaul', value: 'Overhaul' },
    { label: 'Annual Tune-up', value: 'Annual Tune-up' },
    { label: 'E-Bike Diagnostics', value: 'E-Bike Diagnostics' },
    { label: 'Wheel & Cockpit', value: 'Wheel & Cockpit' },
    { label: 'General Maintenance', value: 'General Maintenance' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadOptions();
  }

  initForm(): void {
    this.serviceForm = this.fb.group({
      customerId: ['', Validators.required],
      cycleId: ['', Validators.required],
      companyName: [''],
      statusId: ['WAITING', Validators.required],
      priorityId: ['MEDIUM', Validators.required],
      assigneeId: ['TECH-001', Validators.required],
      contactPhone: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      category: ['Drivetrain & Brakes'],
      estimatedCost: [120],
      notifyCustomer: [true]
    });
  }

  loadOptions(): void {
    const customers = this.dataService.customers();
    this.customerOptions = customers.map(c => ({
      label: `${c.name} (${c.phone})`,
      value: c.id
    }));

    const techs = this.dataService.technicians();
    this.technicianOptions = techs.map(t => ({
      label: `${t.name} - ${t.specialization}`,
      value: t.id
    }));

    // Prepopulate first customer's bikes
    if (customers.length > 0) {
      this.serviceForm.patchValue({
        customerId: customers[0].id,
        contactPhone: customers[0].phone,
        contactEmail: customers[0].email,
        companyName: customers[0].companyName || ''
      });
      this.onCustomerChange(customers[0].id);
    }
  }

  onCustomerChange(customerId: string): void {
    const customer = this.dataService.customers().find(c => c.id === customerId);
    if (customer) {
      this.serviceForm.patchValue({
        contactPhone: customer.phone,
        contactEmail: customer.email,
        companyName: customer.companyName || ''
      });

      const customerBikes = this.dataService.bicycles().filter(b => b.customerId === customerId);
      this.availableBicycles = customerBikes.map(b => ({
        label: `${b.brand} ${b.model} (${b.type}) - ${b.serialNumber}`,
        value: b.id
      }));

      if (this.availableBicycles.length > 0) {
        this.serviceForm.patchValue({ cycleId: this.availableBicycles[0].value });
      } else {
        this.serviceForm.patchValue({ cycleId: '' });
      }
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.serviceForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields properly.'
      });
      return;
    }

    this.submitting = true;
    const formVal = this.serviceForm.value;

    const dto: CreateServiceTicketDto = {
      customerId: formVal.customerId,
      cycleId: formVal.cycleId,
      companyName: formVal.companyName,
      statusId: formVal.statusId,
      priorityId: formVal.priorityId,
      assigneeId: formVal.assigneeId,
      contactPhone: formVal.contactPhone,
      contactEmail: formVal.contactEmail,
      description: formVal.description,
      category: formVal.category,
      estimatedCost: formVal.estimatedCost,
      enabled: true
    };

    this.dataService.addTicket(dto).subscribe({
      next: (ticket) => {
        this.submitting = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Service Created',
          detail: `Ticket ${ticket.id} created successfully.`
        });
        setTimeout(() => {
          this.router.navigate(['/services']);
        }, 600);
      },
      error: () => {
        this.submitting = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Submission Failed',
          detail: 'Failed to create service ticket.'
        });
      }
    });
  }
}
