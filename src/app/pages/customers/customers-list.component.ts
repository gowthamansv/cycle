import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';

import { AuthService } from '../../common/services/auth.service';
import { CustomerService } from '../../services/customer.service';
import { MiscService } from '../../services/misc.service';
import { AppNotificationService } from '../../common/services/notification.service';
import { MiscCustomer, CreateCustomerRequest } from '../../models/api.models';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    TooltipModule,
    ProgressSpinnerModule,
    MessageModule
  ],
  template: `
    <div class="flex flex-col gap-6 max-w-[1600px] mx-auto pb-10">

      <!-- ============================================================= -->
      <!-- 1. HEADER                                                     -->
      <!-- ============================================================= -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface-0 dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm">
        <div>
          <div class="flex items-center gap-2 text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">
            <i class="pi pi-users"></i> Fleet & CRM
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">
            Customer Directory
          </h1>
          <p class="text-sm text-muted-color mt-1">
            Live client directory powered by <code class="font-mono text-xs bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded">/api/misc/customers</code>.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <p-button
            label="Refresh"
            icon="pi pi-refresh"
            [outlined]="true"
            severity="secondary"
            (click)="loadCustomers()"
            [loading]="isLoading()"
            size="small"
          ></p-button>

          <p-button
            label="Add Customer"
            icon="pi pi-user-plus"
            (click)="openAddCustomerDialog()"
            styleClass="bg-orange-500 hover:bg-orange-600 border-none text-white font-semibold shadow-sm"
            size="small"
          ></p-button>
        </div>
      </div>



      <!-- ============================================================= -->
      <!-- 3. ERROR BANNER                                               -->
      <!-- ============================================================= -->
      <div *ngIf="loadError()" class="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center justify-between">
        <div class="flex items-center gap-3 text-red-700 dark:text-red-300">
          <i class="pi pi-exclamation-triangle text-xl"></i>
          <div>
            <div class="font-semibold text-sm">Unable to load customers from /api/misc/customers</div>
            <div class="text-xs text-red-600 dark:text-red-400">{{ loadErrorMessage() }}</div>
          </div>
        </div>
        <p-button
          label="Retry"
          icon="pi pi-refresh"
          severity="danger"
          size="small"
          (click)="loadCustomers()"
        ></p-button>
      </div>

      <!-- ============================================================= -->
      <!-- 4. CUSTOMERS TABLE (LIVE /api/misc/customers)                -->
      <!-- ============================================================= -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden">
        <p-table
          [value]="filteredCustomers()"
          [loading]="isLoading()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[10, 20, 50]"
          responsiveLayout="scroll"
          styleClass="p-datatable-sm p-datatable-striped"
        >
          <ng-template pTemplate="header">
            <tr>
              <th class="w-32 text-xs font-semibold text-muted-color uppercase">Customer ID</th>
              <th class="text-xs font-semibold text-muted-color uppercase">Customer Name</th>
              <th class="text-xs font-semibold text-muted-color uppercase">Phone Number</th>
              <th class="text-xs font-semibold text-muted-color uppercase">Email Address</th>
              <th class="text-xs font-semibold text-muted-color uppercase">Address / Location</th>
              <th class="w-36 text-right text-xs font-semibold text-muted-color uppercase">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-customer>
            <tr class="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
              <!-- Customer ID -->
              <td>
                <span
                  class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-200 border border-surface-200 dark:border-surface-700"
                  [pTooltip]="customer.id"
                >
                  #{{ customer.id ? (customer.id.substring(0, 8) | uppercase) : 'N/A' }}
                </span>
              </td>

              <!-- Name with Avatar -->
              <td>
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold shrink-0">
                    {{ customer.name ? (customer.name.charAt(0) | uppercase) : 'C' }}
                  </div>
                  <div class="font-semibold text-sm text-surface-900 dark:text-surface-0">
                    {{ customer.name }}
                  </div>
                </div>
              </td>

              <!-- Phone -->
              <td>
                <div class="text-xs font-mono text-surface-800 dark:text-surface-200 flex items-center gap-1.5">
                  <i class="pi pi-phone text-[10px] text-muted-color"></i>
                  <span>{{ customer.phoneNumber || '—' }}</span>
                </div>
              </td>

              <!-- Email -->
              <td>
                <div class="text-xs text-surface-700 dark:text-surface-300 flex items-center gap-1.5">
                  <i class="pi pi-envelope text-[10px] text-muted-color"></i>
                  <span>{{ customer.email || '—' }}</span>
                </div>
              </td>

              <!-- Address -->
              <td>
                <div class="text-xs text-surface-700 dark:text-surface-300 flex items-center gap-1.5 max-w-[280px] truncate">
                  <i class="pi pi-map-marker text-[10px] text-muted-color"></i>
                  <span class="truncate">{{ customer.address || '—' }}</span>
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
                    pTooltip="View Customer"
                    (click)="openViewDialog(customer)"
                  ></p-button>

                  <!-- Create Service for Customer -->
                  <p-button
                    icon="pi pi-wrench"
                    [rounded]="true"
                    [text]="true"
                    severity="primary"
                    size="small"
                    pTooltip="New Service Order"
                    [routerLink]="['/services/new']"
                    [queryParams]="{ customerId: customer.id }"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <!-- Empty State -->
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center py-12">
                <div class="flex flex-col items-center justify-center gap-3">
                  <div class="w-14 h-14 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-400">
                    <i class="pi pi-users text-2xl"></i>
                  </div>
                  <div>
                    <h3 class="text-base font-semibold text-surface-900 dark:text-surface-0">No customers found</h3>
                    <p class="text-xs text-muted-color mt-1">
                      No registered customers found from /api/misc/customers.
                    </p>
                  </div>
                  <p-button
                    label="Add Customer"
                    icon="pi pi-user-plus"
                    size="small"
                    (click)="openAddCustomerDialog()"
                    styleClass="bg-orange-500 hover:bg-orange-600 border-none text-white font-semibold mt-1"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

    </div>

    <!-- ============================================================= -->
    <!-- 5. REGISTER NEW CUSTOMER MODAL (POST /api/customers)          -->
    <!-- ============================================================= -->
    <p-dialog
      header="Register New Customer"
      [(visible)]="addCustomerDialogVisible"
      [modal]="true"
      [style]="{ width: '500px', maxWidth: '95vw' }"
      [draggable]="false"
      [resizable]="false"
    >
      <form [formGroup]="customerForm" (ngSubmit)="submitNewCustomer()" class="space-y-4 pt-2">
        <!-- Full Name -->
        <div>
          <label class="block text-xs font-semibold text-muted-color uppercase mb-1">
            Full Name <span class="text-red-500">*</span>
          </label>
          <input
            pInputText
            formControlName="name"
            placeholder="e.g. Alex Morgan"
            class="w-full text-sm"
            [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('name') }"
          />
          <small *ngIf="isFieldInvalid('name')" class="text-red-500 text-xs mt-0.5 block">Customer name is required.</small>
        </div>

        <!-- Phone Number -->
        <div>
          <label class="block text-xs font-semibold text-muted-color uppercase mb-1">
            Phone Number <span class="text-red-500">*</span>
          </label>
          <input
            pInputText
            formControlName="phoneNumber"
            placeholder="+1 (555) 234-5678"
            class="w-full text-sm"
            [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('phoneNumber') }"
          />
          <small *ngIf="isFieldInvalid('phoneNumber')" class="text-red-500 text-xs mt-0.5 block">Phone number is required.</small>
        </div>

        <!-- Email Address -->
        <div>
          <label class="block text-xs font-semibold text-muted-color uppercase mb-1">
            Email Address
          </label>
          <input
            pInputText
            type="email"
            formControlName="email"
            placeholder="alex.morgan@example.com (optional)"
            class="w-full text-sm"
            [ngClass]="{ 'ng-invalid ng-dirty': isFieldInvalid('email') }"
          />
          <small *ngIf="isFieldInvalid('email')" class="text-red-500 text-xs mt-0.5 block">Valid email address required.</small>
        </div>

        <!-- Address -->
        <div>
          <label class="block text-xs font-semibold text-muted-color uppercase mb-1">
            Address / City
          </label>
          <input
            pInputText
            formControlName="address"
            placeholder="742 Evergreen Terrace, Sector 4 (optional)"
            class="w-full text-sm"
          />
        </div>

        <!-- Dialog Actions -->
        <div class="flex items-center justify-end gap-2 pt-4 border-t border-surface-200 dark:border-surface-700">
          <p-button
            label="Cancel"
            [outlined]="true"
            severity="secondary"
            size="small"
            (click)="addCustomerDialogVisible = false"
            [disabled]="isSubmitting"
          ></p-button>
          <p-button
            type="submit"
            label="Save Customer"
            icon="pi pi-check"
            size="small"
            [loading]="isSubmitting"
            styleClass="bg-orange-500 hover:bg-orange-600 border-none text-white font-semibold"
          ></p-button>
        </div>
      </form>
    </p-dialog>

    <!-- ============================================================= -->
    <!-- 6. VIEW CUSTOMER DETAILS MODAL                                -->
    <!-- ============================================================= -->
    <p-dialog
      header="Customer Profile Details"
      [(visible)]="viewCustomerDialogVisible"
      [modal]="true"
      [style]="{ width: '480px', maxWidth: '95vw' }"
      [draggable]="false"
      [resizable]="false"
    >
      <div *ngIf="selectedCustomerForView" class="space-y-4 pt-2 text-xs">
        <div class="flex items-center gap-3 p-3.5 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
          <div class="w-12 h-12 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold text-lg flex items-center justify-center">
            {{ selectedCustomerForView.name.charAt(0) | uppercase }}
          </div>
          <div>
            <div class="text-base font-bold text-surface-900 dark:text-surface-0">{{ selectedCustomerForView.name }}</div>
            <div class="font-mono text-[11px] text-muted-color">ID: {{ selectedCustomerForView.id }}</div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-3">
          <div class="p-3 rounded-lg bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700">
            <span class="text-muted-color uppercase font-semibold block mb-1">Phone Number</span>
            <div class="font-mono font-medium text-surface-900 dark:text-surface-0 flex items-center gap-1.5 text-sm">
              <i class="pi pi-phone text-xs text-orange-500"></i>
              <span>{{ selectedCustomerForView.phoneNumber || 'No phone recorded' }}</span>
            </div>
          </div>

          <div class="p-3 rounded-lg bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700">
            <span class="text-muted-color uppercase font-semibold block mb-1">Email Address</span>
            <div class="font-medium text-surface-900 dark:text-surface-0 flex items-center gap-1.5 text-sm">
              <i class="pi pi-envelope text-xs text-orange-500"></i>
              <span>{{ selectedCustomerForView.email || 'No email recorded' }}</span>
            </div>
          </div>

          <div class="p-3 rounded-lg bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700">
            <span class="text-muted-color uppercase font-semibold block mb-1">Address</span>
            <div class="text-surface-800 dark:text-surface-200 flex items-center gap-1.5">
              <i class="pi pi-map-marker text-xs text-orange-500"></i>
              <span>{{ selectedCustomerForView.address || 'No address provided' }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-4 border-t border-surface-200 dark:border-surface-700">
          <p-button
            label="Close"
            severity="secondary"
            [outlined]="true"
            size="small"
            (click)="viewCustomerDialogVisible = false"
          ></p-button>
          <p-button
            label="New Service"
            icon="pi pi-wrench"
            size="small"
            styleClass="bg-orange-500 hover:bg-orange-600 border-none text-white font-semibold"
            [routerLink]="['/services/new']"
            [queryParams]="{ customerId: selectedCustomerForView.id }"
            (click)="viewCustomerDialogVisible = false"
          ></p-button>
        </div>
      </div>
    </p-dialog>
  `
})
export class CustomersListComponent implements OnInit {
  private fb = inject(FormBuilder);
  protected miscService = inject(MiscService);
  protected customerService = inject(CustomerService);
  protected authService = inject(AuthService);
  private notificationService = inject(AppNotificationService);
  private router = inject(Router);

