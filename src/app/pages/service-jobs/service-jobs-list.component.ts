import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { CycleDataService } from '../../services/cycle-data.service';
import { ServiceJob, TicketStatus } from '../../models/cycle-management.models';

@Component({
  selector: 'app-service-jobs-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    ProgressBarModule,
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
            <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">Service Jobs</h1>
            <span class="text-xs px-2.5 py-1 rounded-full font-semibold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
              {{ dataService.serviceJobs().length }} Active Workshop Jobs
            </span>
          </div>
          <p class="text-sm text-muted-color mt-1">Workshop execution queue, labor tracking, technician allocations and QA.</p>
        </div>
      </div>

      <!-- Quick Metrics Ribbon -->
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-6 sm:col-span-3">
          <div class="card p-3 mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <div>
              <span class="text-xs text-muted-color uppercase font-semibold">Waiting</span>
              <div class="text-xl font-bold text-surface-900 dark:text-surface-0">{{ getCountByStatus('Waiting') }}</div>
            </div>
            <div class="w-8 h-8 rounded bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-600 dark:text-surface-300">
              <i class="pi pi-hourglass"></i>
            </div>
          </div>
        </div>

        <div class="col-span-6 sm:col-span-3">
          <div class="card p-3 mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <div>
              <span class="text-xs text-muted-color uppercase font-semibold">In Progress</span>
              <div class="text-xl font-bold text-amber-600 dark:text-amber-400">{{ getCountByStatus('In Progress') }}</div>
            </div>
            <div class="w-8 h-8 rounded bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
              <i class="pi pi-cog pi-spin"></i>
            </div>
          </div>
        </div>

        <div class="col-span-6 sm:col-span-3">
          <div class="card p-3 mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <div>
              <span class="text-xs text-muted-color uppercase font-semibold">Assigned</span>
              <div class="text-xl font-bold text-blue-600 dark:text-blue-400">{{ getCountByStatus('Assigned') }}</div>
            </div>
            <div class="w-8 h-8 rounded bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
              <i class="pi pi-user-check"></i>
            </div>
          </div>
        </div>

        <div class="col-span-6 sm:col-span-3">
          <div class="card p-3 mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <div>
              <span class="text-xs text-muted-color uppercase font-semibold">Completed</span>
              <div class="text-xl font-bold text-emerald-600 dark:text-emerald-400">{{ getCountByStatus('Completed') }}</div>
            </div>
            <div class="w-8 h-8 rounded bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
              <i class="pi pi-check"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters & Toolbar -->
      <div class="card p-4 shadow-sm border border-surface-200 dark:border-surface-700">
        <div class="grid grid-cols-12 gap-4 items-end">
          <div class="col-span-12 sm:col-span-6 md:col-span-4">
            <label class="block text-xs font-semibold text-muted-color uppercase mb-1.5">Search Jobs</label>
            <div class="relative w-full">
              <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-color"></i>
              <input
                pInputText
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Search job ID, bike model, tech..."
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

          <div class="col-span-12 md:col-span-4 flex gap-2">
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

      <!-- Jobs Table -->
      <div class="card p-0 shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
        <p-table
          [value]="filteredJobs"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[10, 20, 50]"
          [rowHover]="true"
          responsiveLayout="scroll"
          styleClass="p-datatable-sm"
        >
          <ng-template #header>
            <tr>
              <th style="min-width: 6.5rem">Job ID</th>
              <th style="min-width: 11rem">Customer</th>
              <th style="min-width: 12rem">Bicycle</th>
              <th style="min-width: 13rem">Service Task</th>
              <th style="min-width: 9.5rem">Technician</th>
              <th style="min-width: 10rem">Progress</th>
              <th style="min-width: 7.5rem">Cost</th>
              <th style="min-width: 8rem">Status</th>
              <th style="min-width: 8rem" class="text-center">Workflow Action</th>
            </tr>
          </ng-template>

          <ng-template #body let-job>
            <tr>
              <td>
                <span class="font-mono text-xs font-bold text-primary cursor-pointer hover:underline" (click)="viewJob(job)">
                  {{ job.id }}
                </span>
              </td>
              <td>
                <div class="font-semibold text-surface-900 dark:text-surface-0 text-sm">{{ job.customerName }}</div>
                <div class="text-xs text-muted-color">{{ job.customerPhone }}</div>
              </td>
              <td>
                <div class="text-sm font-medium text-surface-800 dark:text-surface-100">{{ job.bicycleModel }}</div>
                <span class="text-[11px] text-muted-color">Type: {{ job.cycleType || 'Road' }}</span>
              </td>
              <td>
                <div class="text-xs font-medium text-surface-800 dark:text-surface-200">{{ job.serviceName }}</div>
                <div class="text-[11px] text-muted-color flex items-center gap-1 mt-0.5">
                  <i class="pi pi-clock text-[9px]"></i> Scheduled: {{ job.scheduledTime }}
                </div>
              </td>
              <td>
                <div class="flex items-center gap-1.5 text-xs text-surface-800 dark:text-surface-200">
                  <i class="pi pi-user text-orange-500 text-[11px]"></i>
                  {{ job.technicianName }}
                </div>
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <div class="flex-1">
                    <p-progressbar [value]="job.progress" [showValue]="false" [style]="{ height: '6px' }"></p-progressbar>
                  </div>
                  <span class="text-xs font-mono font-semibold">{{ job.progress }}%</span>
                </div>
              </td>
              <td>
                <span class="font-bold text-sm text-surface-900 dark:text-surface-0">\${{ job.cost }}</span>
              </td>
              <td>
                <p-tag
                  [value]="job.status"
                  [severity]="getStatusSeverity(job.status)"
                  [rounded]="true"
                  styleClass="text-xs"
                ></p-tag>
              </td>
              <td class="text-center">
                <div class="flex items-center justify-center gap-1">
                  <p-button
                    *ngIf="job.status === 'Waiting'"
                    label="Assign"
                    icon="pi pi-user-plus"
                    size="small"
                    [outlined]="true"
                    severity="info"
                    (click)="advanceStatus(job)"
                  ></p-button>
                  <p-button
                    *ngIf="job.status === 'Assigned'"
                    label="Start"
                    icon="pi pi-play"
                    size="small"
                    severity="warn"
                    (click)="advanceStatus(job)"
                  ></p-button>
                  <p-button
                    *ngIf="job.status === 'In Progress'"
                    label="Complete"
                    icon="pi pi-check"
                    size="small"
                    severity="success"
                    (click)="advanceStatus(job)"
                  ></p-button>
                  <p-button
                    *ngIf="job.status === 'Completed'"
                    icon="pi pi-check-circle"
                    [rounded]="true"
                    [text]="true"
                    severity="success"
                    size="small"
                    pTooltip="Service Completed"
                  ></p-button>
                  <p-button
                    icon="pi pi-eye"
                    [rounded]="true"
                    [text]="true"
                    severity="secondary"
                    size="small"
                    pTooltip="View Job Card"
                    (click)="viewJob(job)"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template #emptymessage>
            <tr>
              <td colspan="9" class="text-center p-8 text-muted-color">
                <i class="pi pi-sliders-h text-4xl mb-3 block text-surface-400"></i>
                No service jobs found matching the criteria.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Job Modal Detail -->
    <p-dialog
      [(visible)]="detailVisible"
      [header]="'Job Card • ' + (selectedJob?.id || '')"
      [modal]="true"
      [style]="{ width: '90vw', maxWidth: '600px' }"
      [draggable]="false"
    >
      <div *ngIf="selectedJob" class="space-y-4 pt-2 text-sm">
        <div class="p-3 bg-surface-50 dark:bg-surface-800/60 rounded-lg flex justify-between items-center">
          <div>
            <div class="font-bold text-surface-900 dark:text-surface-0">{{ selectedJob.customerName }}</div>
            <div class="text-xs text-muted-color">{{ selectedJob.bicycleModel }}</div>
          </div>
          <p-tag [value]="selectedJob.status" [severity]="getStatusSeverity(selectedJob.status)"></p-tag>
        </div>

        <div class="space-y-2">
          <div class="text-xs font-semibold text-muted-color uppercase">Task Details</div>
          <p class="p-3 rounded bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-200 text-xs">
            {{ selectedJob.serviceName }}
          </p>
          <div *ngIf="selectedJob.notes" class="text-xs text-muted-color">
            <strong>Notes:</strong> {{ selectedJob.notes }}
          </div>
        </div>

        <div *ngIf="selectedJob.partsUsed && selectedJob.partsUsed.length > 0">
          <div class="text-xs font-semibold text-muted-color uppercase mb-1">Replaced Parts / Consumables</div>
          <div class="border border-surface-200 dark:border-surface-700 rounded divide-y divide-surface-200 dark:divide-surface-700">
            <div *ngFor="let p of selectedJob.partsUsed" class="p-2 text-xs flex justify-between">
              <span>{{ p.name }} (x{{ p.qty }})</span>
              <span class="font-mono font-bold">\${{ p.price * p.qty }}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center pt-2">
          <div class="text-xs text-muted-color">Scheduled: {{ selectedJob.date }} ({{ selectedJob.scheduledTime }})</div>
          <span class="text-base font-bold text-emerald-600 dark:text-emerald-400">Total: \${{ selectedJob.cost }}</span>
        </div>
      </div>
    </p-dialog>
  `
})
export class ServiceJobsListComponent implements OnInit {
  protected dataService = inject(CycleDataService);
  private messageService = inject(MessageService);

  searchQuery = '';
  selectedStatus: string | null = null;

  detailVisible = false;
  selectedJob: ServiceJob | null = null;

  statusOptions = [
    { label: 'Waiting', value: 'Waiting' },
    { label: 'Assigned', value: 'Assigned' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' }
  ];

  ngOnInit(): void {}

  get filteredJobs(): ServiceJob[] {
    return this.dataService.serviceJobs().filter(job => {
      const matchesSearch = !this.searchQuery ||
        job.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        job.customerName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        job.bicycleModel.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        job.technicianName.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesStatus = !this.selectedStatus || job.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }

  getCountByStatus(status: TicketStatus): number {
    return this.dataService.serviceJobs().filter(j => j.status === status).length;
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

  viewJob(job: ServiceJob): void {
    this.selectedJob = job;
    this.detailVisible = true;
  }

  advanceStatus(job: ServiceJob): void {
    let next: TicketStatus = 'Completed';
    if (job.status === 'Waiting') next = 'Assigned';
    else if (job.status === 'Assigned') next = 'In Progress';
    else if (job.status === 'In Progress') next = 'Completed';

    this.dataService.updateJobStatus(job.id, next);
    job.status = next;
    this.messageService.add({
      severity: 'success',
      summary: 'Job Updated',
      detail: `Job ${job.id} transitioned to "${next}".`
    });
  }
}
