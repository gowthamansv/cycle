import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CycleDataService } from '../../services/cycle-data.service';
import { BicycleType, CreateAppointmentDto } from '../../models/cycle-management.models';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    SelectModule,
    AutoCompleteModule,
    DatePickerModule,
    TextareaModule,
    ButtonModule,
    MessageModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="max-w-4xl mx-auto">
      <!-- Breadcrumb & Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <div class="flex items-center gap-2 text-xs text-muted-color mb-1">
            <a routerLink="/appointments" class="hover:text-primary">Appointments</a>
            <i class="pi pi-chevron-right text-[10px]"></i>
            <span class="text-surface-900 dark:text-surface-0 font-medium">New Booking</span>
          </div>
          <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">New Appointment</h1>
          <p class="text-sm text-muted-color">Schedule customer drop-off, diagnostic or scheduled maintenance.</p>
        </div>

        <p-button
          label="Back to List"
          icon="pi pi-arrow-left"
          [outlined]="true"
          severity="secondary"
          routerLink="/appointments"
          size="small"
        ></p-button>
      </div>

      <!-- Main Form Container -->
      <div class="card p-6 md:p-8 shadow-sm border border-surface-200 dark:border-surface-700">
        <form [formGroup]="appointmentForm" (ngSubmit)="onSubmit()" class="space-y-6">

          <!-- 1. CUSTOMER SECTION -->
          <div class="border-b border-surface-200 dark:border-surface-700 pb-5">
            <div class="flex items-center gap-2 mb-1">
              <span class="w-6 h-6 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center">1</span>
              <h3 class="text-base font-bold text-surface-900 dark:text-surface-0">CUSTOMER</h3>
            </div>
            <p class="text-xs text-muted-color mb-4 ml-8">Search registered customer or enter contact information.</p>

            <div class="grid grid-cols-12 gap-4 ml-8">
              <div class="col-span-12 md:col-span-7">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Customer Search / Selection <span class="text-red-500">*</span>
                </label>
                <p-select
                  [options]="customerOptions"
                  formControlName="customerId"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select or Search Customer"
                  (onChange)="onCustomerSelect($event.value)"
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

              <div class="col-span-12 md:col-span-5">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Phone Number <span class="text-red-500">*</span>
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
                  text="Phone number is required."
                  styleClass="mt-1"
                ></p-message>
              </div>
            </div>
          </div>

          <!-- 2. BICYCLE SECTION -->
          <div class="border-b border-surface-200 dark:border-surface-700 pb-5">
            <div class="flex items-center gap-2 mb-1">
              <span class="w-6 h-6 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center">2</span>
              <h3 class="text-base font-bold text-surface-900 dark:text-surface-0">BICYCLE</h3>
            </div>
            <p class="text-xs text-muted-color mb-4 ml-8">Choose bicycle from customer's garage or specify model.</p>

            <div class="grid grid-cols-12 gap-4 ml-8">
              <div class="col-span-12 md:col-span-7">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Bicycle Selection <span class="text-red-500">*</span>
                </label>
                <p-select
                  [options]="customerBicycles"
                  formControlName="cycleId"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Customer Bicycle"
                  (onChange)="onBicycleSelect($event.value)"
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

              <div class="col-span-12 md:col-span-5">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Bicycle Type <span class="text-red-500">*</span>
                </label>
                <p-select
                  [options]="bicycleTypeOptions"
                  formControlName="cycleType"
                  placeholder="Select Bicycle Type"
                  styleClass="w-full"
                  [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('cycleType') }"
                ></p-select>
              </div>
            </div>
          </div>

          <!-- 3. SERVICE SECTION -->
          <div class="border-b border-surface-200 dark:border-surface-700 pb-5">
            <div class="flex items-center gap-2 mb-1">
              <span class="w-6 h-6 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center">3</span>
              <h3 class="text-base font-bold text-surface-900 dark:text-surface-0">SERVICE</h3>
            </div>
            <p class="text-xs text-muted-color mb-4 ml-8">Define required maintenance scope and assign lead technician.</p>

            <div class="grid grid-cols-12 gap-4 ml-8">
              <div class="col-span-12 md:col-span-6">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Service Type <span class="text-red-500">*</span>
                </label>
                <p-select
                  [options]="serviceTypeOptions"
                  formControlName="serviceType"
                  placeholder="Select Service Package"
                  styleClass="w-full"
                  [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('serviceType') }"
                ></p-select>
                <p-message
                  *ngIf="isFieldInvalid('serviceType')"
                  severity="error"
                  text="Service type is required."
                  styleClass="mt-1"
                ></p-message>
              </div>

              <div class="col-span-12 md:col-span-6">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Technician <span class="text-red-500">*</span>
                </label>
                <p-select
                  [options]="technicianOptions"
                  formControlName="technicianId"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Assign Technician"
                  styleClass="w-full"
                  [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('technicianId') }"
                ></p-select>
                <p-message
                  *ngIf="isFieldInvalid('technicianId')"
                  severity="error"
                  text="Technician assignment is required."
                  styleClass="mt-1"
                ></p-message>
              </div>
            </div>
          </div>

          <!-- 4. APPOINTMENT SECTION -->
          <div class="border-b border-surface-200 dark:border-surface-700 pb-5">
            <div class="flex items-center gap-2 mb-1">
              <span class="w-6 h-6 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center">4</span>
              <h3 class="text-base font-bold text-surface-900 dark:text-surface-0">APPOINTMENT</h3>
            </div>
            <p class="text-xs text-muted-color mb-4 ml-8">Select target calendar date and time slot.</p>

            <div class="grid grid-cols-12 gap-4 ml-8">
              <div class="col-span-12 md:col-span-6">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Date <span class="text-red-500">*</span>
                </label>
                <p-datepicker
                  formControlName="date"
                  dateFormat="yy-mm-dd"
                  [showIcon]="true"
                  styleClass="w-full"
                  [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('date') }"
                ></p-datepicker>
                <p-message
                  *ngIf="isFieldInvalid('date')"
                  severity="error"
                  text="Valid date is required."
                  styleClass="mt-1"
                ></p-message>
              </div>

              <div class="col-span-12 md:col-span-6">
                <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">
                  Time Slot <span class="text-red-500">*</span>
                </label>
                <p-select
                  [options]="timeSlotOptions"
                  formControlName="time"
                  placeholder="Select Time Slot"
                  styleClass="w-full"
                  [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('time') }"
                ></p-select>
                <p-message
                  *ngIf="isFieldInvalid('time')"
                  severity="error"
                  text="Time slot is required."
                  styleClass="mt-1"
                ></p-message>
              </div>
            </div>
          </div>

          <!-- 5. NOTES SECTION -->
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-6 h-6 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center">5</span>
              <h3 class="text-base font-bold text-surface-900 dark:text-surface-0">NOTES</h3>
            </div>
            <p class="text-xs text-muted-color mb-4 ml-8">Additional customer requests, drop-off preferences, or notes.</p>

            <div class="ml-8">
              <textarea
                pTextarea
                formControlName="notes"
                rows="3"
                placeholder="e.g. Customer will drop off bike before 9am, please check chain wear..."
                class="w-full"
              ></textarea>
            </div>
          </div>

          <!-- Form Buttons -->
          <div class="flex items-center justify-end gap-3 pt-6 border-t border-surface-200 dark:border-surface-700">
            <p-button
              label="Cancel"
              severity="secondary"
              [outlined]="true"
              routerLink="/appointments"
              [disabled]="submitting"
            ></p-button>
            <p-button
              type="submit"
              label="Book Appointment"
              icon="pi pi-calendar-check"
              [disabled]="appointmentForm.invalid"
              [loading]="submitting"
            ></p-button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AppointmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private messageService = inject(MessageService);
  protected dataService = inject(CycleDataService);

  appointmentForm!: FormGroup;
  submitting = false;

  customerOptions: { label: string; value: string }[] = [];
  customerBicycles: { label: string; value: string; model: string; type: BicycleType }[] = [];
  technicianOptions: { label: string; value: string; name: string }[] = [];

  bicycleTypeOptions = [
    { label: 'Road', value: 'Road' },
    { label: 'Mountain', value: 'Mountain' },
    { label: 'Hybrid', value: 'Hybrid' },
    { label: 'BMX', value: 'BMX' },
    { label: 'Electric', value: 'Electric' },
    { label: 'Gravel', value: 'Gravel' },
    { label: 'Other', value: 'Other' }
  ];

  serviceTypeOptions = [
    { label: 'Hydraulic Disc Brake Bleeding & Tuning', value: 'Hydraulic Disc Brake Bleeding & Tuning' },
    { label: 'Tubeless Conversion & Sealant Refill', value: 'Tubeless Conversion & Sealant Refill' },
    { label: 'Suspension Fork & Shock 50hr Service', value: 'Suspension Fork & Shock 50hr Service' },
    { label: 'Annual Comprehensive Pro Tune-up', value: 'Annual Comprehensive Pro Tune-up' },
    { label: 'E-Bike Motor & Battery Health Check', value: 'E-Bike Motor & Battery Health Check' },
    { label: 'Custom Wheel Truing & Spoke Tensioning', value: 'Custom Wheel Truing & Spoke Tensioning' },
    { label: 'Drivetrain Overhaul & Bottom Bracket Service', value: 'Drivetrain Overhaul & Bottom Bracket Service' }
  ];

  timeSlotOptions = [
    { label: '08:30 AM', value: '08:30 AM' },
    { label: '09:30 AM', value: '09:30 AM' },
    { label: '11:00 AM', value: '11:00 AM' },
    { label: '01:30 PM', value: '01:30 PM' },
    { label: '02:30 PM', value: '02:30 PM' },
    { label: '04:00 PM', value: '04:00 PM' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.appointmentForm = this.fb.group({
      customerId: ['', Validators.required],
      contactPhone: ['', Validators.required],
      cycleId: ['', Validators.required],
      cycleModel: [''],
      cycleType: ['Road', Validators.required],
      serviceType: ['Annual Comprehensive Pro Tune-up', Validators.required],
      technicianId: ['TECH-001', Validators.required],
      date: ['2026-09-21', Validators.required],
      time: ['09:30 AM', Validators.required],
      notes: ['']
    });
  }

  loadData(): void {
    const customers = this.dataService.customers();
    this.customerOptions = customers.map(c => ({
      label: `${c.name} (${c.phone})`,
      value: c.id
    }));

    const techs = this.dataService.technicians();
    this.technicianOptions = techs.map(t => ({
      label: `${t.name} (${t.specialization})`,
      value: t.id,
      name: t.name
    }));

    if (customers.length > 0) {
      this.appointmentForm.patchValue({
        customerId: customers[0].id,
        contactPhone: customers[0].phone
      });
      this.onCustomerSelect(customers[0].id);
    }
  }

  onCustomerSelect(customerId: string): void {
    const customer = this.dataService.customers().find(c => c.id === customerId);
    if (customer) {
      this.appointmentForm.patchValue({ contactPhone: customer.phone });

      const bikes = this.dataService.bicycles().filter(b => b.customerId === customerId);
      this.customerBicycles = bikes.map(b => ({
        label: `${b.brand} ${b.model} (${b.type})`,
        value: b.id,
        model: `${b.brand} ${b.model}`,
        type: b.type
      }));

      if (this.customerBicycles.length > 0) {
        const first = this.customerBicycles[0];
        this.appointmentForm.patchValue({
          cycleId: first.value,
          cycleModel: first.model,
          cycleType: first.type
        });
      } else {
        this.appointmentForm.patchValue({
          cycleId: '',
          cycleModel: '',
          cycleType: 'Road'
        });
      }
    }
  }

  onBicycleSelect(cycleId: string): void {
    const bike = this.customerBicycles.find(b => b.value === cycleId);
    if (bike) {
      this.appointmentForm.patchValue({
        cycleModel: bike.model,
        cycleType: bike.type
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.appointmentForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formVal = this.appointmentForm.value;
    const customer = this.dataService.customers().find(c => c.id === formVal.customerId);
    const tech = this.technicianOptions.find(t => t.value === formVal.technicianId);

    // Format date string safely
    let dateStr = formVal.date;
    if (dateStr instanceof Date) {
      dateStr = dateStr.toISOString().split('T')[0];
    }

    const dto: CreateAppointmentDto = {
      customerId: formVal.customerId,
      customerName: customer ? customer.name : 'Customer',
      contactPhone: formVal.contactPhone,
      cycleId: formVal.cycleId,
      cycleModel: formVal.cycleModel || 'Custom Bicycle',
      cycleType: formVal.cycleType,
      serviceType: formVal.serviceType,
      technicianId: formVal.technicianId,
      technicianName: tech ? tech.name : 'Alex Rivera',
      date: dateStr,
      time: formVal.time,
      notes: formVal.notes
    };

    this.dataService.addAppointment(dto).subscribe({
      next: (apt) => {
        this.submitting = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Appointment Booked',
          detail: `Booking ${apt.id} confirmed for ${apt.customerName} on ${apt.date}.`
        });
        setTimeout(() => {
          this.router.navigate(['/appointments']);
        }, 600);
      },
      error: () => {
        this.submitting = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not create appointment.'
        });
      }
    });
  }
}
