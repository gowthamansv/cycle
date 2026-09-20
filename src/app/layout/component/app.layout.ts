import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppTopbar } from './app.topbar';
import { AppFooter } from './app.footer';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, AppTopbar, RouterModule, AppFooter],
  template: `
    <div class="layout-wrapper">
      <app-topbar></app-topbar>
      <div class="layout-main-container">
        <main class="layout-main">
          <router-outlet></router-outlet>
        </main>
        <app-footer></app-footer>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
    }
    .layout-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      width: 100%;
      position: relative;
    }
    .layout-main-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      justify-content: space-between;
      padding: 5.5rem 1.5rem 1.5rem 1.5rem;
      width: 100%;
      box-sizing: border-box;
      margin-left: 0 !important;
      margin-right: 0 !important;
    }
    .layout-main {
      flex: 1 1 auto;
      width: 100%;
      max-width: 100%;
    }
    @media (max-width: 768px) {
      .layout-main-container {
        padding: 5rem 1rem 1rem 1rem;
      }
    }
  `]
})
export class AppLayout {}

