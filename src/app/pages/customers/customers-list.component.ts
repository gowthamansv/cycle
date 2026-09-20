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
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { CycleDataService } from '../../services/cycle-data.service';
import { Customer } from '../../models/cycle-management.models';

@Component({
  selector: 'app-customers-list',
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
    ToastModule,
    TooltipModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="flex flex-col gap-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">Customers</h1>
            <span class="text-xs px-2.5 py-1 rounded-full font-semibold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
              {{ filteredCustomers.length }} Registered Riders
            </span>
          </div>
          <p class="text-sm text-muted-color mt-1">Manage client profiles, bicycle fleet records, service histories and contacts.</p>
        </div>

        <div class="flex items-center gap-3">
          <p-button
            label="+ Add Customer"
            icon="pi pi-user-plus"
            (click)="openNewCustomerModal()"
          ></p-button>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="card p-4 shadow-sm border border-surface-200 dark:border-surface-700">
        <div class="grid grid-cols-12 gap-4 items-end">
          <div class="col-span-12 sm:col-span-6 md:col-span-5">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Search Customers</label>
            <div class="relative w-full">
              <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-color"></i>
              <input
                pInputText
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Search by name, phone, email, company..."
                class="w-full pl-9"
              />
            </div>
          </div>

          <div class="col-span-12 sm:col-span-6 md:col-span-4">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Status Filter</label>
            <p-select
              [options]="statusOptions"
              [(ngModel)]="selectedStatus"
              placeholder="All Statuses"
              [showClear]="true"
              styleClass="w-full"
            ></p-select>
          </div>

          <div class="col-span-12 md:col-span-3 flex gap-2">
            <p-button
              label="Reset"
              icon="pi pi-filter-slash"
              [outlined]="true"
              severity="secondary"
              (click)="searchQuery = ''; selectedStatus = null"
              styleClass="w-full"
            ></p-button>
          </div>
        </div>
      </div>

      <!-- Customers DataTable -->
      <div class="card p-0 shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
        <p-table
          [value]="filteredCustomers"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[10, 20, 50]"
          [rowHover]="true"
          responsiveLayout="scroll"
          styleClass="p-datatable-sm"
        >
          <ng-template #header>
            <tr>
              <th pSortableColumn="name" style="min-width: 12rem">Customer Name <p-sortIcon field="name"></p-sortIcon></th>
              <th style="min-width: 9rem">Phone</th>
              <th style="min-width: 12rem">Email</th>
              <th pSortableColumn="bicyclesCount" style="min-width: 8rem" class="text-center">Bicycles <p-sortIcon field="bicyclesCount"></p-sortIcon></th>
              <th pSortableColumn="activeServicesCount" style="min-width: 8rem" class="text-center">Active Services <p-sortIcon field="activeServicesCount"></p-sortIcon></th>
              <th pSortableColumn="lastServiceDate" style="min-width: 8.5rem">Last Service <p-sortIcon field="lastServiceDate"></p-sortIcon></th>
              <th pSortableColumn="status" style="min-width: 7rem">Status <p-sortIcon field="status"></p-sortIcon></th>
              <th style="min-width: 8rem" class="text-center">Actions</th>
            </tr>
          </ng-template>

          <ng-template #body let-customer>
            <tr>
              <td>
                <div class="font-bold text-surface-900 dark:text-surface-0 text-sm flex items-center gap-2">
                  <a [routerLink]="['/customers', customer.id]" class="hover:text-primary hover:underline">
                    {{ customer.name }}
                  </a>
                  <span *ngIf="customer.companyName" class="text-[10px] px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-muted-color">
                    {{ customer.companyName }}
                  </span>
                </div>
                <div class="text-[11px] text-muted-color">ID: {{ customer.id }}</div>
              </td>
              <td>
                <span class="font-mono text-xs text-surface-800 dark:text-surface-200">{{ customer.phone }}</span>
              </td>
              <td>
                <span class="text-xs text-surface-700 dark:text-surface-300">{{ customer.email }}</span>
              </td>
              <td class="text-center">
                <span class="inline-flex items-center justify-center font-bold text-xs bg-surface-100 dark:bg-surface-800 w-7 h-7 rounded-full text-surface-800 dark:text-surface-100">
                  {{ customer.bicyclesCount }}
                </span>
              </td>
              <td class="text-center">
                <span
                  class="inline-flex items-center justify-center font-bold text-xs w-7 h-7 rounded-full"
                  [ngClass]="customer.activeServicesCount > 0 ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-600' : 'bg-surface-100 dark:bg-surface-800 text-muted-color'"
                >
                  {{ customer.activeServicesCount }}
                </span>
              </td>
              <td>
                <span class="text-xs text-surface-700 dark:text-surface-300 font-mono">{{ customer.lastServiceDate }}</span>
              </td>
              <td>
                <p-tag
                  [value]="customer.status"
                  [severity]="customer.status === 'VIP' ? 'warn' : customer.status === 'Active' ? 'success' : 'secondary'"
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
                    pTooltip="View Profile"
                    [routerLink]="['/customers', customer.id]"
                  ></p-button>
                  <p-button
                    icon="pi pi-plus"
                    [rounded]="true"
                    [text]="true"
                    severity="primary"
                    size="small"
                    pTooltip="New Service for Customer"
                    routerLink="/services/new"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template #emptymessage>
            <tr>
              <td colspan="8" class="text-center p-8 text-muted-color">
                <i class="pi pi-users text-4xl mb-3 block text-surface-400"></i>
                No customers found matching search filters.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Quick New Customer Modal -->
    <p-dialog
      [(visible)]="newCustomerDialogVisible"
      header="Register New Customer"
      [modal]="true"
      [style]="{ width: '90vw', maxWidth: '540px' }"
      [draggable]="false"
    >
      <div class="space-y-4 pt-2">
        <div>
          <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Full Name *</label>
          <input pInputText [(ngModel)]="newCustomer.name" placeholder="John Doe" class="w-full" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Phone *</label>
            <input pInputText [(ngModel)]="newCustomer.phone" placeholder="+1 (555) 000-0000" class="w-full" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Email *</label>
            <input pInputText [(ngModel)]="newCustomer.email" placeholder="john@example.com" class="w-full" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Company / Team</label>
            <input pInputText [(ngModel)]="newCustomer.companyName" placeholder="e.g. Apex Cycling" class="w-full" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Status</label>
            <p-select [options]="statusOptions" [(ngModel)]="newCustomer.status" styleClass="w-full"></p-select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Address / City</label>
          <input pInputText [(ngModel)]="newCustomer.address" placeholder="123 Main St, City" class="w-full" />
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <p-button label="Cancel" severity="secondary" [outlined]="true" (click)="newCustomerDialogVisible = false"></p-button>
          <p-button label="Save Customer" icon="pi pi-check" (click)="saveCustomer()"></p-button>
        </div>
      </div>
    </p-dialog>
  `
})
export class CustomersListComponent implements OnInit {
  protected dataService = inject(CycleDataService);
  private messageService = inject(MessageService);

  searchQuery = '';
  selectedStatus: string | null = null;

  newCustomerDialogVisible = false;
  newCustomer = {
    name: '',
    phone: '',
    email: '',
    companyName: '',
    status: 'Active' as const,
    address: ''
  };

  statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'VIP', value: 'VIP' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  ngOnInit(): void {}

  get filteredCustomers(): Customer[] {
    return this.dataService.customers().filter(cust => {
      const matchesSearch = !this.searchQuery ||
        cust.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        cust.phone.includes(this.searchQuery) ||
        cust.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (cust.companyName && cust.companyName.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesStatus = !this.selectedStatus || cust.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }

  openNewCustomerModal(): void {
    this.newCustomer = {
      name: '',
      phone: '',
      email: '',
      companyName: '',
      status: 'Active',
      address: ''
    };
    this.newCustomerDialogVisible = true;
  }

  saveCustomer(): void {
    if (!this.newCustomer.name || !this.newCustomer.phone) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Incomplete Details',
        detail: 'Name and phone number are required.'
      });
      return;
    }

    const created = this.dataService.addCustomer(this.newCustomer);
    this.newCustomerDialogVisible = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Customer Registered',
      detail: `${created.name} added successfully.`
    });
  }
}
