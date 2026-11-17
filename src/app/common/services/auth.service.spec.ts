import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { AppConfigService } from '../../app.config.service';
import { AppNotificationService } from './notification.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

describe('AuthService & AuthInterceptor (Post-removal of /api/test/jwt)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = {
      navigate: vi.fn(),
      navigateByUrl: vi.fn(),
      url: '/dashboard'
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        AppConfigService,
        AppNotificationService,
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should authenticate admin locally without calling /api/test/jwt', () => {
    let result: any = null;

    service.loginAdmin('admin', 'admin123').subscribe({
      next: (res) => {
        result = res;
      }
    });

    // Remote login API is expected to fail or not respond; simulate failure
    const req = httpMock.expectOne((r) => r.url.includes('api/auth/login'));
    req.error(new ProgressEvent('Network error'));

    // Verify: No other request (specifically /api/test/jwt) is made!
    expect(result).toBeTruthy();
    expect(result.token).toContain('csc_jwt_token_');
    expect(result.user.role).toBe('admin');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.isAdmin()).toBe(true);
  });

  it('should authenticate standard user locally without calling /api/test/jwt', () => {
    let result: any = null;

    service.loginAdmin('user', 'user123').subscribe({
      next: (res) => {
        result = res;
      }
    });

    const req = httpMock.expectOne((r) => r.url.includes('api/auth/login'));
    req.error(new ProgressEvent('Network error'));

    expect(result).toBeTruthy();
    expect(result.token).toContain('csc_jwt_token_');
    expect(result.user.role).toBe('user');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.isAdmin()).toBe(false);
  });

  it('should reject invalid credentials with INVALID_CREDENTIALS error and never call /api/test/jwt', () => {
    let errorResult: any = null;

    service.loginAdmin('wronguser', '12').subscribe({
      next: () => {},
      error: (err) => {
        errorResult = err;
      }
    });

    const req = httpMock.expectOne((r) => r.url.includes('api/auth/login'));
    req.error(new ProgressEvent('Network error'));

    expect(errorResult).toBeTruthy();
    expect(errorResult.message).toBe('INVALID_CREDENTIALS');
  });

  it('should properly attach Authorization header in getAuthHeaders', () => {
    // Manually set token
    service.token.set('test-jwt-token-123');

    const headers = service.getAuthHeaders();
    expect(headers.get('Authorization')).toBe('Bearer test-jwt-token-123');
  });

  it('should clear token and state on logout', () => {
    service.token.set('active-token');
    expect(service.isAuthenticated()).toBe(true);

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.token()).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/login']);
  });
});
