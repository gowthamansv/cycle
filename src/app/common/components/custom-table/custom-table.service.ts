import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CustomTableService {
    loadPageVariable = signal<string>('');
}
