import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { CycleDataService } from '../../services/cycle-data.service';
import { InventoryItem } from '../../models/cycle-management.models';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
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
            <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">Workshop Inventory & Parts</h1>
            <span class="text-xs px-2.5 py-1 rounded-full font-semibold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
              {{ dataService.inventory().length }} SKUs
            </span>
          </div>
          <p class="text-sm text-muted-color mt-1">Manage workshop spare parts, oils, brake pads, chains and consumables.</p>
        </div>
      </div>

      <!-- Inventory Table -->
      <div class="card p-0 shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
        <p-table
          [value]="filteredInventory"
          [paginator]="true"
          [rows]="10"
          [rowHover]="true"
          responsiveLayout="scroll"
          styleClass="p-datatable-sm"
        >
          <ng-template #header>
            <tr>
              <th style="min-width: 9rem">SKU</th>
              <th style="min-width: 14rem">Part / Item Name</th>
              <th style="min-width: 10rem">Category</th>
              <th style="min-width: 7rem" class="text-center">Stock Level</th>
              <th style="min-width: 7rem" class="text-center">Reorder Lvl</th>
              <th style="min-width: 7.5rem">Unit Price</th>
              <th style="min-width: 12rem">Supplier</th>
              <th style="min-width: 8rem">Status</th>
              <th style="min-width: 6rem" class="text-center">Quick Action</th>
            </tr>
          </ng-template>

          <ng-template #body let-item>
            <tr>
              <td><span class="font-mono text-xs font-bold text-primary">{{ item.sku }}</span></td>
              <td>
                <div class="font-semibold text-xs text-surface-900 dark:text-surface-0">{{ item.name }}</div>
                <div class="text-[11px] text-muted-color">Restocked: {{ item.lastRestocked }}</div>
              </td>
              <td><span class="text-xs px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 font-medium">{{ item.category }}</span></td>
              <td class="text-center">
                <span class="font-bold text-xs" [ngClass]="item.stock <= item.reorderLevel ? 'text-red-500 font-mono' : 'text-surface-800 dark:text-surface-200'">
                  {{ item.stock }}
                </span>
              </td>
              <td class="text-center"><span class="text-xs text-muted-color font-mono">{{ item.reorderLevel }}</span></td>
              <td><span class="font-bold text-xs text-surface-900 dark:text-surface-0 font-mono">\${{ item.unitPrice | number:'1.2-2' }}</span></td>
              <td><span class="text-xs text-muted-color">{{ item.supplier }}</span></td>
              <td>
                <p-tag [value]="item.status" [severity]="item.status === 'In Stock' ? 'success' : 'danger'" [rounded]="true" styleClass="text-xs"></p-tag>
              </td>
              <td class="text-center">
                <p-button icon="pi pi-plus" [rounded]="true" [text]="true" size="small" pTooltip="Quick Restock +10" (click)="restock(item)"></p-button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `
})
export class InventoryListComponent implements OnInit {
  protected dataService = inject(CycleDataService);
  private messageService = inject(MessageService);

  ngOnInit(): void {}

  get filteredInventory(): InventoryItem[] {
    return this.dataService.inventory();
  }

  restock(item: InventoryItem): void {
    item.stock += 10;
    item.status = 'In Stock';
    this.messageService.add({
      severity: 'success',
      summary: 'Restocked',
      detail: `Added 10 units to ${item.name}.`
    });
  }
}
