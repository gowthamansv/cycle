import { Component, signal, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-spinner',
    imports: [],
    templateUrl: './loading.component.html',
    styleUrl: './loading.component.scss',
})
export class LoadingComponent {
    loading = signal<boolean>(false);

    setLoading(loading: boolean) {
        this.loading.set(loading);
    }
}
