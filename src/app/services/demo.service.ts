import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AppConfigService } from '../app.config.service';
import {
  DemoRequestResponse,
  BookDemoRequest,
  BookDemoResponse
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class DemoService {
  private http = inject(HttpClient);
  private configService = inject(AppConfigService);

  demoRequests = signal<DemoRequestResponse[]>([]);
  isLoading = signal<boolean>(false);

  private get baseUrl(): string {
    return this.configService.apiUrl;
  }

  /**
   * GET /api/demo-requests
   */
  getDemoRequests(): Observable<DemoRequestResponse[]> {
    this.isLoading.set(true);
    return this.http.get<DemoRequestResponse[]>(`${this.baseUrl}api/demo-requests`).pipe(
      tap({
        next: (data) => {
          this.demoRequests.set(data || []);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      })
    );
  }

  /**
   * POST /api/demo-requests
   */
  bookDemo(req: BookDemoRequest): Observable<BookDemoResponse> {
    return this.http.post<BookDemoResponse>(`${this.baseUrl}api/demo-requests`, req);
  }
}
