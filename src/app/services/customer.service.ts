import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from '../app.config.service';
import {
  CreateCustomerRequest,
  CreateCustomerResponse
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private configService = inject(AppConfigService);

  /**
   * Status indicator for GET /api/customers:
   * Backend endpoint is currently NOT AVAILABLE.
   */
  readonly isGetAvailable = false;

  private get baseUrl(): string {
    return this.configService.apiUrl;
  }

  /**
   * POST /api/customers
   */
  createCustomer(req: CreateCustomerRequest): Observable<CreateCustomerResponse> {
    return this.http.post<CreateCustomerResponse>(`${this.baseUrl}api/customers`, req);
  }
}
