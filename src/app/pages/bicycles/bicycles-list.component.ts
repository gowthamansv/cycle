import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { CycleDataService } from '../../services/cycle-data.service';
import { Bicycle, BicycleType } from '../../models/cycle-management.models';
import { AuthService } from '../../common/services/auth.service';
import { CycleService } from '../../services/cycle.service';
import { MiscService } from '../../services/misc.service';
import { AppNotificationService } from '../../common/services/notification.service';
import { CreateCycleRequest } from '../../models/api.models';

@Component({
  selector: 'app-bicycles-list',
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
    TooltipModule,
    MessageModule
  ],
  template: `
    <!-- ============================================================= -->
    <!-- USER ROLE: DIRECT CREATE BICYCLE INTERFACE                    -->
    <!-- ============================================================= -->
    <div *ngIf="!authService.isAdmin()" class="max-w-2xl mx-auto flex flex-col gap-6 animate-fade-in">
      <!-- Header -->
      <div class="bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">Create Bicycle</h1>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              API Live (POST /api/cycles)
            </span>
          </div>
          <p class="text-sm text-muted-color mt-1">Register a new bicycle profile linked to a rider account into backend database.</p>
        </div>
      </div>

      <!-- Create Bicycle Form Card -->
      <div class="card p-6 md:p-8 shadow-sm border border-surface-200 dark:border-surface-700 space-y-5">
        <div>
          <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Owner (Customer) *</label>
          <p-select
            [options]="customerOptions"
            [(ngModel)]="userBikeForm.customerId"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Registered Rider"
            styleClass="w-full"
          ></p-select>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Brand *</label>
            <input pInputText [(ngModel)]="userBikeForm.brand" placeholder="e.g. Trek, Specialized, Giant" class="w-full" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Model Name *</label>
            <input pInputText [(ngModel)]="userBikeForm.model" placeholder="e.g. Domane AL 2, Stumpjumper" class="w-full" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Bicycle Type *</label>
            <p-select [options]="typeOptions" [(ngModel)]="userBikeForm.type" styleClass="w-full"></p-select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Frame Number</label>
            <input pInputText [(ngModel)]="userBikeForm.frameNumber" placeholder="FRM-78192" class="w-full" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Purchase Date</label>
            <input pInputText type="date" [(ngModel)]="userBikeForm.purchaseDate" class="w-full" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Serial Number *</label>
            <input pInputText [(ngModel)]="userBikeForm.serialNumber" placeholder="SN-998811" class="w-full" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Notes / Specifications</label>
          <input pInputText [(ngModel)]="userBikeForm.notes" placeholder="e.g. Hydraulic disc brakes, tubeless tires" class="w-full" />
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
          <p-button 
            label="Cancel" 
            severity="secondary" 
            [outlined]="true" 
            [disabled]="isSubmitting"
            (click)="cancelUserCreate()"
          ></p-button>
          <p-button 
            label="Create Bicycle" 
            icon="pi pi-check" 
            [loading]="isSubmitting"
            (click)="saveUserBicycle()"
          ></p-button>
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- ADMIN ROLE: FULL BICYCLE FLEET TABLE & MANAGEMENT MODAL       -->
    <!-- ============================================================= -->
    <div *ngIf="authService.isAdmin()" class="flex flex-col gap-6 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">Bicycle Fleet</h1>
            <span class="text-xs px-2.5 py-1 rounded-full font-semibold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
              Bicycle Management
            </span>
          </div>
          <p class="text-sm text-muted-color mt-1">Manage bicycle inventory, frame numbers, component specifications, and service intervals.</p>
        </div>

        <div class="flex items-center gap-3">
          <p-button
            label="+ Add Bicycle"
            icon="pi pi-plus"
            (click)="openAddModal()"
          ></p-button>
        </div>
      </div>

      <!-- Explicit Backend API Status Notice as per requirements -->
      <div class="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
        <i class="pi pi-exclamation-triangle text-amber-600 text-lg mt-0.5"></i>
        <div>
          <div class="text-sm font-bold text-amber-900 dark:text-amber-200">
            Backend API Notice: GET /api/cycles is not available
          </div>
          <div class="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
            The backend currently provides <code>POST /api/cycles</code> (create bicycle) and <code>GET /api/cycles/&#123;id&#125;/service-info</code> (service history).
            The bicycle listing table below is structurally prepared for future GET endpoint release.
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card p-4 shadow-sm border border-surface-200 dark:border-surface-700">
        <div class="flex flex-wrap items-end gap-4">
          <div class="w-full sm:w-64">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Bicycle Type</label>
            <p-select
              [options]="typeOptions"
              [(ngModel)]="selectedType"
              placeholder="All Types"
              [showClear]="true"
              styleClass="w-full"
            ></p-select>
          </div>

          <div class="w-full sm:w-64">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Status</label>
            <p-select
              [options]="statusOptions"
              [(ngModel)]="selectedStatus"
              placeholder="All Statuses"
              [showClear]="true"
              styleClass="w-full"
            ></p-select>
          </div>

          <div class="w-full sm:w-auto">
            <p-button
              label="Reset"
              icon="pi pi-filter-slash"
              [outlined]="true"
              severity="secondary"
              (click)="selectedType = null; selectedStatus = null"
              styleClass="w-full sm:w-auto"
            ></p-button>
          </div>
        </div>
      </div>

      <!-- Bicycles Table Prepared for GET Integration -->
      <div class="card p-0 shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
        <p-table
          [value]="filteredBicycles"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 15, 20]"
          [rowHover]="true"
          responsiveLayout="scroll"
          styleClass="p-datatable-sm"
        >
          <ng-template #header>
            <tr>
              <th pSortableColumn="brand" style="min-width: 14rem">Brand & Model <p-sortIcon field="brand"></p-sortIcon></th>
              <th pSortableColumn="type" style="min-width: 8rem">Type <p-sortIcon field="type"></p-sortIcon></th>
              <th style="min-width: 9rem">Frame No.</th>
              <th style="min-width: 9rem">Serial No.</th>
              <th pSortableColumn="customerName" style="min-width: 11rem">Owner <p-sortIcon field="customerName"></p-sortIcon></th>
              <th style="min-width: 8.5rem">Purchase Date</th>
              <th pSortableColumn="lastServiceDate" style="min-width: 8.5rem">Last Service <p-sortIcon field="lastServiceDate"></p-sortIcon></th>
              <th pSortableColumn="status" style="min-width: 8rem">Status <p-sortIcon field="status"></p-sortIcon></th>
              <th style="min-width: 7rem" class="text-center">Actions</th>
            </tr>
          </ng-template>

          <ng-template #body let-bike>
            <tr>
              <td>
                <div class="font-bold text-surface-900 dark:text-surface-0 text-sm">
                  <a [routerLink]="['/bicycles', bike.id]" class="hover:text-primary hover:underline font-semibold">
                    {{ bike.brand }} {{ bike.model }}
                  </a>
                </div>
                <div class="text-[11px] text-muted-color font-mono">ID: {{ bike.id }}</div>
              </td>
              <td>
                <span class="inline-block text-xs px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 font-medium text-surface-800 dark:text-surface-200">
                  {{ bike.type }}
                </span>
              </td>
              <td>
                <span class="font-mono text-xs text-surface-700 dark:text-surface-300 font-medium">{{ bike.frameNumber }}</span>
              </td>
              <td>
                <span class="font-mono text-xs bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded text-surface-800 dark:text-surface-200 font-medium">
                  {{ bike.serialNumber }}
                </span>
              </td>
              <td>
                <a [routerLink]="['/customers', bike.customerId]" class="text-xs font-semibold text-primary hover:underline block">
                  {{ bike.customerName }}
                </a>
              </td>
              <td>
                <span class="text-xs text-muted-color font-mono">{{ bike.purchaseDate }}</span>
              </td>
              <td>
                <span class="text-xs font-mono text-surface-800 dark:text-surface-200">{{ bike.lastServiceDate }}</span>
              </td>
              <td>
                <p-tag
                  [value]="bike.status"
                  [severity]="bike.status === 'Good' ? 'success' : bike.status === 'In Service' ? 'warn' : bike.status === 'Ready for Pickup' ? 'info' : 'danger'"
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
                    pTooltip="View Bicycle Profile"
                    [routerLink]="['/bicycles', bike.id]"
                  ></p-button>
                  <p-button
                    icon="pi pi-wrench"
                    [rounded]="true"
                    [text]="true"
                    severity="primary"
                    size="small"
                    pTooltip="Create Service Ticket"
                    routerLink="/services/new"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template #emptymessage>
            <tr>
              <td colspan="9" class="text-center p-8 text-muted-color">
                <i class="pi pi-compass text-4xl mb-3 block text-surface-400"></i>
                <div>No bicycles in view.</div>
                <div class="text-xs text-muted-color mt-1">Ready for GET /api/cycles backend endpoint release.</div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Add Bicycle Modal (Admin Only - Live POST /api/cycles) -->
    <p-dialog
      [(visible)]="addDialogVisible"
      header="Register New Bicycle (Backend Linked)"
      [modal]="true"
      [style]="{ width: '90vw', maxWidth: '600px' }"
      [draggable]="false"
    >
      <div class="space-y-4 pt-2">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Brand *</label>
            <input pInputText [(ngModel)]="newBike.brand" placeholder="e.g. Trek, Canyon, Specialized" class="w-full" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Model Name *</label>
            <input pInputText [(ngModel)]="newBike.model" placeholder="e.g. Domane SL 6" class="w-full" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Bicycle Type *</label>
            <p-select [options]="typeOptions" [(ngModel)]="newBike.type" styleClass="w-full"></p-select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Owner (Customer) *</label>
            <p-select
              [options]="customerOptions"
              [(ngModel)]="newBike.customerId"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Customer"
              styleClass="w-full"
            ></p-select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Frame Number</label>
            <input pInputText [(ngModel)]="newBike.frameNumber" placeholder="FRM-99210" class="w-full" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Serial Number *</label>
            <input pInputText [(ngModel)]="newBike.serialNumber" placeholder="WTU2000X" class="w-full" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Gear System</label>
            <input pInputText [(ngModel)]="newBike.gearSystem" placeholder="Shimano 105 Di2" class="w-full" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Color Scheme</label>
            <input pInputText [(ngModel)]="newBike.color" placeholder="Matte Black / Orange" class="w-full" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Notes / Specifications</label>
          <input pInputText [(ngModel)]="newBike.notes" placeholder="Tubeless 28mm tires, 48T chainring..." class="w-full" />
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <p-button label="Cancel" severity="secondary" [outlined]="true" [disabled]="isSubmitting" (click)="addDialogVisible = false"></p-button>
          <p-button label="Register Bicycle" icon="pi pi-check" [loading]="isSubmitting" (click)="saveBicycle()"></p-button>
        </div>
      </div>
    </p-dialog>
  `
})
export class BicyclesListComponent implements OnInit {
  protected dataService = inject(CycleDataService);
  protected authService = inject(AuthService);
  protected cycleService = inject(CycleService);
  protected miscService = inject(MiscService);
  private notificationService = inject(AppNotificationService);
  private router = inject(Router);

