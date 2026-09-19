import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DragDropModule } from 'primeng/dragdrop';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUpload } from 'primeng/fileupload';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Menu } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressSpinner } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { SplitButtonModule } from 'primeng/splitbutton';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ColumnPicklistComponent } from '../column-picklist/column-picklist.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { tableOptions } from '../../constant/tableOptions';
import { acceptedImageTypes } from '../../constant/imageExtention';

@Component({
  selector: 'app-custom-table',
  imports: [
    CardModule,
    TableModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ButtonModule,
    SkeletonModule,
    Menu,
    ProgressSpinner,
    ToolbarModule,
    SplitButtonModule,
    FormsModule,
    CommonModule,
    DragDropModule,
    MultiSelectModule,
    DatePipe,
    FileUpload,
    TagModule,
    TooltipModule,
    TranslatePipe,
  ],
  templateUrl: './custom-table.component.html',
  styleUrl: './custom-table.component.scss',
  providers: [DialogService],
})
export class CustomTableComponent {
  private translate = inject(TranslateService);
  columns = input.required<any[]>();
  title = input.required<string>();
  data = input<any[]>([]);
  dataKey = input.required<string>();
  enableExport = input<boolean>(true);
  loading = input(false);
  customHeaderTemplate = input<TemplateRef<any>>();
  customBodyTemplate = input<TemplateRef<any>>();
  customActionTemplate = input<TemplateRef<any>>();
  enableCreate = input<boolean>(true);
  enableEdit = input<boolean>(true);
  enableDelete = input<boolean>(true);
  selectionMode = input<'multiple' | 'single' | null | undefined>(null);
  getImageDataFn = input<(data: any) => any>();
  selectedData = model<any>([]);
  refresh = output<void>();
  dataKeyClick = output<any>();
  create = output<void>();
  edit = output<any>();
  delete = output<any>();
  fileSelect = output<any>();
  exportExcel = output<void>();
  openImage = output<any>();

  searchInput = signal<string | undefined>(undefined);
  dt = viewChild.required<Table>('dt');
  globalFilterColumns = computed(() => this.columns().map((x) => x.field));
  tableEmptyMessage = signal('No data to display.');
  tableOptions = signal(tableOptions);
  visibleColumns = linkedSignal(() => this.columns());
  invisibleColumns = linkedSignal(() => {
    if (this.visibleColumns().length > 0) {
      return this.columns().filter(
        (column) => !this.visibleColumns().some((x: any) => x.field === column.field),
      );
    } else {
      return this.columns();
    }
  });

  exportTypes: MenuItem[] = [
    {
      label: 'Excel',
      command: () => this.exportExcel.emit(),
    },
    {
      label: 'CSV',
      command: () => this.exportCSV(),
    },
  ];

  validImageType(params: string) {
    return acceptedImageTypes.includes(params);
  }
  ref: DynamicDialogRef | null | undefined;
  private dialogService = inject(DialogService);

  globalFilter(event: Event) {
    const eventValue = (event.target as HTMLInputElement).value;
    this.dt().filterGlobal(eventValue, 'contains');
  }
  clear() {
    this.dt().clear();
    this.searchInput.set(undefined);
  }
  refreshData() {
    this.clear();
    this.refresh.emit();
  }
  exportCSV() {
    this.dt().exportCSV();
  }

  options(field: string) {
    const uniqueValues = new Set(this.data().map((x: any) => x[field]));
    return Array.from(uniqueValues).map((status) => ({
      value: status,
      label: status,
    }));
  }

  enableButtonOnSingleSelection = computed(() => (this.selectedData().length === 1 ? true : false));

  enableButtonOnOneOrMoreSelection = computed(() =>
    this.selectedData().length > 0 ? true : false,
  );

  showColumnsSettingsDialog() {
    const headertext = this.translate.instant('Column Settings');
    this.ref = this.dialogService.open(ColumnPicklistComponent, {
      inputValues: {
        selectedColumns: this.visibleColumns(),
        unSelectedColumns: this.invisibleColumns(),
      },
      header: headertext,
      closable: true,
      modal: true,
      style: { maxHeight: '40rem' },
    });
    this.ref?.onClose.subscribe((data) => {});
  }

  onEditAction(data: any) {
    this.edit.emit(data);
  }

  onDeleteAction() {
    this.delete.emit(this.selectedData());
  }

  onCreateAction() {
    this.create.emit();
  }
  onFileSelection(event: any) {
    this.fileSelect.emit(event);
  }

  onOpenImageAction(data: any) {
    this.openImage.emit(data);
  }

  onDataKeyClick(event: Event, row: any): void {
    event.preventDefault();
    this.dataKeyClick.emit(row);
  }

  getImageData(data: any) {
    if (this.getImageDataFn()) {
      return this.getImageDataFn()!(data);
    } else {
      return 'assets/img/noImage.png';
    }
  }
}
