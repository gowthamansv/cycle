import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { CycleDataService } from '../../services/cycle-data.service';
import { ServiceJob, TicketStatus } from '../../models/cycle-management.models';

@Component({
  selector: 'app-service-today-jobs',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TagModule,
    ButtonModule,
    DialogModule,
    ProgressBarModule,
    TooltipModule
  ],
  template: `
    <div class="card p-4 mb-6 shadow-sm border border-surface-200 dark:border-surface-700">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 class="text-lg font-bold text-surface-900 dark:text-surface-0 flex items-center gap-2">
            <i class="pi pi-sliders-h text-orange-500"></i>
            Today's Service Jobs
          </h3>
          <p class="text-xs text-muted-color">Live workshop floor progress & active technician queues</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-200 px-2.5 py-1 rounded-full font-medium">
            {{ dataService.serviceJobs().length }} Total Jobs
          </span>
        </div>
      </div>

      <p-table
        [value]="dataService.serviceJobs()"
        [rowHover]="true"
        [responsiveLayout]="'stack'"
        breakpoint="768px"
        styleClass="p-datatable-sm"
      >
        <ng-template #header>
          <tr>
            <th style="min-width: 6rem">Job ID</th>
            <th style="min-width: 10rem">Customer</th>
            <th style="min-width: 12rem">Bicycle</th>
            <th style="min-width: 13rem">Service</th>
            <th style="min-width: 9rem">Technician</th>
            <th style="min-width: 7rem">Scheduled</th>
            <th style="min-width: 8rem">Status</th>
            <th style="min-width: 6rem" class="text-center">Action</th>
          </tr>
        </ng-template>
        <ng-template #body let-job>
          <tr>
            <td>
              <span class="font-mono text-xs font-semibold text-primary cursor-pointer" (click)="viewJobDetails(job)">
                {{ job.id }}
              </span>
            </td>
            <td>
              <div class="font-medium text-surface-900 dark:text-surface-0 text-sm">{{ job.customerName }}</div>
              <div class="text-xs text-muted-color">{{ job.customerPhone }}</div>
            </td>
            <td>
              <div class="text-sm font-semibold text-surface-800 dark:text-surface-100">{{ job.bicycleModel }}</div>
              <span class="inline-block text-[11px] px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-muted-color">
                {{ job.cycleType || 'Road' }}
              </span>
            </td>
            <td>
              <div class="text-sm text-surface-800 dark:text-surface-100">{{ job.serviceName }}</div>
              <div class="w-28 mt-1">
                <p-progressbar [value]="job.progress" [showValue]="false" [style]="{ height: '4px' }"></p-progressbar>
              </div>
            </td>
            <td>
              <div class="flex items-center gap-1.5 text-xs text-surface-700 dark:text-surface-200">
                <i class="pi pi-user text-muted-color text-[11px]"></i>
                {{ job.technicianName }}
              </div>
            </td>
            <td>
              <span class="text-xs text-surface-600 dark:text-surface-300 font-medium">
                <i class="pi pi-clock text-[10px] mr-1 text-muted-color"></i>{{ job.scheduledTime }}
              </span>
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
                  icon="pi pi-eye"
                  [rounded]="true"
                  [text]="true"
                  severity="secondary"
                  size="small"
                  pTooltip="Inspect Job"
                  tooltipPosition="top"
                  (click)="viewJobDetails(job)"
                ></p-button>
                <p-button
                  *ngIf="job.status !== 'Completed' && job.status !== 'Cancelled'"
                  icon="pi pi-check"
                  [rounded]="true"
                  [text]="true"
                  severity="success"
                  size="small"
                  pTooltip="Advance Status"
                  tooltipPosition="top"
                  (click)="advanceStatus(job)"
                ></p-button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr>
            <td colspan="8" class="text-center p-6 text-muted-color">
              <i class="pi pi-inbox text-3xl mb-2 block"></i>
              No active service jobs scheduled for today.
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Job Detail Modal -->
    <p-dialog
      [(visible)]="jobDialogVisible"
      [header]="'Job Details • ' + (selectedJob?.id || '')"
      [modal]="true"
      [style]="{ width: '90vw', maxWidth: '600px' }"
      [draggable]="false"
      [resizable]="false"
    >
      <div *ngIf="selectedJob" class="space-y-4 text-sm pt-2">
        <div class="grid grid-cols-2 gap-4 p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
          <div>
            <div class="text-xs text-muted-color">Customer</div>
            <div class="font-bold text-surface-900 dark:text-surface-0">{{ selectedJob.customerName }}</div>
            <div class="text-xs text-muted-color">{{ selectedJob.customerPhone }}</div>
          </div>
          <div>
            <div class="text-xs text-muted-color">Bicycle</div>
            <div class="font-bold text-surface-900 dark:text-surface-0">{{ selectedJob.bicycleModel }}</div>
            <div class="text-xs text-muted-color">{{ selectedJob.cycleType || 'Standard' }}</div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div class="p-2.5 rounded border border-surface-200 dark:border-surface-700">
            <div class="text-[11px] text-muted-color uppercase">Technician</div>
            <div class="font-medium text-surface-800 dark:text-surface-100">{{ selectedJob.technicianName }}</div>
          </div>
          <div class="p-2.5 rounded border border-surface-200 dark:border-surface-700">
            <div class="text-[11px] text-muted-color uppercase">Time Slot</div>
            <div class="font-medium text-surface-800 dark:text-surface-100">{{ selectedJob.scheduledTime }}</div>
          </div>
          <div class="p-2.5 rounded border border-surface-200 dark:border-surface-700">
            <div class="text-[11px] text-muted-color uppercase">Total Quote</div>
            <div class="font-bold text-emerald-600 dark:text-emerald-400">\${{ selectedJob.cost }}</div>
          </div>
        </div>

        <div>
          <div class="text-xs font-semibold text-muted-color mb-1">Service Requested & Scope</div>
          <div class="p-3 bg-surface-100 dark:bg-surface-800 rounded text-surface-800 dark:text-surface-200">
            {{ selectedJob.serviceName }}
            <p *ngIf="selectedJob.notes" class="mt-2 text-xs text-muted-color border-t border-surface-200 dark:border-surface-700 pt-1.5">
              <strong>Notes:</strong> {{ selectedJob.notes }}
            </p>
          </div>
        </div>

        <div *ngIf="selectedJob.partsUsed && selectedJob.partsUsed.length > 0">
          <div class="text-xs font-semibold text-muted-color mb-1">Parts Used / Consumables</div>
          <div class="border border-surface-200 dark:border-surface-700 rounded overflow-hidden">
            <div *ngFor="let part of selectedJob.partsUsed" class="flex justify-between p-2 text-xs border-b border-surface-100 dark:border-surface-800 last:border-0">
              <span>{{ part.name }} (x{{ part.qty }})</span>
              <span class="font-mono font-semibold">\${{ part.price * part.qty }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2">
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted-color">Current Status:</span>
            <p-tag [value]="selectedJob.status" [severity]="getStatusSeverity(selectedJob.status)"></p-tag>
          </div>
          <div class="flex gap-2">
            <p-button
              *ngIf="selectedJob.status === 'Waiting'"
              label="Assign & Start"
              icon="pi pi-play"
              size="small"
              (click)="updateStatus(selectedJob, 'In Progress')"
            ></p-button>
            <p-button
              *ngIf="selectedJob.status === 'Assigned' || selectedJob.status === 'In Progress'"
              label="Mark Completed"
              icon="pi pi-check"
              severity="success"
              size="small"
              (click)="updateStatus(selectedJob, 'Completed')"
            ></p-button>
          </div>
        </div>
      </div>
    </p-dialog>
  `
})
export class ServiceTodayJobsWidget {
  protected dataService = inject(CycleDataService);
  jobDialogVisible = false;
  selectedJob: ServiceJob | null = null;

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

  viewJobDetails(job: ServiceJob): void {
    this.selectedJob = job;
    this.jobDialogVisible = true;
  }

  advanceStatus(job: ServiceJob): void {
    if (job.status === 'Waiting') {
      this.dataService.updateJobStatus(job.id, 'In Progress');
    } else if (job.status === 'Assigned' || job.status === 'In Progress') {
      this.dataService.updateJobStatus(job.id, 'Completed');
    }
  }

  updateStatus(job: ServiceJob, newStatus: TicketStatus): void {
    this.dataService.updateJobStatus(job.id, newStatus);
    job.status = newStatus;
    this.jobDialogVisible = false;
  }
}
