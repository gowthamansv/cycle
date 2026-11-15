import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { CycleService } from '../../services/cycle.service';
import { TicketService } from '../../services/ticket.service';
import { CycleServiceInfoResponse, TicketResponseDto } from '../../models/api.models';

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
    <div *ngIf="cycleInfo; else notFound" class="flex flex-col gap-6">
      <!-- Header Profile Card -->
      <div class="bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-start gap-4">
          <div class="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-2xl border border-orange-500/20">
            <i class="pi pi-compass text-3xl"></i>
          </div>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">{{ cycleInfo.model || 'Bicycle Profile' }}</h1>
              <p-tag
                [value]="cycleInfo.currentService ? 'In Service' : 'Ready'"
                [severity]="cycleInfo.currentService ? 'warn' : 'success'"
              ></p-tag>
            </div>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-color mt-1">
              <span><i class="pi pi-id-card mr-1 text-[11px]"></i>Cycle ID: {{ cycleInfo.cycleId }}</span>
              <span *ngIf="cycleInfo.serialNumber"><i class="pi pi-barcode mr-1 text-[11px]"></i>SN: {{ cycleInfo.serialNumber }}</span>
              <span *ngIf="cycleInfo.customer"><i class="pi pi-user mr-1 text-[11px]"></i>Owner:
                <a [routerLink]="['/customers', cycleInfo.customer.id]" class="text-primary hover:underline font-semibold">
                  {{ cycleInfo.customer.name }}
                </a>
                <span *ngIf="cycleInfo.customer.phoneNumber" class="ml-1 text-muted-color">({{ cycleInfo.customer.phoneNumber }})</span>
              </span>
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
            styleClass="bg-orange-500 hover:bg-orange-600 border-none text-white font-semibold"
          ></p-button>
        </div>
      </div>

      <!-- Key Service Status Info Grid -->
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 sm:col-span-4">
          <div class="card p-4 mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
            <span class="text-xs text-muted-color uppercase font-semibold">Current Service State</span>
            <div class="text-xl font-bold text-surface-900 dark:text-surface-0 mt-1 flex items-center gap-2">
              <span class="w-3 h-3 rounded-full" [ngClass]="cycleInfo.currentService ? 'bg-amber-500' : 'bg-emerald-500'"></span>
              {{ cycleInfo.currentService ? (cycleInfo.currentService.status || 'Active Service') : 'No Active Service' }}
            </div>
          </div>
        </div>

        <div class="col-span-12 sm:col-span-4">
          <div class="card p-4 mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
            <span class="text-xs text-muted-color uppercase font-semibold">Current Ticket</span>
            <div class="text-base font-bold text-surface-900 dark:text-surface-0 mt-1 font-mono">
              {{ cycleInfo.currentService?.ticketId ? '#' + (cycleInfo.currentService!.ticketId.substring(0, 8) | uppercase) : 'None' }}
            </div>
          </div>
        </div>

        <div class="col-span-12 sm:col-span-4">
          <div class="card p-4 mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
            <span class="text-xs text-muted-color uppercase font-semibold">Total Completed Services</span>
            <div class="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {{ cycleInfo.previousServices ? cycleInfo.previousServices.length : 0 }}
            </div>
          </div>
        </div>
      </div>

      <!-- Service History & Work Orders -->
      <div class="grid grid-cols-12 gap-6">
        <div class="col-span-12">
          <div class="card p-5 shadow-sm border border-surface-200 dark:border-surface-700">
            <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 uppercase tracking-wider mb-4 flex items-center gap-2">
              <i class="pi pi-history text-orange-500"></i>
              Bicycle Service History (GET /api/cycles/&#123;id&#125;/service-info)
            </h3>

            <p-table [value]="allCycleTickets" responsiveLayout="scroll" styleClass="p-datatable-sm">
              <ng-template #header>
                <tr>
                  <th>Ticket</th>
                  <th>Description / Work</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created Date</th>
                </tr>
              </ng-template>
              <ng-template #body let-t>
                <tr>
                  <td><span class="font-mono text-xs font-bold text-primary">#{{ t.id ? (t.id.substring(0, 8) | uppercase) : 'TCK' }}</span></td>
                  <td>
                    <div class="text-xs font-medium text-surface-800 dark:text-surface-200">{{ t.udF6 || t.description || 'Service' }}</div>
                  </td>
                  <td><p-tag [value]="t.priority || 'Normal'" severity="info"></p-tag></td>
                  <td><p-tag [value]="t.status || 'Active'" [severity]="t.status === 'Completed' ? 'success' : 'warn'"></p-tag></td>
                  <td><span class="text-xs text-muted-color font-mono">{{ t.createdAt | date:'short' }}</span></td>
                </tr>
              </ng-template>
              <ng-template #emptymessage>
                <tr><td colspan="5" class="text-center p-6 text-muted-color">No service work orders recorded for this bicycle in backend API.</td></tr>
              </ng-template>
            </p-table>
          </div>
        </div>
      </div>
    </div>

    <ng-template #notFound>
      <div class="card text-center p-12">
        <i class="pi pi-exclamation-triangle text-5xl text-surface-400 mb-3"></i>
        <h3 class="text-lg font-bold text-surface-900 dark:text-surface-0">Bicycle Record Not Found</h3>
        <p class="text-sm text-muted-color mb-4">The bicycle service info could not be retrieved from GET /api/cycles/&#123;id&#125;/service-info.</p>
        <p-button label="Back to Bicycle Fleet" icon="pi pi-arrow-left" routerLink="/bicycles"></p-button>
      </div>
    </ng-template>
  `
})
export class BicycleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private cycleService = inject(CycleService);
  private ticketService = inject(TicketService);

  cycleInfo: CycleServiceInfoResponse | null = null;
  allCycleTickets: any[] = [];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadCycleDetails(id);
      }
    });
  }

  loadCycleDetails(id: string): void {
    this.cycleService.getCycleServiceInfo(id).subscribe({
      next: (res) => {
        this.cycleInfo = res;
        this.buildTicketsList(id);
      },
      error: () => {
        // Also check if tickets have this bicycle
        this.ticketService.getTickets().subscribe({
          next: (tickets) => {
            const found = (tickets || []).filter(t => t.cycleId === id);
            if (found.length > 0) {
              const first = found[0];
              this.cycleInfo = {
                cycleId: id,
                model: first.cycleModel,
                serialNumber: first.serialNumber,
                customer: {
                  id: first.customerId,
                  name: first.customerName,
                  phoneNumber: first.contactPhone,
                  email: first.contactEmail
                },
                currentService: null,
                previousServices: []
              };
              this.allCycleTickets = found;
            } else {
              this.cycleInfo = null;
            }
          },
          error: () => {
            this.cycleInfo = null;
          }
        });
      }
    });
  }

  private buildTicketsList(cycleId: string): void {
    this.ticketService.getTickets().subscribe({
      next: (tickets) => {
        const matching = (tickets || []).filter(t => t.cycleId === cycleId);
        if (matching.length > 0) {
          this.allCycleTickets = matching;
        } else if (this.cycleInfo?.previousServices) {
          this.allCycleTickets = this.cycleInfo.previousServices.map(s => ({
            id: s.ticketId,
            description: s.description,
            priority: s.priority,
            status: s.status,
            createdAt: s.createdAt
          }));
        }
      }
    });
  }
}
