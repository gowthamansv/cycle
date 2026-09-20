import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CycleDataService } from '../../services/cycle-data.service';
import { PaymentRecord } from '../../models/cycle-management.models';

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="flex flex-col gap-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">Payments & Invoices</h1>
            <span class="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              \${{ totalRevenue | number:'1.2-2' }} Total Volume
            </span>
          </div>
          <p class="text-sm text-muted-color mt-1">Transaction ledgers, customer receipts, and invoice settlements.</p>
        </div>
      </div>

      <!-- Payments Table -->
      <div class="card p-0 shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
        <p-table
          [value]="dataService.payments()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 15, 20]"
          [rowHover]="true"
          responsiveLayout="scroll"
          styleClass="p-datatable-sm"
        >
          <ng-template #header>
            <tr>
              <th style="min-width: 9rem">Invoice #</th>
              <th style="min-width: 12rem">Customer</th>
              <th style="min-width: 14rem">Service Description</th>
              <th style="min-width: 8rem">Amount</th>
              <th style="min-width: 10rem">Payment Method</th>
              <th style="min-width: 8rem">Status</th>
              <th style="min-width: 10rem">Transaction Date</th>
            </tr>
          </ng-template>

          <ng-template #body let-p>
            <tr>
              <td><span class="font-mono text-xs font-bold text-primary">{{ p.invoiceNumber }}</span></td>
              <td>
                <div class="font-semibold text-xs text-surface-900 dark:text-surface-0">{{ p.customerName }}</div>
                <div class="text-[11px] text-muted-color">ID: {{ p.customerId }}</div>
              </td>
              <td><span class="text-xs text-surface-800 dark:text-surface-200">{{ p.serviceName }}</span></td>
              <td><span class="font-bold text-sm text-surface-900 dark:text-surface-0 font-mono">\${{ p.amount | number:'1.2-2' }}</span></td>
              <td>
                <span class="text-xs px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 font-medium">
                  <i class="pi pi-credit-card mr-1 text-[10px]"></i>{{ p.paymentMethod }}
                </span>
              </td>
              <td>
                <p-tag [value]="p.status" [severity]="p.status === 'Paid' ? 'success' : 'warn'" [rounded]="true" styleClass="text-xs"></p-tag>
              </td>
              <td><span class="text-xs text-muted-color font-mono">{{ p.date }}</span></td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `
})
export class PaymentsListComponent implements OnInit {
  protected dataService = inject(CycleDataService);

  ngOnInit(): void {}

  get totalRevenue(): number {
    return this.dataService.payments()
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + p.amount, 0);
  }
}