  selectedType: BicycleType | null = null;
  selectedStatus: string | null = null;
  isSubmitting = false;

  // Direct User Form Model
  userBikeForm = {
    customerId: '',
    brand: '',
    model: '',
    type: 'Road' as BicycleType,
    frameNumber: '',
    serialNumber: '',
    purchaseDate: '2026-09-20',
    notes: ''
  };

  // Admin Modal Model
  addDialogVisible = false;
  newBike = {
    name: '',
    brand: '',
    model: '',
    type: 'Road' as BicycleType,
    frameNumber: '',
    serialNumber: '',
    customerId: '',
    customerName: '',
    purchaseDate: '2026-09-20',
    status: 'Good' as const,
    lastServiceDate: '2026-09-20',
    nextServiceDate: '2027-03-20',
    gearSystem: '',
    color: '',
    notes: ''
  };

  typeOptions = [
    { label: 'Road', value: 'Road' },
    { label: 'Mountain', value: 'Mountain' },
    { label: 'Hybrid', value: 'Hybrid' },
    { label: 'BMX', value: 'BMX' },
    { label: 'Electric', value: 'Electric' },
    { label: 'Gravel', value: 'Gravel' },
    { label: 'Other', value: 'Other' }
  ];

  statusOptions = [
    { label: 'Good', value: 'Good' },
    { label: 'Needs Service', value: 'Needs Service' },
    { label: 'In Service', value: 'In Service' },
    { label: 'Ready for Pickup', value: 'Ready for Pickup' }
  ];

