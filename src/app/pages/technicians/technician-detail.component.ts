import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { CardModule } from 'primeng/card';
import { CycleDataService } from '../../services/cycle-data.service';
import { Technician, ServiceJob } from '../../models/cycle-management.models';

@Component({
  selector: 'app-technician-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    ButtonModule,
    TagModule,
    ProgressBarModule,
    CardModule
  ],
  template: `
    <div *ngIf="technician; else notFound" class="flex flex-col gap-6">
      <!-- Profile Header -->
      <div class="bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-start gap-4">
          <img [src]="technician.avatar" [alt]="technician.name" class="w-16 h-16 rounded-2xl border-2 border-orange-500/30 object-cover shadow-sm" />
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">{{ technician.name }}</h1>
              <p-tag [value]="technician.availability" [severity]="technician.availability === 'Available' ? 'success' : 'warn'"></p-tag>
            </div>
            <div class="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-0.5">{{ technician.specialization }}</div>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-color mt-1">
              <span><i class="pi pi-id-card mr-1 text-[11px]"></i>ID: {{ technician.id }}</span>
              <span><i class="pi pi-phone mr-1 text-[11px]"></i>{{ technician.phone }}</span>
              <span><i class="pi pi-envelope mr-1 text-[11px]"></i>{{ technician.email }}</span>
              <span><i class="pi pi-verified mr-1 text-[11px]"></i>{{ technician.certification }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <p-button
            label="Back"
            icon="pi pi-arrow-left"
            severity="secondary"
            [outlined]="true"
            routerLink="/technicians"
            size="small"
          ></p-button>
        </div>
      </div>

      <!-- Performance Metrics Grid -->
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-6 md:col-span-3">
          <div class="card p-4 mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
            <span class="text-xs text-muted-color uppercase font-semibold">Active Queue</span>
            <div class="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{{ assignedJobs.length }} Jobs</div>
          </div>
        </div>

        <div class="col-span-6 md:col-span-3">
          <div class="card p-4 mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
            <span class="text-xs text-muted-color uppercase font-semibold">Lifetime Repaired</span>
            <div class="text-2xl font-bold text-surface-900 dark:text-surface-0 mt-1">{{ technician.completedJobsCount }} Bikes</div>
          </div>
        </div>

        <div class="col-span-6 md:col-span-3">
          <div class="card p-4 mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
            <span class="text-xs text-muted-color uppercase font-semibold">Customer Rating</span>
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{{ technician.rating }} ★</div>
          </div>
        </div>

        <div class="col-span-6 md:col-span-3">
          <div class="card p-4 mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
            <span class="text-xs text-muted-color uppercase font-semibold">Experience</span>
            <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{{ technician.experienceYears }} Years</div>
          </div>
        </div>
      </div>

      <!-- Assigned Jobs Queue Table -->
      <div class="card p-5 shadow-sm border border-surface-200 dark:border-surface-700">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 uppercase tracking-wider flex items-center gap-2">
              <i class="pi pi-wrench text-orange-500"></i>
              Current Workshop Queue & Assigned Tasks
            </h3>
            <p class="text-xs text-muted-color">Bicycles currently assigned to {{ technician.name }}</p>
          </div>
        </div>

        <p-table [value]="assignedJobs" responsiveLayout="scroll" styleClass="p-datatable-sm">
          <ng-template #header>
            <tr>
              <th>Job ID</th>
              <th>Customer</th>
              <th>Bicycle Model</th>
              <th>Service Required</th>
              <th>Scheduled</th>
              <th>Progress</th>
              <th>Status</th>
            </tr>
          </ng-template>

          <ng-template #body let-job>
            <tr>
              <td><span class="font-mono text-xs font-bold text-primary">{{ job.id }}</span></td>
              <td>
                <div class="font-semibold text-xs text-surface-900 dark:text-surface-0">{{ job.customerName }}</div>
                <div class="text-[11px] text-muted-color">{{ job.customerPhone }}</div>
              </td>
              <td>
                <div class="text-xs font-medium text-surface-800 dark:text-surface-200">{{ job.bicycleModel }}</div>
              </td>
              <td>
                <div class="text-xs">{{ job.serviceName }}</div>
              </td>
              <td>
                <span class="text-xs font-mono text-muted-color">{{ job.scheduledTime }}</span>
              </td>
              <td style="min-width: 120px">
                <div class="flex items-center gap-2">
                  <div class="flex-1">
                    <p-progressbar [value]="job.progress" [showValue]="false" [style]="{ height: '5px' }"></p-progressbar>
                  </div>
                  <span class="text-xs font-mono">{{ job.progress }}%</span>
                </div>
              </td>
              <td>
                <p-tag [value]="job.status" [severity]="job.status === 'Completed' ? 'success' : job.status === 'In Progress' ? 'warn' : 'info'"></p-tag>
              </td>
            </tr>
          </ng-template>

          <ng-template #emptymessage>
            <tr><td colspan="7" class="text-center p-6 text-muted-color">No active jobs currently assigned to this technician.</td></tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <ng-template #notFound>
      <div class="card text-center p-12">
        <i class="pi pi-user-times text-5xl text-surface-400 mb-3"></i>
        <h3 class="text-lg font-bold text-surface-900 dark:text-surface-0">Technician Not Found</h3>
        <p class="text-sm text-muted-color mb-4">The technician record could not be found.</p>
        <p-button label="Back to Technicians" icon="pi pi-arrow-left" routerLink="/technicians"></p-button>
      </div>
    </ng-template>
  `
})
export class TechnicianDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(CycleDataService);

  technician: Technician | null = null;
  assignedJobs: ServiceJob[] = [];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.technician = this.dataService.technicians().find(t => t.id === id) || null;
        if (this.technician) {
          this.assignedJobs = this.dataService.serviceJobs().filter(j => j.technicianId === id || j.technicianName === this.technician?.name);
        }
      }
    });
  }
}
