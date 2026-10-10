import { ApplicationConfig, provideAppInitializer, provideBrowserGlobalErrorListeners, inject } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';

import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { BicyclePreset } from './theme/bicycle-theme.preset';
import { ThemeService } from './theme/theme.service';
import { AppConfigService } from './app.config.service';
import { authInterceptor } from './common/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideRouter(routes),
    MessageService,
    providePrimeNG({
      theme: {
        preset: BicyclePreset,
        options: {
          darkModeSelector: '.app-dark',
        },
      },
    }),
    provideAppInitializer(async () => {
      const themeService = inject(ThemeService);
      const appConfigService = inject(AppConfigService);

      themeService.initializeTheme();
      await appConfigService.loadAppConfig();
    }),
  ],
};
