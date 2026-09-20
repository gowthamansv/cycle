import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';

@Component({
  selector: 'app-notfound',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, TagModule, AppFloatingConfigurator],
  template: `
    <app-floating-configurator />
    
    <div class="notfound-container flex flex-col items-center justify-center min-h-screen px-4 py-12 relative overflow-hidden bg-surface-50 dark:bg-surface-950">
      
      <!-- Background Ambient Glow & Mechanical Grid Patterns -->
      <div class="ambient-glow" aria-hidden="true"></div>
      <div class="ambient-glow-secondary" aria-hidden="true"></div>

      <!-- Main 404 Content Card -->
      <div class="w-full max-w-3xl relative z-10 mx-auto">
        <div class="notfound-card rounded-3xl p-8 sm:p-14 border border-surface-200 dark:border-surface-800 bg-surface-0/90 dark:bg-surface-900/90 shadow-2xl backdrop-blur-md text-center">
          
          <!-- Top Badge -->
          <div class="flex items-center justify-center gap-2 mb-6">
            <span class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase border border-primary/30 bg-primary/10 text-primary">
              <i class="pi pi-compass text-sm animate-spin-slow"></i>
              Cycle Service Center • Off-Trail Route
            </span>
          </div>

          <!-- Bicycle / Gear Illustration & 404 Number -->
          <div class="relative flex items-center justify-center my-6 select-none">
            <!-- Large 404 Typography with Gradient -->
            <div class="text-8xl sm:text-9xl font-extrabold tracking-tighter text-404 flex items-center justify-center gap-2 sm:gap-4">
              <span class="digit">4</span>
              
              <!-- Center Bicycle Gear Motif -->
              <div class="gear-motif-container relative flex items-center justify-center">
                <div class="gear-outer animate-spin-slow">
                  <svg viewBox="0 0 100 100" class="w-24 h-24 sm:w-32 sm:h-32 text-primary" fill="currentColor">
                    <!-- Bicycle Sprocket / Cog SVG -->
                    <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="6" stroke-dasharray="14 4" />
                    <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" stroke-width="4" />
                    <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.8" />
                    <!-- Spokes -->
                    <line x1="50" y1="12" x2="50" y2="88" stroke="currentColor" stroke-width="3" />
                    <line x1="12" y1="50" x2="88" y2="50" stroke="currentColor" stroke-width="3" />
                    <line x1="23" y1="23" x2="77" y2="77" stroke="currentColor" stroke-width="3" />
                    <line x1="23" y1="77" x2="77" y2="23" stroke="currentColor" stroke-width="3" />
                  </svg>
                </div>
                <!-- Inner Icon Wrench / Map Marker -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface-0 dark:bg-surface-900 border border-primary flex items-center justify-center shadow-lg">
                    <i class="pi pi-wrench text-primary text-base sm:text-lg"></i>
                  </div>
                </div>
              </div>

              <span class="digit">4</span>
            </div>
          </div>

          <!-- Titles & Explanatory Text -->
          <h1 class="text-2xl sm:text-4xl font-extrabold text-surface-900 dark:text-surface-0 tracking-tight mb-3">
            Looks like this route took a wrong turn
          </h1>
          
          <p class="text-base sm:text-lg text-surface-600 dark:text-surface-400 max-w-xl mx-auto mb-8 leading-relaxed">
            The page you're looking for doesn't exist, has been moved, or the gear shifted out of alignment on this service route.
          </p>

          <!-- Primary & Secondary Actions -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <p-button 
              label="Back to Home" 
              icon="pi pi-home" 
              routerLink="/" 
              styleClass="w-full sm:w-auto px-6 py-3 font-semibold shadow-md">
            </p-button>

            <p-button 
              label="Go Back" 
              icon="pi pi-arrow-left" 
              (onClick)="goBack()" 
              [outlined]="true" 
              severity="secondary"
              styleClass="w-full sm:w-auto px-6 py-3 font-semibold">
            </p-button>

            <p-button 
              label="Admin Portal" 
              icon="pi pi-shield" 
              routerLink="/admin/login" 
              [text]="true" 
              severity="secondary"
              styleClass="w-full sm:w-auto px-4 py-3 font-semibold text-primary">
            </p-button>
          </div>

          <!-- Quick Service Center Shortcuts -->
          <div class="border-t border-surface-200 dark:border-surface-800 pt-6">
            <p class="text-xs font-medium uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-4">
              Helpful Service Center Destinations
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a routerLink="/dashboard" class="quick-link group flex items-center gap-3 p-3 rounded-xl border border-surface-200 dark:border-surface-800 hover:border-primary/50 bg-surface-50/50 dark:bg-surface-800/50 transition-all text-left">
                <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <i class="pi pi-gauge text-sm"></i>
                </div>
                <div>
                  <div class="text-sm font-semibold text-surface-900 dark:text-surface-100 group-hover:text-primary transition-colors">Dashboard</div>
                  <div class="text-xs text-surface-500">Service metrics</div>
                </div>
              </a>

              <a routerLink="/landing" class="quick-link group flex items-center gap-3 p-3 rounded-xl border border-surface-200 dark:border-surface-800 hover:border-primary/50 bg-surface-50/50 dark:bg-surface-800/50 transition-all text-left">
                <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <i class="pi pi-globe text-sm"></i>
                </div>
                <div>
                  <div class="text-sm font-semibold text-surface-900 dark:text-surface-100 group-hover:text-primary transition-colors">Landing Page</div>
                  <div class="text-xs text-surface-500">Client overview</div>
                </div>
              </a>

              <a routerLink="/admin/login" class="quick-link group flex items-center gap-3 p-3 rounded-xl border border-surface-200 dark:border-surface-800 hover:border-primary/50 bg-surface-50/50 dark:bg-surface-800/50 transition-all text-left">
                <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <i class="pi pi-wrench text-sm"></i>
                </div>
                <div>
                  <div class="text-sm font-semibold text-surface-900 dark:text-surface-100 group-hover:text-primary transition-colors">Technician Hub</div>
                  <div class="text-xs text-surface-500">Admin access</div>
                </div>
              </a>
            </div>
          </div>

        </div>

        <!-- Footer System Operational Note -->
        <div class="text-center mt-6 text-xs text-surface-500 dark:text-surface-400 flex items-center justify-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Cycle Service Hub Engine v20.4 • All Core Diagnostics Operational</span>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .notfound-container {
      position: relative;
    }

    .ambient-glow {
      position: absolute;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, color-mix(in srgb, var(--primary-color, #ff6a00) 25%, transparent) 0%, transparent 70%);
      top: 10%;
      left: 15%;
      filter: blur(80px);
      pointer-events: none;
      z-index: 1;
    }

    .ambient-glow-secondary {
      position: absolute;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      background: radial-gradient(circle, color-mix(in srgb, var(--primary-color, #ff6a00) 15%, transparent) 0%, transparent 70%);
      bottom: 10%;
      right: 15%;
      filter: blur(80px);
      pointer-events: none;
      z-index: 1;
    }

    .text-404 {
      line-height: 1;
      text-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    }

    .digit {
      background: linear-gradient(180deg, var(--surface-900, #18181b) 30%, var(--surface-500, #71717a) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    :host-context(.app-dark) .digit {
      background: linear-gradient(180deg, #ffffff 30%, var(--surface-400, #a1a1aa) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .animate-spin-slow {
      animation: spin 16s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .quick-link:hover {
      box-shadow: 0 4px 12px rgba(255, 106, 0, 0.08);
    }
  `]
})
export class NotFoundComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}

export const Notfound = NotFoundComponent;