  customerOptions: { label: string; value: string }[] = [];

  ngOnInit(): void {
    this.refreshCustomerOptions();
  }

  private refreshCustomerOptions(): void {
    this.miscService.getCustomers().subscribe({
      next: (custs) => {
        if (custs && custs.length > 0) {
          this.customerOptions = custs.map(c => ({
            label: `${c.name} (${c.phoneNumber || 'No Phone'})`,
            value: c.id
          }));
        } else {
          this.customerOptions = this.dataService.customers().map(c => ({
            label: `${c.name} (${c.phone})`,
            value: c.id
          }));
        }
        if (this.customerOptions.length > 0 && !this.userBikeForm.customerId) {
          this.userBikeForm.customerId = this.customerOptions[0].value;
        }
      },
      error: () => {
        this.customerOptions = this.dataService.customers().map(c => ({
          label: `${c.name} (${c.phone})`,
          value: c.id
        }));
        if (this.customerOptions.length > 0 && !this.userBikeForm.customerId) {
          this.userBikeForm.customerId = this.customerOptions[0].value;
        }
      }
    });
  }

  get filteredBicycles(): Bicycle[] {
    return this.dataService.bicycles().filter(b => {
      const matchesType = !this.selectedType || b.type === this.selectedType;
      const matchesStatus = !this.selectedStatus || b.status === this.selectedStatus;

      return matchesType && matchesStatus;
    });
  }

