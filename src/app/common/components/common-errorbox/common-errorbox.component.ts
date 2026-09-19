import { Component, inject, input, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-common-errorbox',
    imports: [ButtonModule],
    templateUrl: './common-errorbox.component.html',
    styleUrl: './common-errorbox.component.scss',
})
export class CommonErrorboxComponent {
    private ref = inject(DynamicDialogRef);

    error = input.required<any>();
    message = signal<string[]>([]);

    onYes() {
        this.ref.close();
    }
    ngOnInit() {
        if (this.error()) {
            this.geterror(this.error());
        }
    }

    geterror(error: any) {
        const serverErrors = error?.error?.Errors;
        const messages: string[] = [];

        if (serverErrors && typeof serverErrors === 'object') {
            for (const key in serverErrors) {
                if (Array.isArray(serverErrors[key])) {
                    messages.push(...serverErrors[key]);
                }
            }
        }

        const uniqueMessages = [...new Set(messages)];
        this.message.set(uniqueMessages);
    }
}
