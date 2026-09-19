import { Component, inject, input, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-common-notification',
    imports: [ButtonModule],
    templateUrl: './common-notification.component.html',
    styleUrl: './common-notification.component.scss',
})
export class CommonNotificationComponent {
    private ref = inject(DynamicDialogRef);

    message = input.required<any>();

    onYes() {
        this.ref.close();
    }
}
