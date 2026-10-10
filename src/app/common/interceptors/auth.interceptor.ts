import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AppConfigService } from '../../app.config.service';
import { AppNotificationService } from '../services/notification.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const configService = inject(AppConfigService);
  const notificationService = inject(AppNotificationService);
  const router = inject(Router);

  // Determine active token
  const token = authService.token();
  let headers = req.headers;

  // If token is present and request is directed to our API backend or relative path
  if (token && !headers.has('Authorization')) {
    let cleanToken = token;
    try {
      cleanToken = token.startsWith('"') ? JSON.parse(token) : token;
    } catch {
      cleanToken = token;
    }

    headers = headers.set('Authorization', `Bearer ${cleanToken}`);
  }

  const clonedReq = req.clone({ headers });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // If 401 Unauthorized is received on an authenticated call
        if (!req.url.includes('/auth/login') && !router.url.includes('/admin/login')) {
          notificationService.showError('Session Expired', 'Your session has expired. Please sign in again.');
        }
      }
      return throwError(() => error);
    })
  );
};
