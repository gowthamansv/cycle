import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AppConfigService } from '../app.config.service';
import {
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  UserResponse
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private configService = inject(AppConfigService);

  users = signal<UserResponse[]>([]);
  isLoading = signal<boolean>(false);

  private get baseUrl(): string {
    return this.configService.apiUrl;
  }

  /**
   * GET /api/users
   * Retrieves all technicians/staff members from the backend.
   */
  getUsers(): Observable<UserResponse[]> {
    this.isLoading.set(true);
    return this.http.get<UserResponse[]>(`${this.baseUrl}api/users`).pipe(
      tap({
        next: (data) => {
          this.users.set(data || []);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      })
    );
  }

  /**
   * POST /api/users
   * Registers a new technician/staff member.
   */
  createUser(req: CreateUserRequest): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(`${this.baseUrl}api/users`, req);
  }

  /**
   * PUT /api/users/{id}
   * Updates an existing technician/staff member.
   */
  updateUser(id: string, req: UpdateUserRequest): Observable<UpdateUserResponse> {
    return this.http.put<UpdateUserResponse>(`${this.baseUrl}api/users/${id}`, req);
  }

  /**
   * DELETE /api/users/{id}
   * Removes a technician/staff member by ID.
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}api/users/${id}`).pipe(
      tap(() => {
        this.users.update((current) => current.filter((u) => u.id !== id));
      })
    );
  }
}
