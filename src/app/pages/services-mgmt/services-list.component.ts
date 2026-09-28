import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { DrawerModule } from 'primeng/drawer';
import { ProgressBarModule } from 'primeng/progressbar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CycleDataService } from '../../services/cycle-data.service';
import { FreewheelCatalogService } from '../../services/freewheel-catalog.service';
import {
  ServiceTicket,
  TicketStatus,
  TicketPriority,
  ServiceCatalogItem,
  ServiceDepartment,
  BicycleType,
  DigitalBicyclePassport,
  DigitalHealthStatus,
  ComponentHealthItem
} from '../../models/cycle-management.models';
import { AuthService } from '../../common/services/auth.service';

@Component({
  selector: 'app-services-list',
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
    ConfirmDialogModule,
    ToastModule,
    ToggleSwitchModule,
    TooltipModule,
    DrawerModule,
    ProgressBarModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast></p-toast>
    <p-confirmdialog></p-confirmdialog>

    <div class="flex flex-col gap-6">
      <!-- Top Brand & Navigation Header -->
      <div class="bg-gradient-to-r from-surface-900 via-surface-800 to-orange-950 p-6 md:p-8 rounded-2xl border border-surface-700 shadow-xl text-white">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                ⚙️ FREEWHEEL FACTORY
              </span>
              <span class="text-xs text-surface-400 font-mono">Standard Operating System v2.6</span>
            </div>
            <h1 class="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Master Service & Engineering Lab
            </h1>
            <p class="text-sm text-surface-300 mt-1.5 max-w-2xl leading-relaxed">
              International-standard 20-category bicycle service hierarchy, 8 specialized engineering departments, 
              technician SOP workflows, and persistent Digital Bicycle Passports.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <p-button
              label="New Service Ticket"
              icon="pi pi-plus"
              routerLink="/services/new"
              severity="primary"
              styleClass="bg-orange-500 hover:bg-orange-600 border-none font-semibold shadow-lg shadow-orange-500/20"
            ></p-button>
            <p-button
              label="New Health Audit"
              icon="pi pi-verified"
              (click)="openHealthAuditDialog()"
              [outlined]="true"
              styleClass="text-white border-white/30 hover:bg-white/10"
            ></p-button>
          </div>
        </div>

        <!-- Quick Metrics Strip -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div class="bg-white/5 backdrop-blur-sm p-3.5 rounded-xl border border-white/10">
            <div class="text-xs text-surface-300 uppercase font-semibold">Service Departments</div>
            <div class="text-2xl font-bold text-orange-400 mt-0.5">8 Departments</div>
          </div>
          <div class="bg-white/5 backdrop-blur-sm p-3.5 rounded-xl border border-white/10">
            <div class="text-xs text-surface-300 uppercase font-semibold">Standard Services</div>
            <div class="text-2xl font-bold text-white mt-0.5">20 Categories</div>
          </div>
          <div class="bg-white/5 backdrop-blur-sm p-3.5 rounded-xl border border-white/10">
            <div class="text-xs text-surface-300 uppercase font-semibold">Active Service Tickets</div>
            <div class="text-2xl font-bold text-emerald-400 mt-0.5">{{ filteredTickets.length }} Orders</div>
          </div>
          <div class="bg-white/5 backdrop-blur-sm p-3.5 rounded-xl border border-white/10">
            <div class="text-xs text-surface-300 uppercase font-semibold">Digital Passports</div>
            <div class="text-2xl font-bold text-cyan-400 mt-0.5">{{ catalogService.passports().length }} Verified</div>
          </div>
        </div>
      </div>

      <!-- Main Section Tabs Switcher -->
      <div class="flex items-center gap-2 border-b border-surface-200 dark:border-surface-700 pb-2 overflow-x-auto">
        <button
          type="button"
          (click)="activeTab = 'catalog'"
          [ngClass]="activeTab === 'catalog' 
            ? 'bg-orange-500 text-white shadow-sm font-bold' 
            : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 font-medium'"
          class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all whitespace-nowrap"
        >
          <i class="pi pi-wrench text-base"></i>
          <span>1. Service Catalog & SOPs (20 Services)</span>
        </button>

        <button
          type="button"
          (click)="activeTab = 'tickets'"
          [ngClass]="activeTab === 'tickets' 
            ? 'bg-orange-500 text-white shadow-sm font-bold' 
            : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 font-medium'"
          class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all whitespace-nowrap"
        >
          <i class="pi pi-list text-base"></i>
          <span>2. Active Service Orders</span>
          <span class="px-2 py-0.5 rounded-full text-xs" [ngClass]="activeTab === 'tickets' ? 'bg-white/20 text-white' : 'bg-surface-200 dark:bg-surface-700 text-surface-800 dark:text-surface-200'">
            {{ filteredTickets.length }}
          </span>
        </button>

        <button
          type="button"
          (click)="activeTab = 'passports'"
          [ngClass]="activeTab === 'passports' 
            ? 'bg-orange-500 text-white shadow-sm font-bold' 
            : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 font-medium'"
          class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all whitespace-nowrap"
        >
          <i class="pi pi-id-card text-base"></i>
          <span>3. Digital Bicycle Passports</span>
          <span class="px-2 py-0.5 rounded-full text-xs" [ngClass]="activeTab === 'passports' ? 'bg-white/20 text-white' : 'bg-surface-200 dark:bg-surface-700 text-surface-800 dark:text-surface-200'">
            {{ catalogService.passports().length }}
          </span>
        </button>
      </div>

      <!-- ===================================================================== -->
      <!-- TAB 1: 20 SERVICES & 8 DEPARTMENTS CATALOG -->
      <!-- ===================================================================== -->
      <div *ngIf="activeTab === 'catalog'" class="flex flex-col gap-6">
        
        <!-- Department Filters Bar -->
        <div class="card p-4 shadow-sm border border-surface-200 dark:border-surface-700">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-muted-color">Select Workshop Department</span>
              <h3 class="text-base font-bold text-surface-900 dark:text-surface-0">8 Modular Service Departments</h3>
            </div>

            <!-- Search in Catalog -->
            <div class="relative w-full md:w-72">
              <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-color"></i>
              <input
                pInputText
                type="text"
                [(ngModel)]="catalogSearchQuery"
                placeholder="Search services, SOPs, codes..."
                class="w-full pl-9 text-sm"
              />
            </div>
          </div>

          <div class="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              type="button"
              (click)="selectedDepartment = 'All'"
              [ngClass]="selectedDepartment === 'All' ? 'bg-surface-900 dark:bg-surface-0 text-white dark:text-surface-900 font-bold' : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200'"
              class="px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-all whitespace-nowrap"
            >
              <span>All Departments</span>
              <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">20</span>
            </button>

            <button
              *ngFor="let dept of catalogService.departments"
              type="button"
              (click)="selectedDepartment = dept.name"
              [ngClass]="selectedDepartment === dept.name ? 'bg-orange-500 text-white font-bold' : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200'"
              class="px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-all whitespace-nowrap"
            >
              <i [class]="dept.icon" class="text-xs"></i>
              <span>{{ dept.name }}</span>
            </button>
          </div>

          <!-- Bike Type Filter Pills -->
          <div class="flex items-center gap-2 mt-3 pt-3 border-t border-surface-200 dark:border-surface-700 overflow-x-auto">
            <span class="text-xs text-muted-color font-semibold uppercase mr-1">Bike Filter:</span>
            <button
              *ngFor="let bType of bikeTypeFilterOptions"
              type="button"
              (click)="selectedBikeTypeFilter = bType"
              [ngClass]="selectedBikeTypeFilter === bType ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 font-bold' : 'border-surface-300 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-surface-400'"
              class="border px-2.5 py-1 rounded-md text-xs transition-all whitespace-nowrap"
            >
              {{ bType }}
            </button>
          </div>
        </div>

        <!-- Dynamic Cost & Time Estimator Banner -->
        <div class="bg-surface-0 dark:bg-surface-900 border border-orange-500/30 rounded-xl p-5 shadow-sm">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/80 flex items-center justify-center text-orange-600 dark:text-orange-400 text-xl font-bold">
                ⚡
              </div>
              <div>
                <h4 class="font-bold text-surface-900 dark:text-surface-0 text-base">Quick Service Estimator & Calculator</h4>
                <p class="text-xs text-muted-color">Dynamic quotation based on bike discipline and mobile doorstep dispatch.</p>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <p-select
                [options]="catalogService.services()"
                [(ngModel)]="estimatorServiceId"
                optionLabel="name"
                optionValue="id"
                placeholder="Select Service"
                styleClass="w-64 text-xs"
              ></p-select>

              <p-select
                [options]="['Road', 'Mountain', 'Gravel', 'Electric', 'Hybrid', 'BMX']"
                [(ngModel)]="estimatorBikeType"
                placeholder="Bicycle Type"
                styleClass="w-36 text-xs"
              ></p-select>

              <div class="flex items-center gap-2 bg-surface-100 dark:bg-surface-800 px-3 py-1.5 rounded-lg">
                <span class="text-xs font-semibold text-surface-700 dark:text-surface-300">Doorstep Van:</span>
                <p-toggleswitch [(ngModel)]="estimatorDoorstep"></p-toggleswitch>
              </div>

              <div class="bg-orange-500 text-white px-4 py-2 rounded-lg text-right flex items-center gap-3">
                <div>
                  <div class="text-[10px] uppercase font-bold text-orange-200">Estimated Total</div>
                  <div class="text-base font-extrabold">₹ {{ getCalculatedEstimate().total }}</div>
                </div>
                <div class="border-l border-white/20 pl-3">
                  <div class="text-[10px] uppercase font-bold text-orange-200">Duration</div>
                  <div class="text-sm font-semibold">{{ getCalculatedEstimate().durationMinutes }} mins</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 20 Service Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div
            *ngFor="let s of filteredCatalogServices"
            class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5 shadow-sm hover:shadow-md hover:border-orange-500/50 transition-all flex flex-col justify-between"
          >
            <div>
              <!-- Category Header & Badges -->
              <div class="flex items-start justify-between gap-2 mb-3">
                <div class="flex items-center gap-2">
                  <span class="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold text-xs flex items-center justify-center font-mono">
                    #{{ s.categoryNumber }}
                  </span>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300">
                    {{ s.department }}
                  </span>
                </div>

                <span
                  *ngIf="s.isSignature"
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-tight"
                >
                  ⭐ {{ s.signatureBadge }}
                </span>
              </div>

              <!-- Service Title & Tagline -->
              <h3 class="text-lg font-bold text-surface-900 dark:text-surface-0 flex items-center gap-2">
                <i [class]="s.icon" class="text-orange-500 text-base"></i>
                {{ s.name }}
              </h3>
              <div class="text-xs font-mono text-muted-color mb-2">Code: {{ s.code }}</div>
              
              <p class="text-xs text-surface-600 dark:text-surface-300 mb-4 line-clamp-2">
                {{ s.tagline }}
              </p>

              <!-- Benefits List -->
              <div class="space-y-1.5 mb-4 bg-surface-50 dark:bg-surface-800/60 p-3 rounded-lg">
                <div class="text-[11px] font-bold text-muted-color uppercase mb-1">Key Highlights:</div>
                <div *ngFor="let benefit of s.includedBenefits" class="flex items-center gap-2 text-xs text-surface-700 dark:text-surface-200">
                  <i class="pi pi-check text-emerald-500 text-[10px]"></i>
                  <span>{{ benefit }}</span>
                </div>
              </div>

              <!-- Compatible Bikes -->
              <div class="flex flex-wrap gap-1 mb-4">
                <span
                  *ngFor="let bType of s.compatibleBikeTypes"
                  class="text-[10px] px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-muted-color font-medium"
                >
                  {{ bType }}
                </span>
              </div>
            </div>

            <!-- Price & Actions Footer -->
            <div class="pt-4 border-t border-surface-200 dark:border-surface-700 flex items-center justify-between gap-3">
              <div>
                <div class="text-xs text-muted-color">Base Labor Price</div>
                <div class="text-lg font-extrabold text-surface-900 dark:text-surface-0">
                  ₹ {{ s.basePrice }}
                  <span class="text-xs font-normal text-muted-color">/ ~{{ s.estimatedMinutes }}m</span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <p-button
                  icon="pi pi-list-check"
                  label="SOP Checklist"
                  size="small"
                  [outlined]="true"
                  severity="secondary"
                  (click)="viewSOP(s)"
                  pTooltip="View technician standard operating procedures"
                ></p-button>
                <p-button
                  icon="pi pi-calendar-plus"
                  label="Book"
                  size="small"
                  (click)="bookService(s)"
                  styleClass="bg-orange-500 hover:bg-orange-600 border-none font-semibold"
                ></p-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- TAB 2: ACTIVE SERVICE ORDERS (TICKETS TABLE) -->
      <!-- ===================================================================== -->
      <div *ngIf="activeTab === 'tickets'" class="flex flex-col gap-6">
        
        <!-- Filters & Search Toolbar -->
        <div class="card p-4 shadow-sm border border-surface-200 dark:border-surface-700">
          <div class="grid grid-cols-12 gap-4 items-end">
            <div class="col-span-12 md:col-span-4">
              <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Search Service / Customer / Bike</label>
              <div class="relative w-full">
                <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-color"></i>
                <input
                  pInputText
                  type="text"
                  [(ngModel)]="searchQuery"
                  placeholder="Search ticket, customer, bike, S/N..."
                  class="w-full pl-9"
                />
              </div>
            </div>

            <div class="col-span-12 sm:col-span-6 md:col-span-3">
              <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Category</label>
              <p-select
                [options]="categoryOptions"
                [(ngModel)]="selectedCategory"
                placeholder="All Categories"
                [showClear]="true"
                styleClass="w-full"
              ></p-select>
            </div>

            <div class="col-span-12 sm:col-span-6 md:col-span-3">
              <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Status</label>
              <p-select
                [options]="statusOptions"
                [(ngModel)]="selectedStatus"
                placeholder="All Statuses"
                [showClear]="true"
                styleClass="w-full"
              ></p-select>
            </div>

            <div class="col-span-12 md:col-span-2 flex gap-2">
              <p-button
                label="Reset"
                icon="pi pi-filter-slash"
                [outlined]="true"
                severity="secondary"
                (click)="resetFilters()"
                styleClass="w-full"
              ></p-button>
            </div>
          </div>
        </div>

        <!-- Tickets Data Table -->
        <div class="card p-0 shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
          <p-table
            [value]="filteredTickets"
            [paginator]="true"
            [rows]="10"
            [rowsPerPageOptions]="[5, 10, 15, 20]"
            [rowHover]="true"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} services"
            responsiveLayout="scroll"
            styleClass="p-datatable-sm"
          >
            <ng-template #header>
              <tr>
                <th pSortableColumn="id" style="min-width: 6.5rem">Ticket ID <p-sortIcon field="id"></p-sortIcon></th>
                <th pSortableColumn="customerName" style="min-width: 10rem">Customer <p-sortIcon field="customerName"></p-sortIcon></th>
                <th pSortableColumn="cycleModel" style="min-width: 11rem">Cycle Model <p-sortIcon field="cycleModel"></p-sortIcon></th>
                <th style="min-width: 9rem">Serial No.</th>
                <th style="min-width: 9rem">Department</th>
                <th pSortableColumn="status" style="min-width: 7.5rem">Status <p-sortIcon field="status"></p-sortIcon></th>
                <th pSortableColumn="priority" style="min-width: 6.5rem">Priority <p-sortIcon field="priority"></p-sortIcon></th>
                <th style="min-width: 9rem">Assignee</th>
                <th style="min-width: 8rem">Est. Cost</th>
                <th pSortableColumn="createdAt" style="min-width: 8rem">Created At <p-sortIcon field="createdAt"></p-sortIcon></th>
                <th *ngIf="authService.isAdmin()" style="min-width: 5rem" class="text-center">Active</th>
                <th style="min-width: 8rem" class="text-center">Actions</th>
              </tr>
            </ng-template>

            <ng-template #body let-ticket>
              <tr [class.opacity-60]="ticket.enabled === false">
                <td>
                  <span class="font-mono text-xs font-bold text-orange-600 dark:text-orange-400 cursor-pointer hover:underline" (click)="viewTicket(ticket)">
                    {{ ticket.id }}
                  </span>
                </td>
                <td>
                  <div class="font-semibold text-surface-900 dark:text-surface-0 text-sm">{{ ticket.customerName }}</div>
                  <div class="text-[11px] text-muted-color">{{ ticket.contactPhone }}</div>
                </td>
                <td>
                  <div class="text-sm font-medium text-surface-800 dark:text-surface-100">{{ ticket.cycleModel }}</div>
                  <div class="text-[11px] text-muted-color">ID: {{ ticket.cycleId }}</div>
                </td>
                <td>
                  <span class="font-mono text-xs bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded text-surface-700 dark:text-surface-300">
                    {{ ticket.serialNumber }}
                  </span>
                </td>
                <td>
                  <span class="text-xs px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300">
                    {{ ticket.department || ticket.category || 'General' }}
                  </span>
                </td>
                <td>
                  <p-tag
                    [value]="ticket.status"
                    [severity]="getStatusSeverity(ticket.status)"
                    [rounded]="true"
                    styleClass="text-xs"
                  ></p-tag>
                </td>
                <td>
                  <p-tag
                    [value]="ticket.priority"
                    [severity]="getPrioritySeverity(ticket.priority)"
                    [rounded]="true"
                    styleClass="text-xs"
                  ></p-tag>
                </td>
                <td>
                  <span class="text-xs font-medium text-surface-700 dark:text-surface-200">
                    {{ ticket.assigneeName || 'Unassigned' }}
                  </span>
                </td>
                <td>
                  <span class="font-mono text-xs font-bold text-surface-900 dark:text-surface-0">
                    ₹ {{ ticket.estimatedCost || 0 }}
                  </span>
                </td>
                <td>
                  <span class="text-xs text-muted-color">{{ ticket.createdAt | slice:0:10 }}</span>
                </td>
                <td *ngIf="authService.isAdmin()" class="text-center">
                  <p-toggleswitch
                    [(ngModel)]="ticket.enabled"
                    (onChange)="confirmToggleEnabled(ticket)"
                  ></p-toggleswitch>
                </td>
                <td class="text-center">
                  <div class="flex items-center justify-center gap-1">
                    <button
                      pButton
                      icon="pi pi-eye"
                      [rounded]="true"
                      [text]="true"
                      severity="secondary"
                      size="small"
                      pTooltip="View Details & Checklist"
                      (click)="viewTicket(ticket)"
                    ></button>
                    <button
                      *ngIf="authService.isAdmin()"
                      pButton
                      icon="pi pi-pencil"
                      [rounded]="true"
                      [text]="true"
                      severity="info"
                      size="small"
                      pTooltip="Edit Ticket"
                      (click)="openEditDialog(ticket)"
                    ></button>
                    <button
                      *ngIf="authService.isAdmin()"
                      pButton
                      icon="pi pi-trash"
                      [rounded]="true"
                      [text]="true"
                      severity="danger"
                      size="small"
                      pTooltip="Delete Ticket"
                      (click)="confirmDelete(ticket)"
                    ></button>
                  </div>
                </td>
              </tr>
            </ng-template>

            <ng-template #emptymessage>
              <tr>
                <td colspan="12" class="text-center py-8 text-muted-color">
                  <div class="flex flex-col items-center gap-2">
                    <i class="pi pi-inbox text-4xl text-surface-400"></i>
                    <p class="text-sm">No service orders found matching criteria.</p>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- TAB 3: DIGITAL BICYCLE PASSPORT & HEALTH DIAGNOSTIC -->
      <!-- ===================================================================== -->
      <div *ngIf="activeTab === 'passports'" class="flex flex-col gap-6">
        
        <!-- Passport Intro & Header -->
        <div class="bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 uppercase">
                🛡️ Car-Style Lifetime Service Record
              </span>
            </div>
            <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 mt-1">FREEWHEEL FACTORY Digital Bicycle Passport</h2>
            <p class="text-xs text-muted-color">Tracks component wear, structural integrity, torque verification, and pre-owned vehicle resale valuation.</p>
          </div>

          <p-button
            label="Perform Health Audit"
            icon="pi pi-plus"
            (click)="openHealthAuditDialog()"
            styleClass="bg-cyan-600 hover:bg-cyan-700 border-none font-semibold text-white"
          ></p-button>
        </div>

        <!-- Digital Passport Cards Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            *ngFor="let p of catalogService.passports()"
            class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
          >
            <!-- Card Header -->
            <div class="bg-gradient-to-r from-surface-900 to-surface-800 p-4 text-white flex items-center justify-between">
              <div>
                <div class="text-[10px] uppercase font-mono tracking-widest text-cyan-400">PASSPORT ID: {{ p.id }}</div>
                <h3 class="text-base font-bold text-white mt-0.5">{{ p.brand }} {{ p.model }}</h3>
                <div class="text-xs text-surface-300 font-mono">S/N: {{ p.serialNumber }}</div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-extrabold text-cyan-400">{{ p.overallHealthScore }}%</div>
                <div class="text-[10px] text-surface-300 uppercase">Health Score</div>
              </div>
            </div>

            <!-- Card Body -->
            <div class="p-4 space-y-3">
              <div class="flex items-center justify-between text-xs pb-2 border-b border-surface-100 dark:border-surface-800">
                <span class="text-muted-color">Owner:</span>
                <span class="font-semibold text-surface-900 dark:text-surface-0">{{ p.ownerName }} ({{ p.ownerPhone }})</span>
              </div>

              <div class="flex items-center justify-between text-xs pb-2 border-b border-surface-100 dark:border-surface-800">
                <span class="text-muted-color">Race Ready Status:</span>
                <span
                  class="font-bold px-2 py-0.5 rounded text-[11px]"
                  [ngClass]="p.raceReadyStatus === 'PASS' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600'"
                >
                  {{ p.raceReadyStatus }}
                </span>
              </div>

              <!-- Component Health Items Matrix -->
              <div>
                <div class="text-[11px] font-bold text-muted-color uppercase mb-2">Component Health Matrix:</div>
                <div class="space-y-1.5">
                  <div
                    *ngFor="let item of p.inspectionItems"
                    class="flex items-center justify-between text-xs p-2 rounded bg-surface-50 dark:bg-surface-800/60"
                  >
                    <div class="flex items-center gap-2">
                      <span
                        class="w-2.5 h-2.5 rounded-full"
                        [ngClass]="item.status === 'GOOD' ? 'bg-emerald-500' : (item.status === 'ATTENTION_REQUIRED' ? 'bg-amber-500' : 'bg-red-500')"
                      ></span>
                      <span class="font-medium text-surface-800 dark:text-surface-100">{{ item.componentName }}</span>
                    </div>
                    <span class="text-[11px] text-muted-color font-mono">{{ item.measuredWear || 'Inspected' }}</span>
                  </div>
                </div>
              </div>

              <div class="text-xs text-muted-color italic bg-surface-50 dark:bg-surface-800 p-2.5 rounded">
                "{{ p.notes }}"
              </div>
            </div>

            <!-- Card Footer -->
            <div class="p-3 bg-surface-50 dark:bg-surface-800/40 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between">
              <span class="text-[11px] text-muted-color">Audited by: {{ p.inspectorName }}</span>
              <p-button
                label="View Passport"
                icon="pi pi-id-card"
                size="small"
                [outlined]="true"
                (click)="viewPassport(p)"
              ></p-button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ===================================================================== -->
    <!-- SOP CHECKLIST DRAWER / DIALOG -->
    <!-- ===================================================================== -->
    <p-drawer
      [(visible)]="sopDrawerVisible"
      position="right"
      [style]="{ width: '450px' }"
      [modal]="true"
    >
      <ng-template #header>
        <div *ngIf="selectedCatalogService" class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center">
            <i [class]="selectedCatalogService.icon" class="text-lg"></i>
          </div>
          <div>
            <div class="text-xs uppercase font-bold text-orange-600">SOP Protocol — #{{ selectedCatalogService.categoryNumber }}</div>
            <h3 class="text-base font-bold text-surface-900 dark:text-surface-0">{{ selectedCatalogService.name }}</h3>
          </div>
        </div>
      </ng-template>

      <div *ngIf="selectedCatalogService" class="space-y-4 py-2">
        <div class="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
          <div class="text-xs text-muted-color font-medium">Department</div>
          <div class="text-sm font-semibold text-surface-900 dark:text-surface-0">{{ selectedCatalogService.department }}</div>
          <div class="text-xs text-muted-color mt-1">Standard Duration: ~{{ selectedCatalogService.estimatedMinutes }} mins | Base Labor: ₹ {{ selectedCatalogService.basePrice }}</div>
        </div>

        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-muted-color mb-2">Step-by-Step SOP Checklist:</h4>
          <div class="space-y-2">
            <div
              *ngFor="let step of selectedCatalogService.sopChecklist; let i = index"
              class="flex items-start gap-3 p-3 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900"
            >
              <span class="w-5 h-5 rounded-full bg-orange-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                {{ i + 1 }}
              </span>
              <span class="text-xs text-surface-700 dark:text-surface-200 leading-relaxed font-medium">
                {{ step }}
              </span>
            </div>
          </div>
        </div>

        <div class="pt-4">
          <p-button
            label="Create Ticket with this Service"
            icon="pi pi-plus"
            styleClass="w-full bg-orange-500 hover:bg-orange-600 border-none font-semibold"
            (click)="bookService(selectedCatalogService)"
          ></p-button>
        </div>
      </div>
    </p-drawer>

    <!-- ===================================================================== -->
    <!-- SERVICE TICKET DETAIL DRAWER -->
    <!-- ===================================================================== -->
    <p-drawer
      [(visible)]="drawerVisible"
      position="right"
      [style]="{ width: '480px' }"
      [modal]="true"
    >
      <ng-template #header>
        <div *ngIf="selectedTicket">
          <div class="text-xs text-muted-color font-mono uppercase">Ticket Details</div>
          <h3 class="text-lg font-bold text-surface-900 dark:text-surface-0 flex items-center gap-2">
            <span>{{ selectedTicket.id }}</span>
            <p-tag [value]="selectedTicket.status" [severity]="getStatusSeverity(selectedTicket.status)" [rounded]="true"></p-tag>
          </h3>
        </div>
      </ng-template>

      <div *ngIf="selectedTicket" class="space-y-5 py-2">
        <div class="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 space-y-2">
          <div class="text-xs font-bold uppercase text-muted-color">Customer & Bicycle</div>
          <div class="text-sm font-semibold text-surface-900 dark:text-surface-0">{{ selectedTicket.customerName }}</div>
          <div class="text-xs text-muted-color">Phone: {{ selectedTicket.contactPhone }} | Email: {{ selectedTicket.contactEmail }}</div>
          <div class="text-xs text-muted-color">Company: {{ selectedTicket.companyName || '—' }}</div>
          <div class="pt-2 border-t border-surface-200 dark:border-surface-700 text-xs">
            <span class="font-semibold text-surface-800 dark:text-surface-100">Bicycle:</span> {{ selectedTicket.cycleModel }} (S/N: {{ selectedTicket.serialNumber }})
          </div>
        </div>

        <div class="space-y-2">
          <div class="text-xs font-bold uppercase text-muted-color">Service Description</div>
          <p class="text-sm text-surface-700 dark:text-surface-300 bg-surface-50 dark:bg-surface-800 p-3 rounded-lg leading-relaxed">
            {{ selectedTicket.description }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
            <span class="text-muted-color">Assigned Technician:</span>
            <div class="font-semibold text-surface-900 dark:text-surface-0 mt-0.5">{{ selectedTicket.assigneeName || 'Unassigned' }}</div>
          </div>
          <div class="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
            <span class="text-muted-color">Estimated Cost:</span>
            <div class="font-semibold text-surface-900 dark:text-surface-0 mt-0.5">₹ {{ selectedTicket.estimatedCost || 0 }}</div>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-4">
          <p-button
            label="Edit Ticket"
            icon="pi pi-pencil"
            size="small"
            styleClass="w-full"
            (click)="openEditDialog(selectedTicket); drawerVisible = false"
          ></p-button>
        </div>
      </div>
    </p-drawer>

    <!-- ===================================================================== -->
    <!-- EDIT TICKET DIALOG -->
    <!-- ===================================================================== -->
    <p-dialog
      [(visible)]="editDialogVisible"
      header="Edit Service Ticket"
      [modal]="true"
      [style]="{ width: '480px' }"
      [closable]="true"
    >
      <div *ngIf="editingTicket" class="space-y-4 pt-2">
        <div>
          <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Status</label>
          <p-select
            [options]="statusOptions"
            [(ngModel)]="editingTicket.status"
            optionLabel="label"
            optionValue="value"
            styleClass="w-full"
          ></p-select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Priority</label>
          <p-select
            [options]="priorityOptions"
            [(ngModel)]="editingTicket.priority"
            optionLabel="label"
            optionValue="value"
            styleClass="w-full"
          ></p-select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Assignee Technician</label>
          <p-select
            [options]="technicianOptions"
            [(ngModel)]="editingTicket.assigneeId"
            optionLabel="name"
            optionValue="id"
            placeholder="Select Technician"
            styleClass="w-full"
          ></p-select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Estimated Cost (₹)</label>
          <input
            pInputText
            type="number"
            [(ngModel)]="editingTicket.estimatedCost"
            class="w-full"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Description / Work Notes</label>
          <textarea
            pInputText
            [(ngModel)]="editingTicket.description"
            rows="3"
            class="w-full"
          ></textarea>
        </div>
      </div>

      <ng-template #footer>
        <p-button
          label="Cancel"
          icon="pi pi-times"
          [text]="true"
          (click)="editDialogVisible = false"
        ></p-button>
        <p-button
          label="Save Changes"
          icon="pi pi-check"
          (click)="saveEditedTicket()"
          styleClass="bg-orange-500 hover:bg-orange-600 border-none font-semibold"
        ></p-button>
      </ng-template>
    </p-dialog>

    <!-- ===================================================================== -->
    <!-- NEW HEALTH AUDIT DIALOG -->
    <!-- ===================================================================== -->
    <p-dialog
      [(visible)]="healthAuditDialogVisible"
      header="Bicycle Health Audit & Passport Generator"
      [modal]="true"
      [style]="{ width: '600px' }"
    >
      <div class="space-y-4 pt-2">
        <div class="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg text-xs text-muted-color">
          Assign 🟢 GOOD, 🟡 ATTENTION REQUIRED, or 🔴 REPLACE/REPAIR for key components to calculate the health score and issue a persistent Digital Passport.
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Customer Name</label>
            <input pInputText [(ngModel)]="newAuditOwnerName" placeholder="e.g. Samantha Reed" class="w-full text-xs" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Bicycle Model</label>
            <input pInputText [(ngModel)]="newAuditBikeModel" placeholder="e.g. Cannondale Topstone" class="w-full text-xs" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Serial Number</label>
            <input pInputText [(ngModel)]="newAuditSerial" placeholder="e.g. CM219084A09" class="w-full text-xs" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1">Bicycle Type</label>
            <p-select
              [options]="['Road', 'Mountain', 'Gravel', 'Electric', 'Hybrid', 'BMX']"
              [(ngModel)]="newAuditBikeType"
              styleClass="w-full text-xs"
            ></p-select>
          </div>
        </div>

        <div class="border-t border-surface-200 dark:border-surface-700 pt-3 space-y-3">
          <div class="text-xs font-bold uppercase text-muted-color">Audit Component Status:</div>

          <div *ngFor="let item of auditItems" class="flex items-center justify-between p-2 rounded-lg bg-surface-50 dark:bg-surface-800">
            <span class="text-xs font-semibold text-surface-800 dark:text-surface-100">{{ item.componentName }}</span>
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                (click)="item.status = 'GOOD'"
                [ngClass]="item.status === 'GOOD' ? 'bg-emerald-500 text-white font-bold' : 'bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300'"
                class="px-2 py-1 rounded text-[11px] transition-all"
              >
                🟢 Good
              </button>
              <button
                type="button"
                (click)="item.status = 'ATTENTION_REQUIRED'"
                [ngClass]="item.status === 'ATTENTION_REQUIRED' ? 'bg-amber-500 text-white font-bold' : 'bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300'"
                class="px-2 py-1 rounded text-[11px] transition-all"
              >
                🟡 Attention
              </button>
              <button
                type="button"
                (click)="item.status = 'REPLACE_OR_REPAIR'"
                [ngClass]="item.status === 'REPLACE_OR_REPAIR' ? 'bg-red-500 text-white font-bold' : 'bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300'"
                class="px-2 py-1 rounded text-[11px] transition-all"
              >
                🔴 Replace
              </button>
            </div>
          </div>
        </div>
      </div>

      <ng-template #footer>
        <p-button label="Cancel" [text]="true" (click)="healthAuditDialogVisible = false"></p-button>
        <p-button label="Generate Passport" icon="pi pi-check" (click)="saveHealthAudit()" styleClass="bg-cyan-600 hover:bg-cyan-700 border-none font-semibold text-white"></p-button>
      </ng-template>
    </p-dialog>
  `
})
export class ServicesListComponent implements OnInit {
  dataService = inject(CycleDataService);
  catalogService = inject(FreewheelCatalogService);
  authService = inject(AuthService);
  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);
  router = inject(Router);

  // Active Main View Tab: 'catalog' | 'tickets' | 'passports'
  activeTab: 'catalog' | 'tickets' | 'passports' = 'catalog';

  // Catalog State
  selectedDepartment: ServiceDepartment | 'All' = 'All';
  selectedBikeTypeFilter: string = 'All';
  catalogSearchQuery: string = '';
  selectedCatalogService: ServiceCatalogItem | null = null;
  sopDrawerVisible: boolean = false;

  // Estimator Widget State
  estimatorServiceId: string = 'FWF-02';
  estimatorBikeType: BicycleType = 'Road';
  estimatorDoorstep: boolean = false;

  bikeTypeFilterOptions: string[] = ['All', 'Road', 'Mountain', 'Gravel', 'Electric', 'Hybrid', 'BMX'];

  // Tickets Table State
  searchQuery: string = '';
  selectedCategory: string | null = null;
  selectedStatus: string | null = null;

  selectedTicket: ServiceTicket | null = null;
  drawerVisible = false;

  editingTicket: ServiceTicket | null = null;
  editDialogVisible = false;

  // Health Audit Dialog State
  healthAuditDialogVisible: boolean = false;
  newAuditOwnerName: string = '';
  newAuditBikeModel: string = '';
  newAuditSerial: string = '';
  newAuditBikeType: BicycleType = 'Road';
  auditItems: ComponentHealthItem[] = [
    { componentName: 'Frame & Fork Integrity', category: 'Frame', status: 'GOOD' },
    { componentName: 'Wheels & Spoke Tension', category: 'Wheels', status: 'GOOD' },
    { componentName: 'Drivetrain & Chain Elongation', category: 'Drivetrain', status: 'GOOD' },
    { componentName: 'Brake Pads & Hydraulic Fluid', category: 'Brakes', status: 'GOOD' },
    { componentName: 'Bearings (BB, Headset, Hubs)', category: 'Bearings', status: 'GOOD' }
  ];

  categoryOptions = [
    { label: 'Bike Service', value: 'Bike Service' },
    { label: 'Performance & Race', value: 'Performance & Race' },
    { label: 'Bike Fit & Ergonomics', value: 'Bike Fit & Ergonomics' },
    { label: 'Suspension Lab', value: 'Suspension Lab' },
    { label: 'Wheels & Tyres', value: 'Wheels & Tyres' },
    { label: 'Components & Drivetrain', value: 'Components & Drivetrain' },
    { label: 'Mobile & Event Support', value: 'Mobile & Event Support' },
    { label: 'Inspection & Digital', value: 'Inspection & Digital' }
  ];

  statusOptions = [
    { label: 'Waiting', value: 'Waiting' },
    { label: 'Assigned', value: 'Assigned' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' }
  ];

  priorityOptions = [
    { label: 'Low', value: 'Low' },
    { label: 'Medium', value: 'Medium' },
    { label: 'High', value: 'High' },
    { label: 'Urgent', value: 'Urgent' }
  ];

  technicianOptions = [
    { id: 'TECH-001', name: 'Alex Rivera' },
    { id: 'TECH-002', name: 'David Chen' },
    { id: 'TECH-003', name: 'Sara Jenkins' },
    { id: 'TECH-004', name: 'Michael Scott' }
  ];

  ngOnInit(): void {}

  // Filtered Services for Catalog Tab
  get filteredCatalogServices(): ServiceCatalogItem[] {
    return this.catalogService.services().filter(s => {
      const matchesDept = this.selectedDepartment === 'All' || s.department === this.selectedDepartment;
      const matchesBike = this.selectedBikeTypeFilter === 'All' || s.compatibleBikeTypes.includes(this.selectedBikeTypeFilter as BicycleType);
      const matchesSearch = !this.catalogSearchQuery ||
        s.name.toLowerCase().includes(this.catalogSearchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(this.catalogSearchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(this.catalogSearchQuery.toLowerCase());

      return matchesDept && matchesBike && matchesSearch;
    });
  }

  // Filtered Tickets for Tickets Tab
  get filteredTickets(): ServiceTicket[] {
    return this.dataService.tickets().filter(ticket => {
      const matchesSearch = !this.searchQuery ||
        ticket.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        ticket.customerName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        ticket.cycleModel.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        ticket.serialNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (ticket.companyName && ticket.companyName.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesCategory = !this.selectedCategory || ticket.category === this.selectedCategory || ticket.department === this.selectedCategory;
      const matchesStatus = !this.selectedStatus || ticket.status === this.selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  getCalculatedEstimate() {
    return this.catalogService.calculateQuote(
      this.estimatorServiceId,
      this.estimatorBikeType,
      this.estimatorDoorstep
    );
  }

  viewSOP(service: ServiceCatalogItem): void {
    this.selectedCatalogService = service;
    this.sopDrawerVisible = true;
  }

  bookService(service: ServiceCatalogItem): void {
    this.sopDrawerVisible = false;
    this.router.navigate(['/services/new'], {
      queryParams: {
        serviceId: service.id,
        category: service.department,
        price: service.basePrice,
        code: service.code
      }
    });
  }

  viewPassport(p: DigitalBicyclePassport): void {
    this.messageService.add({
      severity: 'info',
      summary: `Passport #${p.id}`,
      detail: `${p.brand} ${p.model} — Overall Health Score: ${p.overallHealthScore}%`
    });
  }

  openHealthAuditDialog(): void {
    this.newAuditOwnerName = '';
    this.newAuditBikeModel = '';
    this.newAuditSerial = '';
    this.newAuditBikeType = 'Road';
    this.auditItems = [
      { componentName: 'Frame & Fork Integrity', category: 'Frame', status: 'GOOD', measuredWear: '0% wear' },
      { componentName: 'Wheels & Spoke Tension', category: 'Wheels', status: 'GOOD', measuredWear: '<0.2mm lateral' },
      { componentName: 'Drivetrain & Chain Stretch', category: 'Drivetrain', status: 'GOOD', measuredWear: '0.25% elongation' },
      { componentName: 'Brakes & Hydraulic Seals', category: 'Brakes', status: 'GOOD', measuredWear: '75% pad life' },
      { componentName: 'Bearings (BB, Headset, Hubs)', category: 'Bearings', status: 'GOOD', measuredWear: 'Smooth play-free' }
    ];
    this.healthAuditDialogVisible = true;
  }

  saveHealthAudit(): void {
    if (!this.newAuditOwnerName || !this.newAuditBikeModel || !this.newAuditSerial) {
      this.messageService.add({
        severity: 'error',
        summary: 'Missing Information',
        detail: 'Please fill in customer name, bicycle model, and serial number.'
      });
      return;
    }

    // Calculate score based on statuses
    let score = 100;
    let hasReplace = false;
    let hasAttention = false;

    for (const item of this.auditItems) {
      if (item.status === 'REPLACE_OR_REPAIR') {
        score -= 25;
        hasReplace = true;
      } else if (item.status === 'ATTENTION_REQUIRED') {
        score -= 10;
        hasAttention = true;
      }
    }
    score = Math.max(0, score);

    const raceReadyStatus = hasReplace ? 'FAIL' : (hasAttention ? 'CONDITIONAL' : 'PASS');
    const newPassport: DigitalBicyclePassport = {
      id: `PASSPORT-${Math.floor(1000 + Math.random() * 9000)}`,
      bikeId: `BIKE-${Math.floor(100 + Math.random() * 900)}`,
      serialNumber: this.newAuditSerial,
      frameNumber: `FRM-${this.newAuditSerial}`,
      brand: this.newAuditBikeModel.split(' ')[0] || 'Custom',
      model: this.newAuditBikeModel,
      bikeType: this.newAuditBikeType,
      ownerName: this.newAuditOwnerName,
      ownerPhone: '+1 (555) 000-0000',
      overallHealthScore: score,
      raceReadyStatus,
      lastInspectionDate: new Date().toISOString().slice(0, 10),
      inspectorName: 'Alex Rivera (Master Tech)',
      verifiedTorqueSpecs: true,
      ultrasonicDrivetrainCertified: true,
      notes: `Health audit completed on ${new Date().toISOString().slice(0, 10)}. Overall Score: ${score}%.`,
      inspectionItems: [...this.auditItems]
    };

    this.catalogService.savePassport(newPassport);
    this.healthAuditDialogVisible = false;
    this.activeTab = 'passports';

    this.messageService.add({
      severity: 'success',
      summary: 'Digital Passport Issued',
      detail: `Generated Passport ${newPassport.id} with ${score}% Health Score.`
    });
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = null;
    this.selectedStatus = null;
  }

  getStatusSeverity(status: TicketStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'warn';
      case 'Assigned': return 'info';
      case 'Waiting': return 'secondary';
      case 'Cancelled': return 'danger';
      default: return 'info';
    }
  }

  getPrioritySeverity(priority: TicketPriority): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (priority) {
      case 'Urgent': return 'danger';
      case 'High': return 'warn';
      case 'Medium': return 'info';
      case 'Low': return 'secondary';
      default: return 'info';
    }
  }

  viewTicket(ticket: ServiceTicket): void {
    this.selectedTicket = ticket;
    this.drawerVisible = true;
  }

  openEditDialog(ticket: ServiceTicket): void {
    this.editingTicket = { ...ticket };
    this.editDialogVisible = true;
  }

  saveEditedTicket(): void {
    if (this.editingTicket) {
      const tech = this.technicianOptions.find(t => t.id === this.editingTicket!.assigneeId);
      if (tech) {
        this.editingTicket.assigneeName = tech.name;
      }
      this.dataService.updateTicket(this.editingTicket.id, this.editingTicket);
      this.editDialogVisible = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Service Updated',
        detail: `Ticket ${this.editingTicket.id} updated successfully.`
      });
    }
  }

  confirmToggleEnabled(ticket: ServiceTicket): void {
    const action = ticket.enabled ? 'enable' : 'disable';
    this.messageService.add({
      severity: ticket.enabled ? 'info' : 'warn',
      summary: `Ticket ${ticket.enabled ? 'Enabled' : 'Disabled'}`,
      detail: `Ticket ${ticket.id} has been ${action}d.`
    });
  }

  confirmDelete(ticket: ServiceTicket): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete service ticket "${ticket.id}" for ${ticket.customerName}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.dataService.deleteTicket(ticket.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: `Ticket ${ticket.id} deleted.`
        });
      }
    });
  }
}
