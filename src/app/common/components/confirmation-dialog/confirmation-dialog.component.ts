import { Component, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-user-form',
    imports: [
        ReactiveFormsModule,
        InputTextModule,
        ButtonModule,
        CheckboxModule,
        TranslatePipe,
    ],
    templateUrl: './confirmation-dialog.component.html',
    styleUrl: './confirmation-dialog.component.scss',
})
export class ConfirmationDialogComponent {
    message = input.required<string>();
    private ref = inject(DynamicDialogRef);

    onYes() {
        this.ref.close(true);
    }
    onCancel() {
        this.ref.close(false);
    }
}
