import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from '../app.config.service';
import {
  CreateUserRequest,
  CreateUserResponse
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private configService = inject(AppConfigService);

  private get baseUrl(): string {
    return this.configService.apiUrl;
  }

  /**
   * POST /api/users
   */
  createUser(req: CreateUserRequest): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(`${this.baseUrl}api/users`, req);
  }
}
