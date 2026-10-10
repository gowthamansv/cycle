import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';

export type NotificationType = 'success' | 'info' | 'warn' | 'error';

export interface NotificationPayload {
  severity: NotificationType;
  summary: string;
  detail?: string;
  key?: string;
  life?: number;
  sticky?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AppNotificationService {
  private messageService = inject(MessageService);

  // Deduplication cache: key -> timestamp (ms)
  private recentMessages = new Map<string, number>();
  private readonly DEDUPE_WINDOW_MS = 1500;

  /**
   * Display a success toast
   */
  showSuccess(summary: string, detail?: string, life: number = 4000): void {
    this.notify({
      severity: 'success',
      summary: summary || 'Success',
      detail,
      life,
    });
  }

  /**
   * Display an error toast with user-friendly text
   */
  showError(summary: string, detail?: string, life: number = 5000): void {
    this.notify({
      severity: 'error',
      summary: summary || 'Error',
      detail: detail || 'An unexpected issue occurred. Please try again.',
      life,
    });
  }

  /**
   * Display a warning toast
   */
  showWarning(summary: string, detail?: string, life: number = 4500): void {
    this.notify({
      severity: 'warn',
      summary: summary || 'Warning',
      detail,
      life,
    });
  }

  /**
   * Display an informational toast
   */
  showInfo(summary: string, detail?: string, life: number = 4000): void {
    this.notify({
      severity: 'info',
      summary: summary || 'Information',
      detail,
      life,
    });
  }

  /**
   * Contextual helper for CRUD operation success
   */
  showApiSuccess(
    action: 'create' | 'update' | 'delete' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | string,
    resourceName: string,
    detail?: string
  ): void {
    const act = action.toLowerCase();
    const formattedResource = this.formatResourceName(resourceName);
    let summary = `${formattedResource} Updated`;
    let defaultDetail = `${formattedResource} updated successfully.`;

    if (act === 'create' || act === 'post') {
      summary = `${formattedResource} Created`;
      defaultDetail = `${formattedResource} created successfully.`;
    } else if (act === 'update' || act === 'put' || act === 'patch') {
      summary = `${formattedResource} Updated`;
      defaultDetail = `${formattedResource} updated successfully.`;
    } else if (act === 'delete') {
      summary = `${formattedResource} Deleted`;
      defaultDetail = `${formattedResource} deleted successfully.`;
    }

    this.showSuccess(summary, detail || defaultDetail);
  }

  /**
   * Contextual helper to parse and present clean API errors without exposing database traces or stack errors
   */
  handleApiError(operation: string, error: any, customFallback?: string): void {
    const formattedOp = this.formatOperationName(operation);
    const summary = `Unable to ${formattedOp}`;
    const userMessage = this.extractFriendlyErrorMessage(error, customFallback);

    this.showError(summary, userMessage);
  }

  /**
   * Primary dispatcher with built-in deduplication
   */
  notify(payload: NotificationPayload): void {
    const key = `${payload.severity}:${payload.summary}:${payload.detail || ''}`;
    const now = Date.now();
    const lastEmitted = this.recentMessages.get(key);

    if (lastEmitted && now - lastEmitted < this.DEDUPE_WINDOW_MS) {
      // Suppress duplicate notification
      return;
    }

    this.recentMessages.set(key, now);
    this.cleanupOldKeys(now);

    this.messageService.add({
      severity: payload.severity,
      summary: payload.summary,
      detail: payload.detail,
      life: payload.life ?? 4000,
      sticky: payload.sticky ?? false,
      closable: true,
    });
  }

  /**
   * Clean up old deduplication cache entries
   */
  private cleanupOldKeys(now: number): void {
    for (const [key, timestamp] of this.recentMessages.entries()) {
      if (now - timestamp > this.DEDUPE_WINDOW_MS * 2) {
        this.recentMessages.delete(key);
      }
    }
  }

  /**
   * Extracts clean, human-readable error messages and filters out technical jargon
   */
  private extractFriendlyErrorMessage(error: any, fallback?: string): string {
    if (!error) {
      return fallback || 'Please check your connection and try again.';
    }

    // Network disconnection / server unreachable
    if (error.status === 0 || error.name === 'TimeoutError') {
      return 'Unable to connect to the server. Please check your network connection.';
    }

    // 401 Unauthorized
    if (error.status === 401) {
      return 'Your session has expired. Please sign in again.';
    }

    // 403 Forbidden
    if (error.status === 403) {
      return 'You do not have permission to perform this action.';
    }

    // 404 Not Found
    if (error.status === 404) {
      return 'The requested record or resource was not found.';
    }

    // 400 / 422 Validation Errors
    if (error.status === 400 || error.status === 422) {
      if (typeof error.error === 'string' && !this.isRawServerTrace(error.error)) {
        return error.error;
      }
      if (error.error?.message && !this.isRawServerTrace(error.error.message)) {
        return error.error.message;
      }
      if (error.error?.errors && typeof error.error.errors === 'object') {
        const firstKey = Object.keys(error.error.errors)[0];
        const val = error.error.errors[firstKey];
        if (Array.isArray(val) && val.length > 0) {
          return val[0];
        }
      }
      return 'Please check the highlighted form fields and try again.';
    }

    // 409 Conflict
    if (error.status === 409) {
      return error.error?.message || 'A record with similar details already exists.';
    }

    // Server errors (500+)
    if (error.status >= 500) {
      return 'The server encountered an issue processing your request. Please try again later.';
    }

    // Direct string or error object inspection
    if (typeof error === 'string' && !this.isRawServerTrace(error)) {
      return error;
    }

    if (error.message && typeof error.message === 'string' && !this.isRawServerTrace(error.message)) {
      return error.message;
    }

    return fallback || 'Please verify your input and try again.';
  }

  /**
   * Checks if an error string contains internal database, framework, or stack trace artifacts
   */
  private isRawServerTrace(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    const lower = text.toLowerCase();
    return (
      lower.includes('npgsql') ||
      lower.includes('postgres') ||
      lower.includes('sql') ||
      lower.includes('exception') ||
      lower.includes('stacktrace') ||
      lower.includes('nullreference') ||
      lower.includes('internal server error') ||
      lower.includes('object reference') ||
      lower.includes('at system.') ||
      lower.includes('at microsoft.')
    );
  }

  private formatResourceName(name: string): string {
    if (!name) return 'Record';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  private formatOperationName(op: string): string {
    if (!op) return 'complete operation';
    return op.toLowerCase();
  }
}
