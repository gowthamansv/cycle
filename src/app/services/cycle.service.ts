import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from '../app.config.service';
import {
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

  /**
   * Status indicator for GET /api/cycles:
   * Backend endpoint is currently NOT AVAILABLE.
   */
  readonly isGetAvailable = false;

  private get baseUrl(): string {
    return this.configService.apiUrl;
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
