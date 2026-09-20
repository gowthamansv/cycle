import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  // If user is authenticated but not an admin, or completely unauthenticated
  const targetUrl = state.url;
  return router.createUrlTree(['/admin/login'], {
    queryParams: targetUrl && targetUrl !== '/' ? { returnUrl: targetUrl } : undefined,
  });
};