  // User Actions (Live Backend POST /api/cycles)
  saveUserBicycle(): void {
    if (!this.userBikeForm.brand.trim() || !this.userBikeForm.model.trim() || !this.userBikeForm.customerId) {
      this.notificationService.showWarning(
        'Missing Fields',
        'Owner, Brand, and Model are required.'
      );
      return;
    }

    const serial = this.userBikeForm.serialNumber.trim() || `SN-${Math.floor(100000 + Math.random() * 900000)}`;
    const fullModel = `${this.userBikeForm.brand.trim()} ${this.userBikeForm.model.trim()}`.trim();

    this.isSubmitting = true;
    const reqPayload: CreateCycleRequest = {
      customerId: this.userBikeForm.customerId,
      model: fullModel,
      serialNumber: serial
    };

    this.cycleService.createCycle(reqPayload).subscribe({
      next: (res) => {
        this.isSubmitting = false;

        const cust = this.dataService.customers().find(c => c.id === this.userBikeForm.customerId);
        const customerName = cust ? cust.name : 'Registered Rider';

        this.dataService.addBicycle({
          name: fullModel,
          brand: this.userBikeForm.brand.trim(),
          model: this.userBikeForm.model.trim(),
          type: this.userBikeForm.type,
          customerId: this.userBikeForm.customerId,
          customerName: customerName,
          frameNumber: this.userBikeForm.frameNumber.trim() || `FRM-${Math.floor(10000 + Math.random() * 90000)}`,
          serialNumber: serial,
          purchaseDate: this.userBikeForm.purchaseDate || '2026-09-20',
          status: 'Good',
          lastServiceDate: '2026-09-20',
          nextServiceDate: '2027-03-20',
          gearSystem: 'Standard',
          color: 'Default',
          notes: this.userBikeForm.notes.trim()
        });

        this.notificationService.showApiSuccess(
          'create',
          'Bicycle',
          `${fullModel} registered successfully.`
        );

        // Reset user form
        this.userBikeForm = {
          customerId: this.customerOptions.length > 0 ? this.customerOptions[0].value : '',
          brand: '',
          model: '',
          type: 'Road',
          frameNumber: '',
          serialNumber: '',
          purchaseDate: '2026-09-20',
          notes: ''
        };
      },
      error: (err) => {
        this.isSubmitting = false;
        this.notificationService.handleApiError('create bicycle', err);
      }
    });
  }

  cancelUserCreate(): void {
    this.router.navigate(['/services']);
  }

  // Admin Actions
  openAddModal(): void {
    const custs = this.customerOptions;
    this.newBike = {
      name: '',
      brand: '',
      model: '',
      type: 'Road',
      frameNumber: `FRM-${Math.floor(10000 + Math.random() * 90000)}`,
      serialNumber: `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      customerId: custs.length > 0 ? custs[0].value : '',
      customerName: '',
      purchaseDate: '2026-09-20',
      status: 'Good',
      lastServiceDate: '2026-09-20',
      nextServiceDate: '2027-03-20',
      gearSystem: 'Shimano 105',
      color: '',
      notes: ''
    };
    this.addDialogVisible = true;
  }

  saveBicycle(): void {
    if (!this.newBike.brand || !this.newBike.model || !this.newBike.customerId) {
      this.notificationService.showWarning(
        'Incomplete Form',
        'Brand, Model and Customer are required.'
      );
      return;
    }

    const fullModel = `${this.newBike.brand.trim()} ${this.newBike.model.trim()}`.trim();
    const serial = this.newBike.serialNumber.trim() || `SN-${Math.floor(100000 + Math.random() * 900000)}`;

    this.isSubmitting = true;
    const reqPayload: CreateCycleRequest = {
      customerId: this.newBike.customerId,
      model: fullModel,
      serialNumber: serial
    };

    this.cycleService.createCycle(reqPayload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        const cust = this.dataService.customers().find(c => c.id === this.newBike.customerId);
        if (cust) {
          this.newBike.customerName = cust.name;
        }

        this.dataService.addBicycle({
          ...this.newBike,
          name: fullModel
        });

        this.addDialogVisible = false;
        this.notificationService.showApiSuccess(
          'create',
          'Bicycle',
          `${fullModel} registered successfully.`
        );
      },
      error: (err) => {
        this.isSubmitting = false;
        this.notificationService.handleApiError('register bicycle', err);
      }
    });
  }
}

