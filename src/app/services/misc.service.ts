import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, tap, shareReplay, catchError } from 'rxjs';
import { AppConfigService } from '../app.config.service';
import { AppNotificationService } from '../common/services/notification.service';
import {
  MiscRole,
  MiscUser,
  MiscStatus,
  MiscPriority,
  MiscGroup,
  MiscCustomer
} from '../models/api.models';

export interface MiscLookups {
  roles: MiscRole[];
  users: MiscUser[];
  statuses: MiscStatus[];
  priorities: MiscPriority[];
  groups: MiscGroup[];
  customers: MiscCustomer[];
}

@Injectable({
  providedIn: 'root'
})
export class MiscService {
  private http = inject(HttpClient);
  private configService = inject(AppConfigService);
  private notificationService = inject(AppNotificationService);

  // Reactive state signals
  roles = signal<MiscRole[]>([]);
  users = signal<MiscUser[]>([]);
  statuses = signal<MiscStatus[]>([]);
  priorities = signal<MiscPriority[]>([]);
  groups = signal<MiscGroup[]>([]);
  customers = signal<MiscCustomer[]>([]);
  isLoading = signal<boolean>(false);

  private get baseUrl(): string {
    return this.configService.apiUrl;
  }

  /**
   * GET /api/misc/roles
   */
  getRoles(): Observable<MiscRole[]> {
    return this.http.get<MiscRole[]>(`${this.baseUrl}api/misc/roles`).pipe(
      tap((data) => this.roles.set(data || [])),
      catchError((err) => {
        this.notificationService.handleApiError('load user roles', err, 'Unable to load user roles. Please try again.');
        return of(this.roles());
      }),
      shareReplay(1)
    );
  }

  /**
   * GET /api/misc/users
   */
  getUsers(): Observable<MiscUser[]> {
    return this.http.get<MiscUser[]>(`${this.baseUrl}api/misc/users`).pipe(
      tap((data) => this.users.set(data || [])),
      catchError((err) => {
        this.notificationService.handleApiError('load system users', err, 'Unable to load users list. Please try again.');
        return of(this.users());
      }),
      shareReplay(1)
    );
  }

  /**
   * GET /api/misc/statuses
   */
  getStatuses(): Observable<MiscStatus[]> {
    return this.http.get<MiscStatus[]>(`${this.baseUrl}api/misc/statuses`).pipe(
      tap((data) => this.statuses.set(data || [])),
      catchError((err) => {
        this.notificationService.handleApiError('load ticket statuses', err, 'Unable to load service status options.');
        return of(this.statuses());
      }),
      shareReplay(1)
    );
  }

  /**
   * GET /api/misc/priorities
   */
  getPriorities(): Observable<MiscPriority[]> {
    return this.http.get<MiscPriority[]>(`${this.baseUrl}api/misc/priorities`).pipe(
      tap((data) => this.priorities.set(data || [])),
      catchError((err) => {
        this.notificationService.handleApiError('load priority options', err, 'Unable to load ticket priority options.');
        return of(this.priorities());
      }),
      shareReplay(1)
    );
  }

  /**
   * GET /api/misc/groups
   */
  getGroups(): Observable<MiscGroup[]> {
    return this.http.get<MiscGroup[]>(`${this.baseUrl}api/misc/groups`).pipe(
      tap((data) => this.groups.set(data || [])),
      catchError((err) => {
        this.notificationService.handleApiError('load user groups', err, 'Unable to load user groups.');
        return of(this.groups());
      }),
      shareReplay(1)
    );
  }

  /**
   * GET /api/misc/customers
   */
  getCustomers(): Observable<MiscCustomer[]> {
    return this.http.get<MiscCustomer[]>(`${this.baseUrl}api/misc/customers`).pipe(
      tap((data) => this.customers.set(data || [])),
      catchError((err) => {
        this.notificationService.handleApiError('load customer lookups', err, 'Unable to load customer lookups.');
        return of(this.customers());
      }),
      shareReplay(1)
    );
  }

  /**
   * Aggregated loader for all lookup data
   */
  loadAllLookups(): Observable<MiscLookups> {
    this.isLoading.set(true);
    return forkJoin({
      roles: this.getRoles(),
      users: this.getUsers(),
      statuses: this.getStatuses(),
      priorities: this.getPriorities(),
      groups: this.getGroups(),
      customers: this.getCustomers()
    }).pipe(
      tap(() => this.isLoading.set(false)),
      catchError((err) => {
        this.isLoading.set(false);
        this.notificationService.handleApiError('load system lookups', err, 'Unable to load option lists. Please try again.');
        return of({
          roles: this.roles(),
          users: this.users(),
          statuses: this.statuses(),
          priorities: this.priorities(),
          groups: this.groups(),
          customers: this.customers()
        });
      })
    );
  }
}
