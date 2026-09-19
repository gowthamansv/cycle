import {
    CdkDragDrop,
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    moveItemInArray,
    transferArrayItem,
} from '@angular/cdk/drag-drop';

import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { PickListModule } from 'primeng/picklist';

@Component({
    selector: 'app-column-picklist',
    imports: [
        PickListModule,
        CdkDrag,
        CdkDropList,
        CdkDropListGroup,
        ButtonModule,
        TranslatePipe,
    ],
    templateUrl: './column-picklist.component.html',
    styleUrl: './column-picklist.component.scss',
})
export class ColumnPicklistComponent {
    selectedColumns = input.required<any>();
    unSelectedColumns = input.required<any>();

    ngOnInit() {}
    drop(event: CdkDragDrop<string[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(
                event.container.data,
                event.previousIndex,
                event.currentIndex,
            );
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex,
            );
        }
    }
}