  // Reactive state from MiscService
  customers = this.miscService.customers;
  isLoading = signal<boolean>(false);
  loadError = signal<boolean>(false);
  loadErrorMessage = signal<string>('');

  isSubmitting = false;

  addCustomerDialogVisible = false;
  viewCustomerDialogVisible = false;
  selectedCustomerForView: MiscCustomer | null = null;

  customerForm!: FormGroup;

  // Filtered customers directly from misc customers signal
  filteredCustomers = computed(() => {
    return this.customers();
  });

  ngOnInit(): void {
    this.initForm();
    this.loadCustomers();
  }

  private initForm(): void {
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', Validators.email],
      address: ['']
    });
  }

  loadCustomers(): void {
    this.isLoading.set(true);
    this.loadError.set(false);
    this.loadErrorMessage.set('');

    this.miscService.getCustomers().subscribe({
      next: (data) => {
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.loadError.set(true);
        this.loadErrorMessage.set(err?.message || 'Failed to load customers from /api/misc/customers');
        this.notificationService.handleApiError('load customers', err, 'Unable to load customers. Please check your connection.');
      }
    });
  }

  openAddCustomerDialog(): void {
    this.customerForm.reset();
    this.addCustomerDialogVisible = true;
  }

  openViewDialog(cust: MiscCustomer): void {
    this.selectedCustomerForView = cust;
    this.viewCustomerDialogVisible = true;
  }

  isFieldInvalid(fieldName: string): boolean {
    const f = this.customerForm.get(fieldName);
    return !!(f && f.invalid && (f.dirty || f.touched || this.isSubmitting));
  }

  submitNewCustomer(): void {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      this.notificationService.showWarning(
        'Incomplete Form',
        'Name and Phone Number are required.'
      );
      return;
    }

    this.isSubmitting = true;
    const val = this.customerForm.value;

    const payload: CreateCustomerRequest = {
      name: val.name.trim(),
      phoneNumber: val.phoneNumber.trim(),
      email: val.email?.trim() ? val.email.trim() : null,
      address: val.address?.trim() ? val.address.trim() : null
    };

    this.customerService.createCustomer(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.addCustomerDialogVisible = false;
        this.notificationService.showApiSuccess(
          'create',
          'Customer',
          `Customer ${res.name} registered successfully.`
        );
        // Immediately refresh live table from /api/misc/customers
        this.loadCustomers();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.notificationService.handleApiError('create customer', err);
      }
    });
  }
}
