import { Injectable, PLATFORM_ID, inject, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { updatePrimaryPalette } from '@primeuix/themes';
import {
  ColorOption,
  PRIMARY_COLOR_OPTIONS,
  PRIMARY_COLOR_PALETTES,
} from './bicycle-theme.preset';

export interface ThemeSettings {
  themeMode: 'light' | 'dark';
  primaryColor: string;
}

const THEME_STORAGE_KEY = 'cycle-theme';
const SETTINGS_STORAGE_KEY = 'bicycle_theme_settings';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);

  // Reactive state signals
  themeMode = signal<'light' | 'dark'>('dark');
  primaryColor = signal<string>('orange');
  isSettingsOpen = signal<boolean>(false);

  // Computed helpers
  isDark = computed(() => this.themeMode() === 'dark');
  colorOptions: ColorOption[] = PRIMARY_COLOR_OPTIONS;

  constructor() {
    this.initTheme();
  }

  /**
   * Initializes theme on app startup from localStorage or defaults to dark
   */
  initTheme(): void {
    this.initializeTheme();
  }

  initializeTheme(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    let resolvedMode: 'light' | 'dark' = 'dark';
    let resolvedColor = 'orange';

    try {
      // 1. Check primary key 'cycle-theme'
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        resolvedMode = savedTheme;
      } else {
        // Fallback to legacy settings key
        const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (savedSettings) {
          const parsed: ThemeSettings = JSON.parse(savedSettings);
          if (parsed.themeMode === 'light') {
            resolvedMode = 'light';
          }
          if (parsed.primaryColor && PRIMARY_COLOR_PALETTES[parsed.primaryColor]) {
            resolvedColor = parsed.primaryColor;
          }
        }
      }

      // Check color settings if exists
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const parsed: ThemeSettings = JSON.parse(savedSettings);
        if (parsed.primaryColor && PRIMARY_COLOR_PALETTES[parsed.primaryColor]) {
          resolvedColor = parsed.primaryColor;
        }
      }
    } catch (e) {
      console.warn('Could not read saved theme settings from localStorage:', e);
      resolvedMode = 'dark';
    }

    // Apply resolved mode and primary color
    this.applyThemeMode(resolvedMode);
    this.applyPrimaryColor(resolvedColor);
    this.saveSettings();
  }

  /**
   * Sets theme ('dark' | 'light') and persists preference
   */
  setTheme(mode: 'light' | 'dark'): void {
    this.setThemeMode(mode);
  }

  setThemeMode(mode: 'light' | 'dark'): void {
    this.applyThemeMode(mode);
    this.saveSettings();
  }

  /**
   * Toggles between dark and light mode
   */
  toggleTheme(): void {
    this.toggleThemeMode();
  }

  toggleThemeMode(): void {
    const nextMode = this.themeMode() === 'dark' ? 'light' : 'dark';
    this.setThemeMode(nextMode);
  }

  /**
   * Returns current active theme ('dark' | 'light')
   */
  getCurrentTheme(): 'light' | 'dark' {
    return this.themeMode();
  }

  /**
   * Sets primary accent color and updates design tokens
   */
  setPrimaryColor(colorKey: string): void {
    if (!PRIMARY_COLOR_PALETTES[colorKey]) {
      return;
    }
    this.applyPrimaryColor(colorKey);
    this.saveSettings();
  }

  /**
   * Resets theme to brand default (Dark + Orange #ff6a00)
   */
  resetTheme(): void {
    this.setThemeMode('dark');
    this.setPrimaryColor('orange');
  }

  /**
   * Drawer visibility controls
   */
  openSettings(): void {
    this.isSettingsOpen.set(true);
  }

  closeSettings(): void {
    this.isSettingsOpen.set(false);
  }

  toggleSettings(): void {
    this.isSettingsOpen.update((prev) => !prev);
  }

  // Internal DOM and token application logic
  private applyThemeMode(mode: 'light' | 'dark'): void {
    this.themeMode.set(mode);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const htmlEl = document.documentElement;
    if (mode === 'dark') {
      htmlEl.classList.add('app-dark', 'dark');
      htmlEl.setAttribute('data-theme', 'dark');
      htmlEl.style.colorScheme = 'dark';
    } else {
      htmlEl.classList.remove('app-dark', 'dark');
      htmlEl.setAttribute('data-theme', 'light');
      htmlEl.style.colorScheme = 'light';
    }
  }

  private applyPrimaryColor(colorKey: string): void {
    this.primaryColor.set(colorKey);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const palette = PRIMARY_COLOR_PALETTES[colorKey] || PRIMARY_COLOR_PALETTES['orange'];

    // Update PrimeNG active theme primary palette
    try {
      updatePrimaryPalette(palette);
    } catch (e) {
      console.warn('Could not update PrimeNG primary palette dynamically:', e);
    }

    // Update custom CSS variables for direct SCSS/Tailwind bindings
    const root = document.documentElement;
    Object.keys(palette).forEach((step) => {
      root.style.setProperty(`--p-primary-${step}`, palette[step]);
    });
    root.style.setProperty('--primary-color', palette[500]);
    root.style.setProperty('--primary-contrast-color', '#ffffff');
    root.style.setProperty('--p-primary-color', palette[500]);
    root.style.setProperty('--p-primary-contrast-color', '#ffffff');
    root.style.setProperty('--p-focus-ring-color', palette[500]);
  }

  private saveSettings(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, this.themeMode());
      const settings: ThemeSettings = {
        themeMode: this.themeMode(),
        primaryColor: this.primaryColor(),
      };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save theme settings to localStorage:', e);
    }
  }
}
