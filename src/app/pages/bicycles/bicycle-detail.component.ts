import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { CycleDataService } from '../../services/cycle-data.service';
import { Bicycle, ServiceTicket, Appointment } from '../../models/cycle-management.models';

@Component({
  selector: 'app-bicycle-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    ButtonModule,
    TagModule,
    CardModule
  ],
  template: `
    <div *ngIf="bicycle; else notFound" class="flex flex-col gap-6">
      <!-- Header Profile Card -->
      <div class="bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-start gap-4">
          <div class="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-2xl border border-orange-500/20">
            <i class="pi pi-compass text-3xl"></i>
          </div>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">{{ bicycle.brand }} {{ bicycle.model }}</h1>
              <p-tag
                [value]="bicycle.status"
                [severity]="bicycle.status === 'Good' ? 'success' : bicycle.status === 'In Service' ? 'warn' : 'info'"
              ></p-tag>
            </div>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-color mt-1">
              <span><i class="pi pi-tag mr-1 text-[11px]"></i>Type: {{ bicycle.type }}</span>
              <span><i class="pi pi-barcode mr-1 text-[11px]"></i>SN: {{ bicycle.serialNumber }}</span>
              <span><i class="pi pi-id-card mr-1 text-[11px]"></i>Frame: {{ bicycle.frameNumber }}</span>
              <span><i class="pi pi-user mr-1 text-[11px]"></i>Owner: <a [routerLink]="['/customers', bicycle.customerId]" class="text-primary hover:underline font-semibold">{{ bicycle.customerName }}</a></span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <p-button
            label="Back"
            icon="pi pi-arrow-left"
            severity="secondary"
            [outlined]="true"
            routerLink="/bicycles"
            size="small"
          ></p-button>
          <p-button
            label="+ Service This Bike"
            icon="pi pi-wrench"
            routerLink="/services/new"
            size="small"
          ></p-button>
        </div>
      </div>

      <!-- Key Service Status Info Grid -->
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 sm:col-span-4">
          <div class="card p-4 mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
            <span class="text-xs text-muted-color uppercase font-semibold">Current Health Status</span>
            <div class="text-xl font-bold text-surface-900 dark:text-surface-0 mt-1 flex items-center gap-2">
              <span class="w-3 h-3 rounded-full" [ngClass]="bicycle.status === 'Good' ? 'bg-emerald-500' : 'bg-amber-500'"></span>
              {{ bicycle.status }}
            </div>
          </div>
        </div>

        <div class="col-span-12 sm:col-span-4">
          <div class="card p-4 mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
            <span class="text-xs text-muted-color uppercase font-semibold">Last Service Date</span>
            <div class="text-xl font-bold text-surface-900 dark:text-surface-0 mt-1 font-mono">
              {{ bicycle.lastServiceDate }}
            </div>
          </div>
        </div>

        <div class="col-span-12 sm:col-span-4">
          <div class="card p-4 mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
            <span class="text-xs text-muted-color uppercase font-semibold">Next Recommended Service</span>
            <div class="text-xl font-bold text-orange-600 dark:text-orange-400 mt-1 font-mono">
              {{ bicycle.nextServiceDate }}
            </div>
          </div>
        </div>
      </div>

      <!-- Technical Specs & Component Breakdown -->
      <div class="grid grid-cols-12 gap-6">
        <div class="col-span-12 md:col-span-5">
          <div class="card p-5 shadow-sm border border-surface-200 dark:border-surface-700 h-full">
            <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 uppercase tracking-wider mb-4 flex items-center gap-2">
              <i class="pi pi-cog text-orange-500"></i>
              Specifications
            </h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between py-1.5 border-b border-surface-100 dark:border-surface-800">
                <span class="text-muted-color">Brand:</span>
                <span class="font-semibold text-surface-900 dark:text-surface-0">{{ bicycle.brand }}</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-surface-100 dark:border-surface-800">
                <span class="text-muted-color">Model:</span>
                <span class="font-semibold text-surface-900 dark:text-surface-0">{{ bicycle.model }}</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-surface-100 dark:border-surface-800">
                <span class="text-muted-color">Category / Discipline:</span>
                <span>{{ bicycle.type }}</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-surface-100 dark:border-surface-800">
                <span class="text-muted-color">Gear Groupset:</span>
                <span class="font-medium">{{ bicycle.gearSystem || 'Shimano Di2 12-Speed' }}</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-surface-100 dark:border-surface-800">
                <span class="text-muted-color">Brakes:</span>
                <span class="font-medium">{{ bicycle.brakeType || 'Hydraulic Flat Mount Disc' }}</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-surface-100 dark:border-surface-800">
                <span class="text-muted-color">Color / Finish:</span>
                <span>{{ bicycle.color || 'Matte Raw Carbon' }}</span>
              </div>
              <div class="flex justify-between py-1.5">
                <span class="text-muted-color">Purchase Date:</span>
                <span class="font-mono">{{ bicycle.purchaseDate }}</span>
              </div>
            </div>

            <div *ngIf="bicycle.notes" class="mt-4 p-3 rounded bg-surface-50 dark:bg-surface-800 text-xs text-muted-color">
              <strong>Workshop Notes:</strong> {{ bicycle.notes }}
            </div>
          </div>
        </div>

        <div class="col-span-12 md:col-span-7">
          <div class="card p-5 shadow-sm border border-surface-200 dark:border-surface-700 h-full">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 uppercase tracking-wider flex items-center gap-2">
                <i class="pi pi-history text-orange-500"></i>
                Service History & Work Orders
              </h3>
              <span class="text-xs text-muted-color">{{ bikeTickets.length }} Records</span>
            </div>

            <p-table [value]="bikeTickets" responsiveLayout="scroll" styleClass="p-datatable-sm">
              <ng-template #header>
                <tr>
                  <th>Ticket</th>
                  <th>Service Task</th>
                  <th>Technician</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </ng-template>
              <ng-template #body let-t>
                <tr>
                  <td><span class="font-mono text-xs font-bold text-primary">{{ t.id }}</span></td>
                  <td>
                    <div class="text-xs font-medium text-surface-800 dark:text-surface-200">{{ t.category || 'Maintenance' }}</div>
                    <div class="text-[11px] text-muted-color truncate max-w-[160px]">{{ t.description }}</div>
                  </td>
                  <td><span class="text-xs">{{ t.assigneeName }}</span></td>
                  <td><p-tag [value]="t.status" [severity]="t.status === 'Completed' ? 'success' : 'warn'"></p-tag></td>
                  <td><span class="text-xs text-muted-color font-mono">{{ t.createdAt }}</span></td>
                </tr>
              </ng-template>
              <ng-template #emptymessage>
                <tr><td colspan="5" class="text-center p-6 text-muted-color">No past service work orders logged for this bicycle.</td></tr>
              </ng-template>
            </p-table>
          </div>
        </div>
      </div>
    </div>

    <ng-template #notFound>
      <div class="card text-center p-12">
        <i class="pi pi-exclamation-triangle text-5xl text-surface-400 mb-3"></i>
        <h3 class="text-lg font-bold text-surface-900 dark:text-surface-0">Bicycle Not Found</h3>
        <p class="text-sm text-muted-color mb-4">The bicycle record you requested could not be found.</p>
        <p-button label="Back to Bicycle Fleet" icon="pi pi-arrow-left" routerLink="/bicycles"></p-button>
      </div>
    </ng-template>
  `
})
export class BicycleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(CycleDataService);

  bicycle: Bicycle | null = null;
  bikeTickets: ServiceTicket[] = [];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.bicycle = this.dataService.bicycles().find(b => b.id === id) || null;
        if (this.bicycle) {
          this.bikeTickets = this.dataService.tickets().filter(t => t.cycleId === id);
        }
      }
    });
  }
}
