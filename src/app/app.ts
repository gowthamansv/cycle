import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { PosthogService } from './services/posthog.service';
import { AuthService } from './common/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('admin-cy');

  constructor(
    private posthogService: PosthogService,
    private authService: AuthService,
    private router: Router
  ) {
    // Restore PostHog identity if an authenticated session survived browser refresh
    this.authService.syncAnalyticsIdentity();

    // Start centralized Angular Router NavigationEnd page view tracking
    this.posthogService.startRouteTracking(this.router, () =>
      this.authService.getAnalyticsContext()
    );
  }
}
