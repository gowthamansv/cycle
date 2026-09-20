import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { CycleDataService } from '../../services/cycle-data.service';
import { Customer, Bicycle, ServiceTicket, Appointment, PaymentRecord } from '../../models/cycle-management.models';

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
                [value]="customer.status"
                [severity]="customer.status === 'VIP' ? 'warn' : customer.status === 'Active' ? 'success' : 'secondary'"
              ></p-tag>
            </div>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-color mt-1">
              <span><i class="pi pi-id-card mr-1 text-[11px]"></i>{{ customer.id }}</span>
              <span><i class="pi pi-phone mr-1 text-[11px]"></i>{{ customer.phone }}</span>
              <span><i class="pi pi-envelope mr-1 text-[11px]"></i>{{ customer.email }}</span>
              <span *ngIf="customer.companyName"><i class="pi pi-building mr-1 text-[11px]"></i>{{ customer.companyName }}</span>
              <span><i class="pi pi-calendar mr-1 text-[11px]"></i>Member since {{ customer.joinDate }}</span>
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
            <span class="text-xs text-muted-color uppercase font-semibold">Active Jobs</span>
            <div class="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{{ customer.activeServicesCount }}</div>
          </div>
        </div>
        <div class="col-span-6 md:col-span-3">
          <div class="card p-4 mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
            <span class="text-xs text-muted-color uppercase font-semibold">Total Spent</span>
            <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">\${{ totalSpent | number:'1.2-2' }}</div>
          </div>
        </div>
        <div class="col-span-6 md:col-span-3">
          <div class="card p-4 mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
            <span class="text-xs text-muted-color uppercase font-semibold">Last Service</span>
            <div class="text-base font-bold text-surface-800 dark:text-surface-200 mt-2">{{ customer.lastServiceDate }}</div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation Container -->
      <div class="card p-4 shadow-sm border border-surface-200 dark:border-surface-700">
        <p-tabs value="0">
          <p-tablist>
            <p-tab value="0">
              <i class="pi pi-user mr-2"></i> Profile & Address
            </p-tab>
            <p-tab value="1">
              <i class="pi pi-compass mr-2"></i> Bicycles ({{ customerBicycles.length }})
            </p-tab>
            <p-tab value="2">
              <i class="pi pi-wrench mr-2"></i> Service History ({{ customerTickets.length }})
            </p-tab>
            <p-tab value="3">
              <i class="pi pi-calendar mr-2"></i> Appointments ({{ customerAppointments.length }})
            </p-tab>
            <p-tab value="4">
              <i class="pi pi-credit-card mr-2"></i> Payment History ({{ customerPayments.length }})
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
                      <span class="text-muted-color">Full Name:</span>
                      <span class="font-semibold text-surface-900 dark:text-surface-0">{{ customer.name }}</span>
                    </div>
                    <div class="flex justify-between py-1 border-b border-surface-200/60 dark:border-surface-700/60">
                      <span class="text-muted-color">Primary Phone:</span>
                      <span class="font-mono">{{ customer.phone }}</span>
                    </div>
                    <div class="flex justify-between py-1 border-b border-surface-200/60 dark:border-surface-700/60">
                      <span class="text-muted-color">Email:</span>
                      <span>{{ customer.email }}</span>
                    </div>
                    <div class="flex justify-between py-1 border-b border-surface-200/60 dark:border-surface-700/60">
                      <span class="text-muted-color">Company / Team:</span>
                      <span>{{ customer.companyName || 'None' }}</span>
                    </div>
                    <div class="flex justify-between py-1">
                      <span class="text-muted-color">Member Status:</span>
                      <span class="font-semibold">{{ customer.status }}</span>
                    </div>
                  </div>
                </div>

                <div class="col-span-12 md:col-span-6 space-y-4">
                  <h4 class="text-sm font-bold text-surface-900 dark:text-surface-0 uppercase tracking-wider">Location & Notes</h4>
                  <div class="p-4 rounded-lg bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 space-y-3 text-sm">
                    <div>
                      <span class="text-xs text-muted-color uppercase block mb-1">Service Address</span>
                      <p class="font-medium text-surface-800 dark:text-surface-200">{{ customer.address || '742 Evergreen Terrace, Portland, OR 97201' }}</p>
                    </div>
                    <div class="pt-2">
                      <span class="text-xs text-muted-color uppercase block mb-1">Rider Notes & Setup Preferences</span>
                      <p class="text-xs text-surface-700 dark:text-surface-300 italic p-3 rounded bg-surface-100 dark:bg-surface-800">
                        {{ customer.notes || 'No special notes logged for this customer.' }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </p-tabpanel>

            <!-- Tab 1: Bicycle List -->
            <p-tabpanel value="1">
              <div class="pt-4">
                <div class="flex justify-between items-center mb-4">
                  <h4 class="text-sm font-bold text-surface-900 dark:text-surface-0 uppercase tracking-wider">Registered Bicycles</h4>
                  <p-button label="+ Register Bicycle" icon="pi pi-plus" size="small" routerLink="/bicycles"></p-button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div *ngFor="let bike of customerBicycles" class="p-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 hover:border-orange-400 transition-colors">
                    <div class="flex justify-between items-start mb-2">
                      <div>
                        <h5 class="text-base font-bold text-surface-900 dark:text-surface-0">{{ bike.brand }} {{ bike.model }}</h5>
                        <span class="text-xs px-2 py-0.5 rounded bg-surface-200 dark:bg-surface-700 font-medium">{{ bike.type }}</span>
                      </div>
                      <p-tag [value]="bike.status" [severity]="bike.status === 'Good' ? 'success' : bike.status === 'In Service' ? 'warn' : 'info'"></p-tag>
                    </div>

                    <div class="text-xs space-y-1 text-muted-color mt-3">
                      <div>Serial: <strong class="text-surface-800 dark:text-surface-200 font-mono">{{ bike.serialNumber }}</strong></div>
                      <div>Gear System: <strong class="text-surface-800 dark:text-surface-200">{{ bike.gearSystem || 'Shimano 105' }}</strong></div>
                      <div>Last Serviced: <strong class="text-surface-800 dark:text-surface-200">{{ bike.lastServiceDate }}</strong></div>
                    </div>

                    <div class="mt-4 pt-3 border-t border-surface-200 dark:border-surface-700 flex justify-end">
                      <p-button label="View Bicycle Details" [text]="true" size="small" [routerLink]="['/bicycles', bike.id]"></p-button>
                    </div>
                  </div>
                </div>
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
                      <th>Category</th>
                      <th>Description</th>
                      <th>Technician</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </ng-template>
                  <ng-template #body let-t>
                    <tr>
                      <td><span class="font-mono text-xs font-bold text-primary">{{ t.id }}</span></td>
                      <td>{{ t.cycleModel }}</td>
                      <td>{{ t.category || 'General' }}</td>
                      <td><span class="text-xs truncate max-w-[200px] block">{{ t.description }}</span></td>
                      <td>{{ t.assigneeName }}</td>
                      <td><p-tag [value]="t.status" [severity]="t.status === 'Completed' ? 'success' : 'warn'"></p-tag></td>
                      <td><span class="text-xs text-muted-color">{{ t.createdAt }}</span></td>
                    </tr>
                  </ng-template>
                  <ng-template #emptymessage>
                    <tr><td colspan="7" class="text-center p-6 text-muted-color">No previous service tickets logged.</td></tr>
                  </ng-template>
                </p-table>
              </div>
            </p-tabpanel>

            <!-- Tab 3: Appointments -->
            <p-tabpanel value="3">
              <div class="pt-4">
                <p-table [value]="customerAppointments" responsiveLayout="scroll" styleClass="p-datatable-sm">
                  <ng-template #header>
                    <tr>
                      <th>ID</th>
                      <th>Bicycle</th>
                      <th>Service</th>
                      <th>Date & Time</th>
                      <th>Technician</th>
                      <th>Status</th>
                    </tr>
                  </ng-template>
                  <ng-template #body let-a>
                    <tr>
                      <td><span class="font-mono text-xs font-bold text-primary">{{ a.id }}</span></td>
                      <td>{{ a.cycleModel }}</td>
                      <td>{{ a.serviceType }}</td>
                      <td><span class="font-mono text-xs">{{ a.date }} at {{ a.time }}</span></td>
                      <td>{{ a.technicianName }}</td>
                      <td><p-tag [value]="a.status" [severity]="a.status === 'Completed' ? 'success' : 'info'"></p-tag></td>
                    </tr>
                  </ng-template>
                  <ng-template #emptymessage>
                    <tr><td colspan="6" class="text-center p-6 text-muted-color">No appointment records found.</td></tr>
                  </ng-template>
                </p-table>
              </div>
            </p-tabpanel>

            <!-- Tab 4: Payments -->
            <p-tabpanel value="4">
              <div class="pt-4">
                <p-table [value]="customerPayments" responsiveLayout="scroll" styleClass="p-datatable-sm">
                  <ng-template #header>
                    <tr>
                      <th>Invoice #</th>
                      <th>Service Description</th>
                      <th>Amount</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </ng-template>
                  <ng-template #body let-p>
                    <tr>
                      <td><span class="font-mono text-xs font-bold text-primary">{{ p.invoiceNumber }}</span></td>
                      <td>{{ p.serviceName }}</td>
                      <td><span class="font-bold text-emerald-600">\${{ p.amount | number:'1.2-2' }}</span></td>
                      <td>{{ p.paymentMethod }}</td>
                      <td><p-tag [value]="p.status" [severity]="p.status === 'Paid' ? 'success' : 'warn'"></p-tag></td>
                      <td><span class="text-xs text-muted-color">{{ p.date }}</span></td>
                    </tr>
                  </ng-template>
                  <ng-template #emptymessage>
                    <tr><td colspan="6" class="text-center p-6 text-muted-color">No payment records found.</td></tr>
                  </ng-template>
                </p-table>
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
  private dataService = inject(CycleDataService);

  customer: Customer | null = null;
  customerBicycles: Bicycle[] = [];
  customerTickets: ServiceTicket[] = [];
  customerAppointments: Appointment[] = [];
  customerPayments: PaymentRecord[] = [];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadCustomer(id);
      }
    });
  }

  loadCustomer(id: string): void {
    const cust = this.dataService.customers().find(c => c.id === id);
    if (cust) {
      this.customer = cust;
      this.customerBicycles = this.dataService.bicycles().filter(b => b.customerId === id);
      this.customerTickets = this.dataService.tickets().filter(t => t.customerId === id);
      this.customerAppointments = this.dataService.appointments().filter(a => a.customerId === id);
      this.customerPayments = this.dataService.payments().filter(p => p.customerId === id);
    }
  }

  get totalSpent(): number {
    return this.customerPayments
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + p.amount, 0);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }
}
