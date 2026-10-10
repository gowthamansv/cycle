import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AppConfigService } from '../app.config.service';
import {
  TicketResponseDto,
  CreateTicketRequest,
  CreateTicketResponse,
  UpdateTicketRequest,
  UpdateTicketResponse,
  AssignedTicketResponseDto
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private http = inject(HttpClient);
  private configService = inject(AppConfigService);

  tickets = signal<TicketResponseDto[]>([]);
  isLoading = signal<boolean>(false);

  private get baseUrl(): string {
    return this.configService.apiUrl;
  }

  /**
   * GET /api/tickets
   */
  getTickets(): Observable<TicketResponseDto[]> {
    this.isLoading.set(true);
    return this.http.get<TicketResponseDto[]>(`${this.baseUrl}api/tickets`).pipe(
      tap({
        next: (data) => {
          this.tickets.set(data || []);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      })
    );
  }

  /**
   * GET /api/tickets/{ticketId}
   */
  getTicketById(ticketId: string): Observable<TicketResponseDto> {
    return this.http.get<TicketResponseDto>(`${this.baseUrl}api/tickets/${ticketId}`);
  }

  /**
   * GET /api/tickets/assigned
   */
  getAssignedTickets(): Observable<AssignedTicketResponseDto[]> {
    return this.http.get<AssignedTicketResponseDto[]>(`${this.baseUrl}api/tickets/assigned`);
  }

  /**
   * POST /api/tickets
   */
  createTicket(req: CreateTicketRequest): Observable<CreateTicketResponse> {
    return this.http.post<CreateTicketResponse>(`${this.baseUrl}api/tickets`, req).pipe(
      tap(() => {
        // Refresh ticket list after creation
        this.getTickets().subscribe();
      })
    );
  }

  /**
   * PUT /api/tickets/{ticketId}
   */
  updateTicket(ticketId: string, req: UpdateTicketRequest): Observable<UpdateTicketResponse> {
    return this.http.put<UpdateTicketResponse>(`${this.baseUrl}api/tickets/${ticketId}`, req).pipe(
      tap((updated) => {
        // Update local signal list
        this.tickets.update((list) =>
          list.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  statusId: updated.statusId,
                  priorityId: updated.priorityId,
                  assigneeId: updated.assigneeId,
                  contactPhone: updated.contactPhone,
                  contactEmail: updated.contactEmail,
                  description: updated.description,
                  updatedAt: updated.updatedAt
                }
              : t
          )
        );
      })
    );
  }
}
