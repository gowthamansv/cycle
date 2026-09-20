import { ApplicationConfig, provideAppInitializer, provideBrowserGlobalErrorListeners, inject } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { BicyclePreset } from './theme/bicycle-theme.preset';
import { ThemeService } from './theme/theme.service';
import { AppConfigService } from './app.config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
    provideRouter(routes),
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

      themeService.initTheme();
      await appConfigService.loadAppConfig();
    }),
  ],
};
