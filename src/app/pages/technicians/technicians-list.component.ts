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
import { Technician, TechnicianAvailability } from '../../models/cycle-management.models';

@Component({
  selector: 'app-technicians-list',
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
            <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">Technicians & Mechanics</h1>
            <span class="text-xs px-2.5 py-1 rounded-full font-semibold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
              {{ filteredTechnicians.length }} Staff Members
            </span>
          </div>
          <p class="text-sm text-muted-color mt-1">Manage workshop staff, mechanical specializations, certifications and active queue capacities.</p>
        </div>
      </div>

      <!-- Quick Metrics Ribbon -->
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-6 sm:col-span-3">
          <div class="card p-3 mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <div>
              <span class="text-xs text-muted-color uppercase font-semibold">Active Staff</span>
              <div class="text-xl font-bold text-surface-900 dark:text-surface-0">{{ dataService.technicians().length }}</div>
            </div>
            <div class="w-8 h-8 rounded bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
              <i class="pi pi-users"></i>
            </div>
          </div>
        </div>

        <div class="col-span-6 sm:col-span-3">
          <div class="card p-3 mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <div>
              <span class="text-xs text-muted-color uppercase font-semibold">On Bench / Working</span>
              <div class="text-xl font-bold text-amber-600 dark:text-amber-400">{{ getCountByAvailability('On Job') }}</div>
            </div>
            <div class="w-8 h-8 rounded bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
              <i class="pi pi-wrench"></i>
            </div>
          </div>
        </div>

        <div class="col-span-6 sm:col-span-3">
          <div class="card p-3 mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <div>
              <span class="text-xs text-muted-color uppercase font-semibold">Available</span>
              <div class="text-xl font-bold text-emerald-600 dark:text-emerald-400">{{ getCountByAvailability('Available') }}</div>
            </div>
            <div class="w-8 h-8 rounded bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
              <i class="pi pi-check-circle"></i>
            </div>
          </div>
        </div>

        <div class="col-span-6 sm:col-span-3">
          <div class="card p-3 mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <div>
              <span class="text-xs text-muted-color uppercase font-semibold">Avg Rating</span>
              <div class="text-xl font-bold text-purple-600 dark:text-purple-400">4.85 ★</div>
            </div>
            <div class="w-8 h-8 rounded bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600">
              <i class="pi pi-star-fill"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Technicians Table -->
      <div class="card p-0 shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
        <p-table
          [value]="filteredTechnicians"
          [paginator]="true"
          [rows]="10"
          [rowHover]="true"
          responsiveLayout="scroll"
          styleClass="p-datatable-sm"
        >
          <ng-template #header>
            <tr>
              <th pSortableColumn="name" style="min-width: 14rem">Technician <p-sortIcon field="name"></p-sortIcon></th>
              <th style="min-width: 15rem">Specialization</th>
              <th pSortableColumn="activeJobsCount" style="min-width: 8rem" class="text-center">Active Jobs <p-sortIcon field="activeJobsCount"></p-sortIcon></th>
              <th pSortableColumn="completedJobsCount" style="min-width: 9rem" class="text-center">Completed <p-sortIcon field="completedJobsCount"></p-sortIcon></th>
              <th pSortableColumn="availability" style="min-width: 9rem">Availability <p-sortIcon field="availability"></p-sortIcon></th>
              <th pSortableColumn="status" style="min-width: 7.5rem">Status <p-sortIcon field="status"></p-sortIcon></th>
              <th style="min-width: 8rem" class="text-center">Actions</th>
            </tr>
          </ng-template>

          <ng-template #body let-tech>
            <tr>
              <td>
                <div class="flex items-center gap-3">
                  <img [src]="tech.avatar" [alt]="tech.name" class="w-10 h-10 rounded-full border border-surface-200 dark:border-surface-700 object-cover" />
                  <div>
                    <a [routerLink]="['/technicians', tech.id]" class="font-bold text-surface-900 dark:text-surface-0 text-sm hover:text-primary hover:underline">
                      {{ tech.name }}
                    </a>
                    <div class="text-[11px] text-muted-color">{{ tech.email }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="text-xs font-semibold text-surface-800 dark:text-surface-200">{{ tech.specialization }}</div>
                <div class="text-[11px] text-muted-color truncate max-w-[200px]">{{ tech.certification || 'Certified Bike Tech' }}</div>
              </td>
              <td class="text-center">
                <span class="inline-flex items-center justify-center font-bold text-xs bg-orange-100 dark:bg-orange-950/60 text-orange-600 px-2.5 py-0.5 rounded-full">
                  {{ tech.activeJobsCount }}
                </span>
              </td>
              <td class="text-center">
                <span class="font-semibold text-xs text-surface-700 dark:text-surface-300">
                  {{ tech.completedJobsCount }}
                </span>
              </td>
              <td>
                <p-tag
                  [value]="tech.availability"
                  [severity]="getAvailabilitySeverity(tech.availability)"
                  [rounded]="true"
                  styleClass="text-xs"
                ></p-tag>
              </td>
              <td>
                <p-tag
                  [value]="tech.status"
                  [severity]="tech.status === 'Active' ? 'success' : 'secondary'"
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
                    pTooltip="View Profile & Workload"
                    [routerLink]="['/technicians', tech.id]"
                  ></p-button>
                  <p-button
                    icon="pi pi-sync"
                    [rounded]="true"
                    [text]="true"
                    severity="info"
                    size="small"
                    pTooltip="Toggle Shift State"
                    (click)="toggleAvailability(tech)"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template #emptymessage>
            <tr>
              <td colspan="7" class="text-center p-8 text-muted-color">
                <i class="pi pi-user-times text-4xl mb-3 block text-surface-400"></i>
                No technician profiles found.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `
})
export class TechniciansListComponent implements OnInit {
  protected dataService = inject(CycleDataService);
  private messageService = inject(MessageService);

  ngOnInit(): void {}

  get filteredTechnicians(): Technician[] {
    return this.dataService.technicians();
  }

  getCountByAvailability(avail: TechnicianAvailability): number {
    return this.dataService.technicians().filter(t => t.availability === avail).length;
  }

  getAvailabilitySeverity(avail: TechnicianAvailability): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (avail) {
      case 'Available': return 'success';
      case 'On Job': return 'warn';
      case 'On Break': return 'info';
      case 'Off Duty': return 'secondary';
      default: return 'info';
    }
  }

  toggleAvailability(tech: Technician): void {
    const next: TechnicianAvailability = tech.availability === 'Available' ? 'On Job' :
                                         tech.availability === 'On Job' ? 'On Break' :
                                         tech.availability === 'On Break' ? 'Available' : 'Available';

    this.dataService.updateTechnicianStatus(tech.id, next);
    tech.availability = next;
    this.messageService.add({
      severity: 'info',
      summary: 'Status Updated',
      detail: `${tech.name} marked as "${next}".`
    });
  }
}
