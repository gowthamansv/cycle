import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AppConfigService } from '../app.config.service';
import {
  Cycle,
  CreateCycleRequest,
  CreateCycleResponse,
  CycleServiceInfoResponse
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class CycleService {
  private http = inject(HttpClient);
  private configService = inject(AppConfigService);

  cycles = signal<Cycle[]>([]);
  isLoading = signal<boolean>(false);

  private get baseUrl(): string {
    return this.configService.apiUrl;
  }

  /**
   * GET /api/cycles
   */
  getCycles(): Observable<Cycle[]> {
    this.isLoading.set(true);
    return this.http.get<Cycle[]>(`${this.baseUrl}api/cycles`).pipe(
      tap({
        next: (data) => {
          this.cycles.set(data ?? []);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      })
    );
  }

  /**
   * POST /api/cycles
   */
  createCycle(req: CreateCycleRequest): Observable<CreateCycleResponse> {
    return this.http.post<CreateCycleResponse>(`${this.baseUrl}api/cycles`, req);
  }

  /**
   * GET /api/cycles/{cycleId}/service-info
   */
  getCycleServiceInfo(cycleId: string): Observable<CycleServiceInfoResponse> {
    return this.http.get<CycleServiceInfoResponse>(`${this.baseUrl}api/cycles/${cycleId}/service-info`);
  }
}
