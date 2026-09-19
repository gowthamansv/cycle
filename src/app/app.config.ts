import { ApplicationConfig, provideAppInitializer, provideBrowserGlobalErrorListeners, inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { BicyclePreset } from './theme/bicycle-theme.preset';
import { ThemeService } from './theme/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: BicyclePreset,
        options: {
          darkModeSelector: '.app-dark',
        },
      },
    }),
    provideAppInitializer(() => {
      const themeService = inject(ThemeService);
      themeService.initTheme();
    }),
  ],
};
