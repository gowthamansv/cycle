import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { MiscService } from '../../services/misc.service';
import { TicketService } from '../../services/ticket.service';
import { MiscCustomer, CustomerCycleLookup, TicketResponseDto } from '../../models/api.models';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TabsModule,
    TableModule,
    ButtonModule,
    TagModule,
    CardModule
  ],
  template: `
    <div *ngIf="customer; else notFound" class="flex flex-col gap-6">
      <!-- Customer Header Profile -->
      <div class="bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-start gap-4">
          <div class="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-2xl border border-orange-500/20">
            {{ getInitials(customer.name) }}
          </div>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">{{ customer.name }}</h1>
              <p-tag
                value="Verified Client"
                severity="success"
              ></p-tag>
            </div>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-color mt-1">
              <span><i class="pi pi-id-card mr-1 text-[11px]"></i>#{{ customer.id ? (customer.id.substring(0, 8) | uppercase) : 'N/A' }}</span>
              <span *ngIf="customer.phoneNumber"><i class="pi pi-phone mr-1 text-[11px]"></i>{{ customer.phoneNumber }}</span>
              <span *ngIf="customer.email"><i class="pi pi-envelope mr-1 text-[11px]"></i>{{ customer.email }}</span>
              <span *ngIf="customer.address"><i class="pi pi-map-marker mr-1 text-[11px]"></i>{{ customer.address }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <p-button
            label="Back"
            icon="pi pi-arrow-left"
            severity="secondary"
            [outlined]="true"
            routerLink="/customers"
            size="small"
          ></p-button>
          <p-button
            label="+ New Service"
            icon="pi pi-wrench"
            routerLink="/services/new"
            size="small"
            styleClass="bg-orange-500 hover:bg-orange-600 border-none text-white font-semibold"
          ></p-button>
        </div>
      </div>

      <!-- Quick Metrics Summary -->
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-6 md:col-span-3">
          <div class="card p-4 mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
            <span class="text-xs text-muted-color uppercase font-semibold">Registered Bikes</span>
            <div class="text-2xl font-bold text-surface-900 dark:text-surface-0 mt-1">{{ customerBicycles.length }}</div>
          </div>
        </div>
        <div class="col-span-6 md:col-span-3">
          <div class="card p-4 mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
            <span class="text-xs text-muted-color uppercase font-semibold">Total Tickets</span>
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{{ customerTickets.length }}</div>
          </div>
        </div>
        <div class="col-span-6 md:col-span-3">
          <div class="card p-4 mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
            <span class="text-xs text-muted-color uppercase font-semibold">Active Jobs</span>
            <div class="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{{ activeTicketsCount }}</div>
          </div>
        </div>
        <div class="col-span-6 md:col-span-3">
          <div class="card p-4 mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
            <span class="text-xs text-muted-color uppercase font-semibold">Completed Jobs</span>
            <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{{ completedTicketsCount }}</div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation Container -->
      <div class="card p-4 shadow-sm border border-surface-200 dark:border-surface-700">
        <p-tabs value="0">
          <p-tablist>
            <p-tab value="0">
              <i class="pi pi-user mr-2"></i> Profile Details
            </p-tab>
            <p-tab value="1">
              <i class="pi pi-compass mr-2"></i> Bicycles ({{ customerBicycles.length }})
            </p-tab>
            <p-tab value="2">
              <i class="pi pi-wrench mr-2"></i> Service History ({{ customerTickets.length }})
            </p-tab>
            <p-tab value="3">
              <i class="pi pi-calendar mr-2"></i> Appointments (0)
            </p-tab>
            <p-tab value="4">
              <i class="pi pi-credit-card mr-2"></i> Payment History (0)
            </p-tab>
          </p-tablist>

          <p-tabpanels>
            <!-- Tab 0: Profile Info -->
            <p-tabpanel value="0">
              <div class="grid grid-cols-12 gap-6 pt-4">
                <div class="col-span-12 md:col-span-6 space-y-4">
                  <h4 class="text-sm font-bold text-surface-900 dark:text-surface-0 uppercase tracking-wider">Contact & Account Details</h4>
                  <div class="p-4 rounded-lg bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 space-y-3 text-sm">
                    <div class="flex justify-between py-1 border-b border-surface-200/60 dark:border-surface-700/60">
                      <span class="text-muted-color">Customer ID:</span>
                      <span class="font-mono font-semibold">{{ customer.id }}</span>
                    </div>
                    <div class="flex justify-between py-1 border-b border-surface-200/60 dark:border-surface-700/60">
                      <span class="text-muted-color">Full Name:</span>
                      <span class="font-semibold text-surface-900 dark:text-surface-0">{{ customer.name }}</span>
                    </div>
                    <div class="flex justify-between py-1 border-b border-surface-200/60 dark:border-surface-700/60">
                      <span class="text-muted-color">Primary Phone:</span>
                      <span class="font-mono">{{ customer.phoneNumber || '—' }}</span>
                    </div>
                    <div class="flex justify-between py-1 border-b border-surface-200/60 dark:border-surface-700/60">
                      <span class="text-muted-color">Email:</span>
                      <span>{{ customer.email || '—' }}</span>
                    </div>
                    <div class="flex justify-between py-1">
                      <span class="text-muted-color">Address:</span>
                      <span>{{ customer.address || '—' }}</span>
                    </div>
                  </div>
                </div>

                <div class="col-span-12 md:col-span-6 space-y-4">
                  <h4 class="text-sm font-bold text-surface-900 dark:text-surface-0 uppercase tracking-wider">API Integration Info</h4>
                  <div class="p-4 rounded-lg bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 space-y-2 text-xs text-muted-color">
                    <p>Customer data loaded live from backend endpoint <code class="font-mono bg-surface-200 dark:bg-surface-700 px-1 py-0.5 rounded">/api/misc/customers</code>.</p>
                    <p>Bicycles queried via <code class="font-mono bg-surface-200 dark:bg-surface-700 px-1 py-0.5 rounded">/api/misc/customers/&#123;id&#125;/cycles</code>.</p>
                    <p>Service tickets matched from <code class="font-mono bg-surface-200 dark:bg-surface-700 px-1 py-0.5 rounded">/api/tickets</code>.</p>
                  </div>
                </div>
              </div>
            </p-tabpanel>

            <!-- Tab 1: Bicycles -->
            <p-tabpanel value="1">
              <div class="pt-4">
                <div class="flex justify-between items-center mb-4">
                  <h4 class="text-sm font-bold text-surface-900 dark:text-surface-0 uppercase tracking-wider">Registered Bicycles</h4>
                  <p-button label="+ Register Bicycle" icon="pi pi-plus" size="small" routerLink="/bicycles"></p-button>
                </div>

                <div *ngIf="customerBicycles.length > 0; else noBicycles" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div *ngFor="let bike of customerBicycles" class="p-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 hover:border-orange-400 transition-colors">
                    <div class="flex justify-between items-start mb-2">
                      <div>
                        <h5 class="text-base font-bold text-surface-900 dark:text-surface-0">{{ bike.brand || '' }} {{ bike.model || bike.cycleModel || 'Bicycle' }}</h5>
                        <span class="text-xs px-2 py-0.5 rounded bg-surface-200 dark:bg-surface-700 font-medium">{{ bike.bicycleType || bike.type || 'Standard' }}</span>
                      </div>
                    </div>

                    <div class="text-xs space-y-1 text-muted-color mt-3">
                      <div>Serial Number: <strong class="text-surface-800 dark:text-surface-200 font-mono">{{ bike.serialNumber || 'N/A' }}</strong></div>
                      <div *ngIf="bike.frameNumber">Frame Number: <strong class="text-surface-800 dark:text-surface-200 font-mono">{{ bike.frameNumber }}</strong></div>
                      <div *ngIf="bike.drivetrain || bike.gearSystem">Drivetrain: <strong class="text-surface-800 dark:text-surface-200">{{ bike.drivetrain || bike.gearSystem }}</strong></div>
                      <div *ngIf="bike.brakeSystem || bike.brakeType">Brake Type: <strong class="text-surface-800 dark:text-surface-200">{{ bike.brakeSystem || bike.brakeType }}</strong></div>
                    </div>

                    <div class="mt-4 pt-3 border-t border-surface-200 dark:border-surface-700 flex justify-end">
                      <p-button label="View Bicycle Details" [text]="true" size="small" [routerLink]="['/bicycles', bike.cycleId || bike.id]"></p-button>
                    </div>
                  </div>
                </div>

                <ng-template #noBicycles>
                  <div class="text-center p-8 text-muted-color">
                    <i class="pi pi-compass text-3xl mb-2 block"></i>
                    <div>No bicycles registered for this customer yet.</div>
                  </div>
                </ng-template>
              </div>
            </p-tabpanel>

            <!-- Tab 2: Service History -->
            <p-tabpanel value="2">
              <div class="pt-4">
                <p-table [value]="customerTickets" responsiveLayout="scroll" styleClass="p-datatable-sm">
                  <ng-template #header>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Bicycle</th>
                      <th>Service / Scope</th>
                      <th>Technician</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </ng-template>
                  <ng-template #body let-t>
                    <tr>
                      <td><span class="font-mono text-xs font-bold text-primary">#{{ t.id ? (t.id.substring(0, 8) | uppercase) : 'N/A' }}</span></td>
                      <td>{{ t.cycleModel || 'Bicycle' }}</td>
                      <td><span class="text-xs truncate max-w-[200px] block">{{ t.udF6 || t.description || 'General Service' }}</span></td>
                      <td>{{ t.assigneeName || 'Unassigned' }}</td>
                      <td><p-tag [value]="t.status" [severity]="t.status === 'Completed' ? 'success' : 'warn'"></p-tag></td>
                      <td><span class="text-xs text-muted-color">{{ t.createdAt | date:'short' }}</span></td>
                    </tr>
                  </ng-template>
                  <ng-template #emptymessage>
                    <tr><td colspan="6" class="text-center p-6 text-muted-color">No previous service tickets logged for this customer.</td></tr>
                  </ng-template>
                </p-table>
              </div>
            </p-tabpanel>

            <!-- Tab 3: Appointments -->
            <p-tabpanel value="3">
              <div class="pt-4 text-center p-8 text-muted-color">
                <i class="pi pi-calendar-times text-4xl mb-2 block text-surface-400"></i>
                <div class="font-medium text-surface-700 dark:text-surface-300">No Appointments Available</div>
                <div class="text-xs text-muted-color mt-1">
                  The backend service currently does not provide an appointments API endpoint (GET /api/appointments).
                </div>
              </div>
            </p-tabpanel>

            <!-- Tab 4: Payments -->
            <p-tabpanel value="4">
              <div class="pt-4 text-center p-8 text-muted-color">
                <i class="pi pi-credit-card text-4xl mb-2 block text-surface-400"></i>
                <div class="font-medium text-surface-700 dark:text-surface-300">No Payment Records Available</div>
                <div class="text-xs text-muted-color mt-1">
                  The backend service currently does not provide an invoice or payments API endpoint (GET /api/payments).
                </div>
              </div>
            </p-tabpanel>
          </p-tabpanels>
        </p-tabs>
      </div>
    </div>

    <ng-template #notFound>
      <div class="card text-center p-12">
        <i class="pi pi-user-times text-5xl text-surface-400 mb-3"></i>
        <h3 class="text-lg font-bold text-surface-900 dark:text-surface-0">Customer Not Found</h3>
        <p class="text-sm text-muted-color mb-4">The customer profile you requested does not exist or was removed.</p>
        <p-button label="Back to Customers" icon="pi pi-arrow-left" routerLink="/customers"></p-button>
      </div>
    </ng-template>
  `
})
export class CustomerDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  protected miscService = inject(MiscService);
  protected ticketService = inject(TicketService);

  customer: MiscCustomer | null = null;
  customerBicycles: CustomerCycleLookup[] = [];
  customerTickets: TicketResponseDto[] = [];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadCustomer(id);
      }
    });
  }

  loadCustomer(id: string): void {
    // 1. Check if customers list is loaded
    const found = this.miscService.customers().find(c => c.id === id);
    if (found) {
      this.customer = found;
    } else {
      this.miscService.getCustomers().subscribe({
        next: (custs) => {
          this.customer = (custs || []).find(c => c.id === id) || null;
        }
      });
    }

    // 2. Load bicycles for this customer
    this.miscService.getCustomerCycles(id).subscribe({
      next: (bikes) => {
        this.customerBicycles = bikes || [];
      },
      error: () => {
        this.customerBicycles = [];
      }
    });

    // 3. Load tickets for this customer
    this.ticketService.getTickets().subscribe({
      next: (tickets) => {
        this.customerTickets = (tickets || []).filter(t => t.customerId === id);
      },
      error: () => {
        this.customerTickets = [];
      }
    });
  }

  get activeTicketsCount(): number {
    return this.customerTickets.filter(t => {
      const s = (t.status || '').toLowerCase();
      return !s.includes('complete') && !s.includes('closed');
    }).length;
  }

  get completedTicketsCount(): number {
    return this.customerTickets.filter(t => {
      const s = (t.status || '').toLowerCase();
      return s.includes('complete') || s.includes('closed');
    }).length;
  }

  getInitials(name?: string | null): string {
    if (!name) return 'C';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }
}
