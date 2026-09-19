import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-theme-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, DrawerModule, ButtonModule, RippleModule],
  template: `
    <p-drawer
      [(visible)]="themeService.isSettingsOpen"
      position="right"
      [modal]="true"
      [dismissible]="true"
      [blockScroll]="true"
      styleClass="theme-settings-drawer"
    >
      <ng-template pTemplate="header">
        <div class="drawer-header-content">
          <div class="header-title-wrap">
            <i class="pi pi-palette header-icon"></i>
            <div>
              <h3 class="drawer-title">Theme Settings</h3>
              <p class="drawer-subtitle">Customize application look & feel</p>
            </div>
          </div>
        </div>
      </ng-template>

      <div class="drawer-body">
        <!-- COLOR SCHEME SECTION -->
        <div class="settings-section">
          <div class="section-label-wrap">
            <span class="section-label">Color Scheme</span>
            <span class="section-hint">{{ themeService.themeMode() | uppercase }}</span>
          </div>

          <div class="mode-selector-grid">
            <!-- Light Mode Button -->
            <button
              type="button"
              class="mode-card"
              [class.active]="themeService.themeMode() === 'light'"
              (click)="themeService.setThemeMode('light')"
            >
              <div class="mode-icon-circle light-circle">
                <i class="pi pi-sun"></i>
              </div>
              <div class="mode-info">
                <span class="mode-name">Light</span>
                <span class="mode-desc">Clean & bright</span>
              </div>
              @if (themeService.themeMode() === 'light') {
                <i class="pi pi-check-circle active-badge"></i>
              }
            </button>

            <!-- Dark Mode Button -->
            <button
              type="button"
              class="mode-card"
              [class.active]="themeService.themeMode() === 'dark'"
              (click)="themeService.setThemeMode('dark')"
            >
              <div class="mode-icon-circle dark-circle">
                <i class="pi pi-moon"></i>
              </div>
              <div class="mode-info">
                <span class="mode-name">Dark</span>
                <span class="mode-desc">Bicycle dark aesthetic</span>
              </div>
              @if (themeService.themeMode() === 'dark') {
                <i class="pi pi-check-circle active-badge"></i>
              }
            </button>
          </div>
        </div>

        <div class="section-divider"></div>

        <!-- PRIMARY COLOR SECTION -->
        <div class="settings-section">
          <div class="section-label-wrap">
            <span class="section-label">Primary Color</span>
            <span class="section-hint">
              {{ themeService.primaryColor() | uppercase }}
              @if (themeService.primaryColor() === 'orange') {
                (DEFAULT)
              }
            </span>
          </div>

          <div class="color-options-grid">
            @for (color of themeService.colorOptions; track color.value) {
              <button
                type="button"
                class="color-option-btn"
                [class.selected]="themeService.primaryColor() === color.value"
                [title]="color.name"
                (click)="themeService.setPrimaryColor(color.value)"
              >
                <div
                  class="color-swatch-circle"
                  [style.background-color]="color.color"
                >
                  @if (themeService.primaryColor() === color.value) {
                    <i class="pi pi-check swatch-check"></i>
                  }
                </div>
                <span class="color-name">{{ color.name }}</span>
              </button>
            }
          </div>
        </div>

        <div class="section-divider"></div>

        <!-- RESET TO DEFAULT -->
        <div class="settings-section reset-section">
          <p-button
            label="Reset to Default"
            icon="pi pi-refresh"
            [outlined]="true"
            severity="secondary"
            styleClass="w-full reset-btn"
            (onClick)="themeService.resetTheme()"
          />
          <span class="reset-hint">Resets theme to Dark Mode & Orange (#ff6a00)</span>
        </div>
      </div>
    </p-drawer>
  `,
  styles: [
    `
      :host ::ng-deep .theme-settings-drawer {
        width: 380px !important;
        max-width: 90vw !important;
        background: var(--surface-card, #121212) !important;
        border-left: 1px solid var(--surface-border, rgba(255, 255, 255, 0.1)) !important;
        box-shadow: -10px 0 30px rgba(0, 0, 0, 0.35) !important;
      }

      :host ::ng-deep .theme-settings-drawer .p-drawer-header {
        padding: 1.25rem 1.5rem !important;
        border-bottom: 1px solid var(--surface-border, rgba(255, 255, 255, 0.1)) !important;
        background: var(--surface-card, #121212) !important;
      }

      :host ::ng-deep .theme-settings-drawer .p-drawer-content {
        padding: 0 !important;
        background: var(--surface-card, #121212) !important;
      }

      .drawer-header-content {
        display: flex;
        align-items: center;
        width: 100%;
      }

      .header-title-wrap {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .header-icon {
        font-size: 1.4rem;
        color: var(--primary-color, #ff6a00);
      }

      .drawer-title {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text-color, #ffffff);
        letter-spacing: -0.01em;
      }

      .drawer-subtitle {
        margin: 2px 0 0 0;
        font-size: 0.8rem;
        color: var(--text-color-secondary, #a3a3a3);
      }

      .drawer-body {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .settings-section {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }

      .section-label-wrap {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .section-label {
        font-size: 0.875rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-color, #ffffff);
      }

      .section-hint {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--primary-color, #ff6a00);
      }

      .section-divider {
        height: 1px;
        background: var(--surface-border, rgba(255, 255, 255, 0.08));
        margin: 0.25rem 0;
      }

      /* MODE SELECTOR */
      .mode-selector-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }

      .mode-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 1rem 0.75rem;
        border-radius: 10px;
        background: var(--surface-ground, rgba(255, 255, 255, 0.04));
        border: 2px solid var(--surface-border, rgba(255, 255, 255, 0.08));
        cursor: pointer;
        position: relative;
        transition: all 0.2s ease;
        gap: 0.5rem;
      }

      .mode-card:hover {
        border-color: var(--primary-color, #ff6a00);
        background: rgba(255, 106, 0, 0.05);
      }

      .mode-card.active {
        border-color: var(--primary-color, #ff6a00);
        background: rgba(255, 106, 0, 0.1);
      }

      .mode-icon-circle {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
      }

      .light-circle {
        background: #fef08a;
        color: #ca8a04;
      }

      .dark-circle {
        background: #374151;
        color: #f3f4f6;
      }

      .mode-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .mode-name {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-color, #ffffff);
      }

      .mode-desc {
        font-size: 0.725rem;
        color: var(--text-color-secondary, #a3a3a3);
      }

      .active-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        font-size: 0.85rem;
        color: var(--primary-color, #ff6a00);
      }

      /* COLOR SWATCH GRID */
      .color-options-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
      }

      .color-option-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.45rem;
        padding: 0.75rem 0.5rem;
        border-radius: 10px;
        background: var(--surface-ground, rgba(255, 255, 255, 0.04));
        border: 2px solid var(--surface-border, rgba(255, 255, 255, 0.08));
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .color-option-btn:hover {
        border-color: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
      }

      .color-option-btn.selected {
        border-color: var(--primary-color, #ff6a00);
        background: rgba(255, 106, 0, 0.1);
      }

      .color-swatch-circle {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        transition: transform 0.2s ease;
      }

      .swatch-check {
        color: #ffffff;
        font-size: 0.85rem;
        font-weight: 700;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
      }

      .color-name {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-color, #ffffff);
      }

      /* RESET SECTION */
      .reset-section {
        margin-top: 0.5rem;
        align-items: center;
      }

      .reset-hint {
        font-size: 0.75rem;
        color: var(--text-color-secondary, #a3a3a3);
        text-align: center;
        margin-top: 0.25rem;
      }
    `,
  ],
})
export class ThemeDrawerComponent {
  themeService = inject(ThemeService);
}
