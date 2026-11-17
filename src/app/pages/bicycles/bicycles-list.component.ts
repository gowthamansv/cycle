import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import QRCode from 'qrcode';
import { BicycleType } from '../../models/cycle-management.models';
import { AuthService } from '../../common/services/auth.service';
import { CycleService } from '../../services/cycle.service';
import { MiscService } from '../../services/misc.service';
import { AppNotificationService } from '../../common/services/notification.service';
import { AppConfigService } from '../../app.config.service';
import { CreateCycleRequest, Cycle } from '../../models/api.models';

interface SelectOption {
  label: string;
  value: string;
}

interface UserBikeForm {
  customerId: string;
  brand: string;
  model: string;
  type: BicycleType;
  frameNumber: string;
  serialNumber: string;
  purchaseDate: string;
  notes: string;
}

interface NewBikeForm {
  brand: string;
  model: string;
  type: BicycleType;
  frameNumber: string;
  serialNumber: string;
  customerId: string;
  gearSystem: string;
  color: string;
  notes: string;
}

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
    DialogModule,
    TooltipModule,
    SkeletonModule,
    IconFieldModule,
    InputIconModule
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
              {{ bicycles().length }} Bicycles
            </span>
          </div>
          <p class="text-sm text-muted-color mt-1">Manage registered bicycles, serial numbers, QR codes, and service history.</p>
        </div>

        <div class="flex items-center gap-3">
          <p-button
            label="Refresh"
            icon="pi pi-refresh"
            [outlined]="true"
            severity="secondary"
            size="small"
            [loading]="isLoading()"
            (click)="loadBicycles()"
          ></p-button>
          <p-button
            label="+ Add Bicycle"
            icon="pi pi-plus"
            size="small"
            (click)="openAddModal()"
          ></p-button>
        </div>
      </div>

      <!-- Error Banner -->
      <div *ngIf="loadError()" class="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 text-red-700 dark:text-red-300">
          <i class="pi pi-exclamation-triangle text-xl"></i>
          <div>
            <div class="font-semibold text-sm">Unable to load bicycles</div>
            <div class="text-xs text-red-600 dark:text-red-400">{{ loadErrorMessage() }}</div>
          </div>
        </div>
        <p-button
          label="Retry"
          icon="pi pi-refresh"
          severity="danger"
          size="small"
          (click)="loadBicycles()"
        ></p-button>
      </div>

      <!-- Search & Filters -->
      <div class="card p-4 shadow-sm border border-surface-200 dark:border-surface-700">
        <div class="flex flex-wrap items-end gap-4">
          <div class="w-full sm:flex-1 sm:min-w-64">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Search Bicycles</label>
            <p-iconfield iconPosition="left" class="w-full block">
              <p-inputicon class="pi pi-search"></p-inputicon>
              <input
                pInputText
                type="text"
                [ngModel]="searchQuery()"
                (ngModelChange)="searchQuery.set($event)"
                placeholder="Search by model, customer name, serial number, or QR token..."
                class="w-full"
              />
            </p-iconfield>
          </div>

          <div class="w-full sm:w-64">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Customer</label>
            <p-select
              [options]="customerFilterOptions()"
              [ngModel]="selectedCustomerId()"
              (ngModelChange)="selectedCustomerId.set($event)"
              optionLabel="label"
              optionValue="value"
              placeholder="All Customers"
              [showClear]="true"
              [filter]="true"
              styleClass="w-full"
            ></p-select>
          </div>

          <div class="w-full sm:w-auto">
            <p-button
              label="Reset"
              icon="pi pi-filter-slash"
              [outlined]="true"
              severity="secondary"
              [disabled]="!hasActiveFilters()"
              (click)="resetFilters()"
              styleClass="w-full sm:w-auto"
            ></p-button>
          </div>
        </div>
      </div>

      <!-- Bicycles Listing Table -->
      <div class="card p-0 shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
        <p-table
          [value]="filteredCycles()"
          dataKey="id"
          [loading]="isLoading()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 15, 20]"
          [rowHover]="true"
          responsiveLayout="scroll"
          styleClass="p-datatable-sm"
        >
          <ng-template #header>
            <tr>
              <th pSortableColumn="model" style="min-width: 14rem">Bicycle Model <p-sortIcon field="model"></p-sortIcon></th>
              <th pSortableColumn="customerName" style="min-width: 12rem">Customer Name <p-sortIcon field="customerName"></p-sortIcon></th>
              <th pSortableColumn="serialNumber" style="min-width: 10rem">Serial Number <p-sortIcon field="serialNumber"></p-sortIcon></th>
              <th pSortableColumn="qrToken" style="min-width: 14rem">QR Token <p-sortIcon field="qrToken"></p-sortIcon></th>
              <th pSortableColumn="createdAt" style="min-width: 11rem">Created Date <p-sortIcon field="createdAt"></p-sortIcon></th>
              <th style="min-width: 9rem" class="text-center">Actions</th>
            </tr>
          </ng-template>

          <ng-template #body let-cycle>
            <tr>
              <td>
                <div class="font-bold text-surface-900 dark:text-surface-0 text-sm">
                  <a [routerLink]="['/bicycles', cycle.id]" class="hover:text-primary hover:underline font-semibold">
                    {{ cycle.model || '—' }}
                  </a>
                </div>
                <div class="text-[11px] text-muted-color font-mono" [pTooltip]="cycle.id">
                  ID: #{{ cycle.id ? (cycle.id.substring(0, 8) | uppercase) : 'N/A' }}
                </div>
              </td>
              <td>
                <a
                  *ngIf="cycle.customerId; else plainCustomerName"
                  [routerLink]="['/customers', cycle.customerId]"
                  class="text-xs font-semibold text-primary hover:underline block"
                >
                  {{ cycle.customerName || '—' }}
                </a>
                <ng-template #plainCustomerName>
                  <span class="text-xs font-semibold text-surface-800 dark:text-surface-200">{{ cycle.customerName || '—' }}</span>
                </ng-template>
              </td>
              <td>
                <span class="font-mono text-xs bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded text-surface-800 dark:text-surface-200 font-medium">
                  {{ cycle.serialNumber || '—' }}
                </span>
              </td>
              <td>
                <div class="flex items-center gap-1.5">
                  <span
                    class="font-mono text-xs text-surface-700 dark:text-surface-300 truncate max-w-[14rem] inline-block"
                    [pTooltip]="cycle.qrToken"
                  >
                    {{ cycle.qrToken || '—' }}
                  </span>
                </div>
              </td>
              <td>
                <div class="text-xs font-mono text-surface-800 dark:text-surface-200">
                  {{ cycle.createdAt ? (cycle.createdAt | date: 'mediumDate') : '—' }}
                </div>
                <div *ngIf="cycle.createdAt" class="text-[11px] text-muted-color font-mono">
                  {{ cycle.createdAt | date: 'shortTime' }}
                </div>
              </td>
              <td class="text-center">
                <div class="flex items-center justify-center gap-1">
                  <p-button
                    icon="pi pi-eye"
                    [rounded]="true"
                    [text]="true"
                    severity="secondary"
                    size="small"
                    pTooltip="View Bicycle Profile & Service History"
                    [routerLink]="['/bicycles', cycle.id]"
                  ></p-button>
                  <p-button
                    icon="pi pi-qrcode"
                    [rounded]="true"
                    [text]="true"
                    severity="info"
                    size="small"
                    pTooltip="View & Print QR Code"
                    (click)="openQrDialog(cycle)"
                  ></p-button>
                  <p-button
                    icon="pi pi-wrench"
                    [rounded]="true"
                    [text]="true"
                    severity="primary"
                    size="small"
                    pTooltip="Create Service Ticket"
                    routerLink="/services/new"
                    [queryParams]="{ customerId: cycle.customerId, cycleId: cycle.id }"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template #loadingbody>
            <tr *ngFor="let _ of skeletonRows">
              <td>
                <p-skeleton width="80%" height="1rem" styleClass="mb-1"></p-skeleton>
                <p-skeleton width="50%" height="0.75rem"></p-skeleton>
              </td>
              <td><p-skeleton width="70%" height="1rem"></p-skeleton></td>
              <td><p-skeleton width="65%" height="1.25rem"></p-skeleton></td>
              <td><p-skeleton width="85%" height="1rem"></p-skeleton></td>
              <td><p-skeleton width="65%" height="1rem"></p-skeleton></td>
              <td><p-skeleton width="75%" height="1.5rem" styleClass="mx-auto"></p-skeleton></td>
            </tr>
          </ng-template>

          <ng-template #emptymessage>
            <tr *ngIf="!isLoading()">
              <td colspan="6" class="text-center p-8 text-muted-color">
                <i class="pi pi-compass text-4xl mb-3 block text-surface-400"></i>
                <div class="font-medium text-surface-700 dark:text-surface-300">No bicycles found.</div>
                <div *ngIf="hasActiveFilters()" class="text-xs text-muted-color mt-1">
                  No bicycles match your current search or filter criteria.
                </div>
                <div *ngIf="!hasActiveFilters()" class="text-xs text-muted-color mt-1">
                  Register a new bicycle using the button above to see it listed here.
                </div>
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

    <!-- QR Code Display & Print Modal -->
    <p-dialog
      [(visible)]="qrDialogVisible"
      header="Bicycle QR Code"
      [modal]="true"
      [style]="{ width: '90vw', maxWidth: '460px' }"
      [draggable]="false"
      [resizable]="false"
    >
      <div *ngIf="selectedCycleForQr" class="space-y-4 pt-2">
        <div class="flex flex-col items-center gap-3 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700">
          <div class="bg-white p-3 rounded-xl border border-surface-200 shadow-sm flex items-center justify-center w-44 h-44">
            <img *ngIf="qrDataUrl()" [src]="qrDataUrl()" alt="Bicycle Service QR Code" class="w-36 h-36 object-contain" />
            <div *ngIf="!qrDataUrl() && isGeneratingQr()" class="flex items-center justify-center text-muted-color">
              <i class="pi pi-spin pi-spinner text-2xl"></i>
            </div>
          </div>

          <div class="text-center">
            <div class="text-base font-bold text-surface-900 dark:text-surface-0">{{ selectedCycleForQr.model }}</div>
            <div class="text-xs text-muted-color mt-0.5">
              Owner: <span class="font-semibold text-surface-800 dark:text-surface-200">{{ selectedCycleForQr.customerName }}</span>
            </div>
            <div class="text-xs text-muted-color font-mono mt-0.5">
              SN: {{ selectedCycleForQr.serialNumber || '—' }}
            </div>
          </div>
        </div>

        <div class="space-y-2 text-xs">
          <div>
            <span class="font-semibold text-muted-color uppercase block mb-1">QR Token</span>
            <div class="p-2 rounded bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 font-mono text-[11px] break-all select-all text-surface-800 dark:text-surface-200">
              {{ selectedCycleForQr.qrToken || '—' }}
            </div>
          </div>

          <div>
            <span class="font-semibold text-muted-color uppercase block mb-1">Service Info Endpoint</span>
            <div class="p-2 rounded bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 font-mono text-[11px] break-all select-all text-surface-700 dark:text-surface-300">
              {{ qrServiceInfoUrl() }}
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-surface-200 dark:border-surface-700">
          <p-button
            label="Close"
            severity="secondary"
            [outlined]="true"
            size="small"
            (click)="qrDialogVisible = false"
          ></p-button>
          <p-button
            label="Service History"
            icon="pi pi-history"
            severity="secondary"
            size="small"
            [routerLink]="['/bicycles', selectedCycleForQr.id]"
            (click)="qrDialogVisible = false"
          ></p-button>
          <p-button
            label="Print QR Sticker"
            icon="pi pi-print"
            size="small"
            [disabled]="!qrDataUrl()"
            (click)="printQrCode()"
          ></p-button>
        </div>
      </div>
    </p-dialog>
  `
})
export class BicyclesListComponent implements OnInit {
  protected authService = inject(AuthService);
  protected cycleService = inject(CycleService);
  protected miscService = inject(MiscService);
  private notificationService = inject(AppNotificationService);
  private configService = inject(AppConfigService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  bicycles = signal<Cycle[]>([]);
  isLoading = signal<boolean>(false);
  loadError = signal<boolean>(false);
  loadErrorMessage = signal<string>('');

  searchQuery = signal<string>('');
  selectedCustomerId = signal<string | null>(null);
  isSubmitting = false;

  readonly skeletonRows = [1, 2, 3, 4, 5];

  // QR Dialog State
  qrDialogVisible = false;
  selectedCycleForQr: Cycle | null = null;
  qrDataUrl = signal<string | null>(null);
  qrServiceInfoUrl = signal<string>('');
  isGeneratingQr = signal<boolean>(false);

  // Direct User Form Model
  userBikeForm: UserBikeForm = {
    customerId: '',
    brand: '',
    model: '',
    type: 'Road',
    frameNumber: '',
    serialNumber: '',
    purchaseDate: '',
    notes: ''
  };

  // Admin Modal Model
  addDialogVisible = false;
  newBike: NewBikeForm = {
    brand: '',
    model: '',
    type: 'Road',
    frameNumber: '',
    serialNumber: '',
    customerId: '',
    gearSystem: '',
    color: '',
    notes: ''
  };

  typeOptions: SelectOption[] = [
    { label: 'Road', value: 'Road' },
    { label: 'Mountain', value: 'Mountain' },
    { label: 'Hybrid', value: 'Hybrid' },
    { label: 'BMX', value: 'BMX' },
    { label: 'Electric', value: 'Electric' },
    { label: 'Gravel', value: 'Gravel' },
    { label: 'Other', value: 'Other' }
  ];

  customerOptions: SelectOption[] = [];

  customerFilterOptions = computed<SelectOption[]>(() => {
    const uniqueCustomers = new Map<string, string>();
    for (const cycle of this.bicycles()) {
      if (cycle.customerId && cycle.customerName && !uniqueCustomers.has(cycle.customerId)) {
        uniqueCustomers.set(cycle.customerId, cycle.customerName);
      }
    }
    return Array.from(uniqueCustomers.entries())
      .map(([value, label]) => ({ label, value }))
      .sort((a, b) => a.label.localeCompare(b.label));
  });

  hasActiveFilters = computed<boolean>(() => {
    return this.searchQuery().trim().length > 0 || this.selectedCustomerId() !== null;
  });

  filteredCycles = computed<Cycle[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const customerId = this.selectedCustomerId();

    return this.bicycles().filter((cycle) => {
      const matchesCustomer = !customerId || cycle.customerId === customerId;
      if (!matchesCustomer) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        (cycle.model ?? '').toLowerCase().includes(query) ||
        (cycle.customerName ?? '').toLowerCase().includes(query) ||
        (cycle.serialNumber ?? '').toLowerCase().includes(query) ||
        (cycle.qrToken ?? '').toLowerCase().includes(query)
      );
    });
  });

  ngOnInit(): void {
    this.refreshCustomerOptions();
    if (this.authService.isAdmin()) {
      this.loadBicycles();
    }
  }

  loadBicycles(): void {
    this.isLoading.set(true);
    this.loadError.set(false);
    this.loadErrorMessage.set('');

    this.cycleService
      .getCycles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cycles: Cycle[]) => {
          this.bicycles.set(cycles ?? []);
          this.isLoading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.bicycles.set([]);
          this.isLoading.set(false);
          this.loadError.set(true);
          this.loadErrorMessage.set(err?.message || 'Failed to load bicycles from the server.');
          this.notificationService.handleApiError(
            'load bicycles',
            err,
            'Unable to load bicycles. Please check your connection and try again.'
          );
        }
      });
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedCustomerId.set(null);
  }

  private refreshCustomerOptions(): void {
    this.miscService
      .getCustomers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (custs) => {
          if (custs && custs.length > 0) {
            this.customerOptions = custs.map((c) => ({
              label: `${c.name} (${c.phoneNumber || 'No Phone'})`,
              value: c.id
            }));
          } else {
            this.customerOptions = [];
          }
          if (this.customerOptions.length > 0 && !this.userBikeForm.customerId) {
            this.userBikeForm.customerId = this.customerOptions[0].value;
          }
        },
        error: () => {
          this.customerOptions = [];
        }
      });
  }

  // QR Code Display & Printing
  openQrDialog(cycle: Cycle): void {
    this.selectedCycleForQr = cycle;
    this.qrDialogVisible = true;
    this.qrDataUrl.set(null);
    this.isGeneratingQr.set(true);

    const baseUrl = this.configService.apiUrl.replace(/\/+$/, '');
    const serviceInfoUrl = `${baseUrl}/api/cycles/${cycle.id}/service-info`;
    this.qrServiceInfoUrl.set(serviceInfoUrl);

    QRCode.toDataURL(serviceInfoUrl, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
      .then((url: string) => {
        this.qrDataUrl.set(url);
        this.isGeneratingQr.set(false);
      })
      .catch(() => {
        this.qrDataUrl.set(null);
        this.isGeneratingQr.set(false);
        this.notificationService.showError('QR Generation Failed', 'Unable to generate QR code for this bicycle.');
      });
  }

  printQrCode(): void {
    const dataUrl = this.qrDataUrl();
    const cycle = this.selectedCycleForQr;
    if (!dataUrl || !cycle) {
      this.notificationService.showWarning('QR Unavailable', 'No valid QR code available to print.');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=450,height=550');
    if (!printWindow) {
      this.notificationService.showWarning('Popup Blocked', 'Please allow popups for printing the QR code.');
      return;
    }

    const safeId = this.escapeHtml(cycle.id);
    const safeModel = this.escapeHtml(cycle.model || 'Bicycle');
    const safeCustomer = this.escapeHtml(cycle.customerName || '');
    const safeSerial = this.escapeHtml(cycle.serialNumber || '');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cycle Service QR - ${safeId}</title>
          <style>
            @page { size: auto; margin: 8mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; margin: 0; padding: 20px; color: #111827; }
            .qr-card { display: inline-block; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; max-width: 320px; box-sizing: border-box; }
            .brand-title { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #ea580c; margin-bottom: 6px; }
            .qr-code-print { width: 3cm !important; height: 3cm !important; display: block; margin: 0 auto; }
            .cycle-info { font-size: 11px; font-weight: 700; margin-top: 8px; }
            .cycle-meta { font-size: 10px; color: #4b5563; margin-top: 2px; }
          </style>
        </head>
        <body>
          <div class="qr-card">
            <div class="brand-title">FREEWHEEL SERVICE CENTER</div>
            <img src="${dataUrl}" alt="QR Code" class="qr-code-print" />
            <div class="cycle-info">${safeModel}</div>
            ${safeCustomer ? `<div class="cycle-meta">${safeCustomer}</div>` : ''}
            ${safeSerial ? `<div class="cycle-meta">SN: ${safeSerial}</div>` : ''}
          </div>
          <script>
            window.onload = function() { window.focus(); window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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

    const serial = this.userBikeForm.serialNumber.trim() || `SN-${Date.now()}`;
    const fullModel = `${this.userBikeForm.brand.trim()} ${this.userBikeForm.model.trim()}`.trim();

    this.isSubmitting = true;
    const reqPayload: CreateCycleRequest = {
      customerId: this.userBikeForm.customerId,
      model: fullModel,
      serialNumber: serial
    };

    this.cycleService
      .createCycle(reqPayload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting = false;

          this.notificationService.showApiSuccess(
            'create',
            'Bicycle',
            `${fullModel} registered successfully.`
          );

          if (this.authService.isAdmin()) {
            this.loadBicycles();
          }

          // Reset user form
          this.userBikeForm = {
            customerId: this.customerOptions.length > 0 ? this.customerOptions[0].value : '',
            brand: '',
            model: '',
            type: 'Road',
            frameNumber: '',
            serialNumber: '',
            purchaseDate: '',
            notes: ''
          };
        },
        error: (err: HttpErrorResponse) => {
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
      brand: '',
      model: '',
      type: 'Road',
      frameNumber: '',
      serialNumber: '',
      customerId: custs.length > 0 ? custs[0].value : '',
      gearSystem: '',
      color: '',
      notes: ''
    };
    this.addDialogVisible = true;
  }

  saveBicycle(): void {
    if (!this.newBike.brand.trim() || !this.newBike.model.trim() || !this.newBike.customerId) {
      this.notificationService.showWarning(
        'Incomplete Form',
        'Brand, Model and Customer are required.'
      );
      return;
    }

    const fullModel = `${this.newBike.brand.trim()} ${this.newBike.model.trim()}`.trim();
    const serial = this.newBike.serialNumber.trim() || `SN-${Date.now()}`;

    this.isSubmitting = true;
    const reqPayload: CreateCycleRequest = {
      customerId: this.newBike.customerId,
      model: fullModel,
      serialNumber: serial
    };

    this.cycleService
      .createCycle(reqPayload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.addDialogVisible = false;
          this.notificationService.showApiSuccess(
            'create',
            'Bicycle',
            `${fullModel} registered successfully.`
          );
          this.loadBicycles();
        },
        error: (err: HttpErrorResponse) => {
          this.isSubmitting = false;
          this.notificationService.handleApiError('register bicycle', err);
        }
      });
  }
}
