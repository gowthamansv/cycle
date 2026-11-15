import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../../services/ticket.service';
import { MiscService } from '../../../services/misc.service';

@Component({
  selector: 'app-stats-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
      <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700 hover:shadow-md transition-shadow">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-2 text-sm uppercase tracking-wider">Total Tickets</span>
            <div class="text-surface-900 dark:text-surface-0 font-bold text-3xl">
              <ng-container *ngIf="!ticketService.isLoading(); else loadingTickets">
                {{ totalTicketsCount() }}
              </ng-container>
              <ng-template #loadingTickets>
                <i class="pi pi-spin pi-spinner text-2xl text-muted-color"></i>
              </ng-template>
            </div>
          </div>
          <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-950/60 rounded-xl" style="width: 2.75rem; height: 2.75rem">
            <i class="pi pi-wrench text-orange-600 dark:text-orange-400 text-xl"></i>
          </div>
        </div>
        <div class="flex items-center text-xs">
          <span class="text-orange-600 dark:text-orange-400 font-semibold flex items-center mr-1">
            <i class="pi pi-database text-xs mr-0.5"></i>GET /api/tickets
          </span>
          <span class="text-muted-color">total registered</span>
        </div>
      </div>
    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
      <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700 hover:shadow-md transition-shadow">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-2 text-sm uppercase tracking-wider">Pending Services</span>
            <div class="text-surface-900 dark:text-surface-0 font-bold text-3xl">
              <ng-container *ngIf="!ticketService.isLoading(); else loadingPending">
                {{ pendingServicesCount() }}
              </ng-container>
              <ng-template #loadingPending>
                <i class="pi pi-spin pi-spinner text-2xl text-muted-color"></i>
              </ng-template>
            </div>
          </div>
          <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-950/60 rounded-xl" style="width: 2.75rem; height: 2.75rem">
            <i class="pi pi-clock text-blue-600 dark:text-blue-400 text-xl"></i>
          </div>
        </div>
        <div class="flex items-center text-xs">
          <span class="text-blue-600 dark:text-blue-400 font-semibold mr-1">Active repair queue</span>
          <span class="text-muted-color">in workshop</span>
        </div>
      </div>
    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
      <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700 hover:shadow-md transition-shadow">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-2 text-sm uppercase tracking-wider">Completed Services</span>
            <div class="text-surface-900 dark:text-surface-0 font-bold text-3xl">
              <ng-container *ngIf="!ticketService.isLoading(); else loadingCompleted">
                {{ completedServicesCount() }}
              </ng-container>
              <ng-template #loadingCompleted>
                <i class="pi pi-spin pi-spinner text-2xl text-muted-color"></i>
              </ng-template>
            </div>
          </div>
          <div class="flex items-center justify-center bg-emerald-100 dark:bg-emerald-950/60 rounded-xl" style="width: 2.75rem; height: 2.75rem">
            <i class="pi pi-check-circle text-emerald-600 dark:text-emerald-400 text-xl"></i>
          </div>
        </div>
        <div class="flex items-center text-xs">
          <span class="text-emerald-600 dark:text-emerald-400 font-semibold mr-1">Completed status</span>
          <span class="text-muted-color">ready / delivered</span>
        </div>
      </div>
    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
      <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700 hover:shadow-md transition-shadow">
        <div class="flex justify-between mb-4">
          <div>
            <span class="block text-muted-color font-medium mb-2 text-sm uppercase tracking-wider">Total Customers</span>
            <div class="text-surface-900 dark:text-surface-0 font-bold text-3xl">
              <ng-container *ngIf="!miscService.isLoading(); else loadingCustomers">
                {{ totalCustomersCount() }}
              </ng-container>
              <ng-template #loadingCustomers>
                <i class="pi pi-spin pi-spinner text-2xl text-muted-color"></i>
              </ng-template>
            </div>
          </div>
          <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-950/60 rounded-xl" style="width: 2.75rem; height: 2.75rem">
            <i class="pi pi-users text-purple-600 dark:text-purple-400 text-xl"></i>
          </div>
        </div>
        <div class="flex items-center text-xs">
          <span class="text-purple-600 dark:text-purple-400 font-semibold flex items-center mr-1">
            <i class="pi pi-database text-xs mr-0.5"></i>/api/misc/customers
          </span>
          <span class="text-muted-color">registered clients</span>
        </div>
      </div>
    </div>
  `
})
export class StatsWidget {
  protected ticketService = inject(TicketService);
  protected miscService = inject(MiscService);

  totalTicketsCount = computed(() => this.ticketService.tickets().length);

  pendingServicesCount = computed(() => {
    return this.ticketService.tickets().filter((t) => {
      const s = (t.status || '').toLowerCase();
      return s !== 'completed' && s !== 'closed';
    }).length;
  });

  completedServicesCount = computed(() => {
    return this.ticketService.tickets().filter((t) => {
      const s = (t.status || '').toLowerCase();
      return s === 'completed' || s === 'closed';
    }).length;
  });

  totalCustomersCount = computed(() => this.miscService.customers().length);
}
