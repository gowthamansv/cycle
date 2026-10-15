import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
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
        // Detect 401 Unauthorized
        // Identify auth endpoints and login page routes to avoid intercepting legitimate login failures
        const isAuthEndpoint =
          req.url.includes('/auth/login') ||
          req.url.includes('/api/auth/login') ||
          req.url.includes('api/test/jwt');

        const currentRoute = router.url || '';
        const isLoginRoute =
          currentRoute.includes('/admin/login') ||
          currentRoute.includes('/login') ||
          currentRoute.includes('/auth/login');

        // Only trigger session expiration if this is an authenticated call (or user was logged in)
        // and is not a login attempt
        if (!isAuthEndpoint && !isLoginRoute && (authService.isAuthenticated() || !!token)) {
          authService.handleSessionExpired();
        }
      }
      return throwError(() => error);
    })
  );
};
