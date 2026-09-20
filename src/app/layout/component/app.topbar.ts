import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { ThemeService } from '../../theme/theme.service';
import { ThemeDrawerComponent } from '../../theme/theme-drawer.component';
import { AuthService } from '../../common/services/auth.service';

interface MenuGroup {
  title: string;
  items: {
    label: string;
    icon: string;
    routerLink: string;
    description?: string;
    badge?: string;
    roles: ('admin' | 'user')[];
  }[];
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MenubarModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    DrawerModule,
    ButtonModule,
    ThemeDrawerComponent,
  ],
  template: `
    <header class="topbar">
      <!-- MOBILE MENU HAMBURGER -->
      <button 
        class="mobile-menu-btn" 
        type="button" 
        (click)="mobileDrawerVisible = true" 
        aria-label="Toggle navigation menu"
      >
        <i class="pi pi-bars text-xl"></i>
      </button>

      <!-- BRAND LOGO -->
      <a routerLink="/" class="logo-section">
        <img src="assets/images/logo.png" alt="Cycle Service Center" class="logo" />
        <div class="logo-text hidden sm:flex flex-col">
          <span class="brand-title font-bold leading-tight">CYCLE SERVICE</span>
          <span class="brand-sub text-[10px] tracking-wider uppercase opacity-75">
            {{ authService.isAdmin() ? 'Admin Portal' : 'Workshop' }}
          </span>
        </div>
      </a>

      <!-- DESKTOP CATEGORIZED TOPBAR NAVIGATION (STRUCTURED WITH SUBMENUS - NO HORIZONTAL SCROLL) -->
      <nav class="navigation">
        <p-menubar [model]="structuredMenuItems()" styleClass="admin-menubar">
          <ng-template #item let-item let-root="root">
            <!-- Root item with direct routerLink -->
            <a 
              *ngIf="item.routerLink && root" 
              [routerLink]="item.routerLink" 
              routerLinkActive="active-topbar-link" 
              [routerLinkActiveOptions]="{ exact: item.routerLink === '/dashboard' || item.routerLink === '/' }"
              class="p-menubar-item-link flex items-center gap-2 cursor-pointer"
            >
              <i [class]="item.icon" class="text-xs text-primary"></i>
              <span class="font-medium text-sm">{{ item.label }}</span>
            </a>

            <!-- Root category header with dropdown submenu -->
            <div 
              *ngIf="!item.routerLink && root" 
              class="p-menubar-item-link flex items-center gap-1.5 cursor-pointer select-none"
            >
              <i *ngIf="item.icon" [class]="item.icon" class="text-xs text-primary"></i>
              <span class="font-medium text-sm">{{ item.label }}</span>
              <i class="pi pi-chevron-down text-[10px] opacity-70 ml-1"></i>
            </div>

            <!-- Submenu Dropdown Child Item -->
            <a 
              *ngIf="!root && item.routerLink" 
              [routerLink]="item.routerLink" 
              routerLinkActive="active-submenu-link"
              [routerLinkActiveOptions]="{ exact: item.routerLink === '/dashboard' || item.routerLink === '/' }"
              class="p-menubar-item-link flex items-center gap-2.5 cursor-pointer w-full"
            >
              <i [class]="item.icon" class="text-sm text-primary"></i>
              <div class="flex flex-col flex-1">
                <span class="font-medium text-sm leading-tight">{{ item.label }}</span>
                <span *ngIf="item.title" class="text-[11px] text-muted-color opacity-80 leading-normal mt-0.5">
                  {{ item.title }}
                </span>
              </div>
              <span *ngIf="item.badge" class="text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-auto bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400">
                {{ item.badge }}
              </span>
            </a>
          </ng-template>
        </p-menubar>
      </nav>

      <!-- SEARCH BAR -->
      <div class="search-section">
        <!-- Desktop search -->
        <p-iconfield class="desktop-search">
          <p-inputicon class="pi pi-search"></p-inputicon>
          <input 
            type="text" 
            pInputText 
            [(ngModel)]="searchQuery"
            placeholder="Search tickets, bikes, riders..." 
          />
        </p-iconfield>

        <!-- Mobile search toggle -->
        <button class="mobile-search-btn" type="button" aria-label="Search" (click)="toggleSearch()">
          <i class="pi pi-search"></i>
        </button>
      </div>

      <!-- RIGHT ACTIONS: THEME SETTINGS + USER PROFILE + LOGOUT -->
      <div class="topbar-actions">
        <!-- THEME SETTINGS -->
        <button
          class="action-btn settings-btn"
          type="button"
          (click)="goToSettings()"
          aria-label="Settings"
          title="Theme & Appearance"
        >
          <i class="pi pi-palette"></i>
        </button>

        <!-- USER SECTION -->
        <div class="user-section">
          <div class="avatar" [class.user-avatar]="!authService.isAdmin()">
            <i class="pi" [ngClass]="authService.isAdmin() ? 'pi-shield' : 'pi-user'"></i>
          </div>

          <div class="user-details">
            <span class="user-name truncate max-w-[120px]" [title]="userName()">
              {{ userName() }}
            </span>
            <span class="user-role flex items-center gap-1">
              <span class="role-badge" [class.admin-badge]="authService.isAdmin()" [class.user-badge]="!authService.isAdmin()">
                {{ userRoleLabel() }}
              </span>
            </span>
          </div>

          <!-- LOGOUT BUTTON -->
          <button 
            class="logout-btn" 
            type="button" 
            (click)="logout()" 
            aria-label="Logout"
            title="Sign out of system"
          >
            <i class="pi pi-sign-out"></i>
          </button>
        </div>
      </div>
    </header>

    <!-- MOBILE EXPANDABLE SEARCH BAR -->
    <div *ngIf="showMobileSearch()" class="mobile-search-overlay p-3 bg-surface-card border-b border-surface-border animate-fade-in">
      <p-iconfield class="w-full block">
        <p-inputicon class="pi pi-search"></p-inputicon>
        <input 
          type="text" 
          pInputText 
          [(ngModel)]="searchQuery" 
          placeholder="Search..." 
          class="w-full"
          autofocus
        />
      </p-iconfield>
    </div>

    <!-- MOBILE NAVIGATION DRAWER (STRUCTURED CATEGORIES) -->
    <p-drawer [(visible)]="mobileDrawerVisible" [modal]="true" position="left" styleClass="mobile-nav-drawer w-80">
      <ng-template #header>
        <div class="flex items-center gap-3">
          <img src="assets/images/logo.png" alt="Cycle Service Center" class="w-8 h-8 object-contain" />
          <div class="flex flex-col">
            <span class="font-bold text-sm text-surface-900 dark:text-surface-0">CYCLE SERVICE</span>
            <span class="text-xs text-orange-500 font-semibold">{{ userRoleLabel() }} Portal</span>
          </div>
        </div>
      </ng-template>

      <div class="flex flex-col justify-between h-full py-2 overflow-y-auto">
        <!-- Structured Menu Groups for Mobile -->
        <div class="flex flex-col gap-5">
          <div *ngFor="let group of currentMenuGroups()">
            <div class="text-[11px] font-bold uppercase tracking-wider text-muted-color px-3 mb-2 flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
              {{ group.title }}
            </div>

            <div class="flex flex-col gap-1">
              <a 
                *ngFor="let item of group.items" 
                [routerLink]="item.routerLink" 
                (click)="mobileDrawerVisible = false"
                routerLinkActive="active-mobile-link"
                [routerLinkActiveOptions]="{ exact: item.routerLink === '/dashboard' || item.routerLink === '/' }"
                class="mobile-nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-hover transition-colors font-medium text-sm"
              >
                <i [class]="item.icon" class="text-base text-primary"></i>
                <div class="flex flex-col flex-1">
                  <span>{{ item.label }}</span>
                  <span *ngIf="item.description" class="text-[11px] text-muted-color">{{ item.description }}</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        <!-- User Info & Logout in Mobile Drawer -->
        <div class="border-t border-surface-border pt-4 mt-6 flex flex-col gap-3">
          <div class="flex items-center gap-3 px-3">
            <div class="avatar-sm">
              <i class="pi" [ngClass]="authService.isAdmin() ? 'pi-shield' : 'pi-user'"></i>
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-semibold text-surface-900 dark:text-surface-0">{{ userName() }}</span>
              <span class="text-xs text-muted-color">{{ authService.currentUser()?.email }}</span>
            </div>
          </div>

          <button 
            type="button" 
            (click)="logout()" 
            class="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold text-xs hover:bg-red-100 transition-colors"
          >
            <i class="pi pi-sign-out"></i>
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </p-drawer>

    <!-- THEME SETTINGS DRAWER -->
    <app-theme-drawer />
  `,
  styles: [
    `
      /* =========================================
         FIXED TOPBAR / NAVBAR ON SCROLL
      ========================================= */
      .topbar {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 68px;
        display: flex;
        align-items: center;
        padding: 0 24px;
        gap: 16px;
        background: var(--surface-card, #121212);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-bottom: 1px solid var(--surface-border, rgba(255, 255, 255, 0.1));
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
        box-sizing: border-box;
        z-index: 1000;
        transition: background-color 0.25s ease, border-color 0.25s ease;
      }

      /* HAMBURGER */
      .mobile-menu-btn {
        display: none;
        width: 38px;
        height: 38px;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: var(--text-color, #ffffff);
        cursor: pointer;
        transition: background-color 0.2s ease, color 0.2s ease;
      }

      .mobile-menu-btn:hover {
        background: var(--surface-hover, rgba(255, 255, 255, 0.08));
        color: var(--primary-color, #ff6a00);
      }

      /* LOGO */
      .logo-section {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 0 0 auto;
        text-decoration: none;
        color: inherit;
      }

      .logo {
        width: 40px;
        height: 40px;
        object-fit: contain;
      }

      .brand-title {
        font-size: 13px;
        letter-spacing: 0.05em;
        color: var(--text-color, #ffffff);
      }

      .brand-sub {
        color: var(--primary-color, #ff6a00);
        font-weight: 700;
      }

      /* NAVIGATION (DESKTOP) */
      .navigation {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        align-items: center;
      }

      :host ::ng-deep .admin-menubar {
        width: 100%;
        background: transparent !important;
        border: none !important;
        padding: 0 !important;
        border-radius: 0 !important;
      }

      :host ::ng-deep .admin-menubar .p-menubar-root-list {
        background: transparent !important;
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: nowrap;
      }

      :host ::ng-deep .admin-menubar .p-menubar-item-link {
        color: var(--text-color, #e2e8f0) !important;
        background: transparent !important;
        border-radius: 8px;
        padding: 8px 12px;
        white-space: nowrap;
        font-weight: 500;
        font-size: 13.5px;
        transition: all 0.2s ease;
        text-decoration: none;
      }

      :host ::ng-deep .admin-menubar .p-menubar-item-link:hover,
      :host ::ng-deep .admin-menubar .p-menubar-item.p-focus > .p-menubar-item-content .p-menubar-item-link,
      :host ::ng-deep .admin-menubar .p-menubar-item-active > .p-menubar-item-content .p-menubar-item-link {
        background: var(--surface-hover, rgba(255, 255, 255, 0.08)) !important;
        color: var(--primary-color, #ff6a00) !important;
      }

      :host ::ng-deep .admin-menubar .active-topbar-link {
        font-weight: 700 !important;
        background: var(--surface-hover, rgba(255, 255, 255, 0.08)) !important;
        color: var(--primary-color, #ff6a00) !important;
      }

      /* SUBMENU DROPDOWN STYLING (MEGAMENU / DROPDOWN LOOK) */
      :host ::ng-deep .admin-menubar .p-menubar-submenu {
        background: var(--surface-overlay, var(--surface-card, #18181b)) !important;
        border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.12)) !important;
        border-radius: 12px !important;
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35) !important;
        padding: 8px !important;
        min-width: 250px !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        gap: 2px !important;
      }

      :host ::ng-deep .admin-menubar .p-menubar-submenu .p-menubar-item-link {
        color: var(--text-color, #f8fafc) !important;
        border-radius: 8px !important;
        padding: 10px 14px !important;
        font-size: 13px !important;
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        transition: all 0.15s ease !important;
      }

      :host ::ng-deep .admin-menubar .p-menubar-submenu .p-menubar-item-link:hover,
      :host ::ng-deep .admin-menubar .p-menubar-submenu .p-menubar-item.p-focus > .p-menubar-item-content .p-menubar-item-link {
        background: var(--surface-hover, rgba(255, 255, 255, 0.08)) !important;
        color: var(--primary-color, #ff6a00) !important;
      }

      :host ::ng-deep .admin-menubar .active-submenu-link {
        background: color-mix(in srgb, var(--primary-color, #ff6a00) 12%, transparent) !important;
        color: var(--primary-color, #ff6a00) !important;
        font-weight: 700 !important;
      }

      /* SEARCH */
      .search-section {
        flex: 0 1 200px;
        min-width: 140px;
        display: flex;
        align-items: center;
      }

      .desktop-search {
        width: 100%;
        display: block;
      }

      :host ::ng-deep .desktop-search input {
        width: 100%;
        box-sizing: border-box;
        background: var(--surface-ground, rgba(255, 255, 255, 0.06));
        border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.15));
        color: var(--text-color, #ffffff);
        border-radius: 8px;
        padding: 7px 10px 7px 34px;
        font-size: 12.5px;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      :host ::ng-deep .desktop-search input::placeholder {
        color: var(--text-color-secondary, #94a3b8);
      }

      :host ::ng-deep .desktop-search input:focus {
        border-color: var(--primary-color, #ff6a00);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color, #ff6a00) 25%, transparent);
      }

      :host ::ng-deep .desktop-search .p-inputicon {
        color: var(--text-color-secondary, #94a3b8);
        font-size: 13px;
      }

      .mobile-search-btn {
        display: none;
        width: 36px;
        height: 36px;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: var(--text-color, #ffffff);
        cursor: pointer;
        font-size: 16px;
        transition: background-color 0.2s ease, color 0.2s ease;
      }

      .mobile-search-btn:hover {
        background: var(--surface-hover, rgba(255, 255, 255, 0.1));
        color: var(--primary-color, #ff6a00);
      }

      /* ACTIONS */
      .topbar-actions {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .action-btn {
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: var(--text-color, #ffffff);
        cursor: pointer;
        font-size: 16px;
        transition: background-color 0.2s ease, color 0.2s ease;
      }

      .action-btn:hover {
        background: var(--surface-hover, rgba(255, 255, 255, 0.1));
        color: var(--primary-color, #ff6a00);
      }

      /* USER */
      .user-section {
        display: flex;
        align-items: center;
        gap: 10px;
        padding-left: 12px;
        border-left: 1px solid var(--surface-border, rgba(255, 255, 255, 0.15));
      }

      .avatar {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        background: var(--primary-color, #ff6a00);
        color: #ffffff;
        border-radius: 50%;
        font-size: 15px;
      }

      .user-avatar {
        background: #0284c7;
      }

      .avatar-sm {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: var(--primary-color, #ff6a00);
        color: #ffffff;
        font-size: 13px;
      }

      .user-details {
        display: flex;
        flex-direction: column;
      }

      .user-name {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-color, #ffffff);
        line-height: 1.2;
      }

      .role-badge {
        font-size: 10.5px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .admin-badge {
        color: var(--primary-color, #ff6a00);
      }

      .user-badge {
        color: #38bdf8;
      }

      .logout-btn {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: #f87171;
        cursor: pointer;
        font-size: 16px;
        transition: background-color 0.2s ease, color 0.2s ease;
      }

      .logout-btn:hover {
        background: rgba(239, 68, 68, 0.12);
        color: #ef4444;
      }

      .mobile-search-overlay {
        position: fixed;
        top: 68px;
        left: 0;
        width: 100%;
        z-index: 999;
      }

      .active-mobile-link {
        background: color-mix(in srgb, var(--primary-color, #ff6a00) 12%, transparent);
        color: var(--primary-color, #ff6a00) !important;
        font-weight: 700;
      }

      /* =========================================
         RESPONSIVE BREAKPOINTS
      ========================================= */
      @media (max-width: 991px) {
        .mobile-menu-btn {
          display: flex;
        }
        .navigation {
          display: none;
        }
        .search-section {
          flex: 1;
          justify-content: flex-end;
        }
        .desktop-search {
          display: none;
        }
        .mobile-search-btn {
          display: flex;
        }
        .user-details {
          display: none;
        }
      }
    `,
  ],
})
export class AppTopbar {
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  private router = inject(Router);

  searchQuery = '';
  mobileDrawerVisible = false;
  showMobileSearch = signal(false);

  // Grouped Menu Structure (Mirroring the categorized system structure)
  private adminMenuGroups: MenuGroup[] = [
    {
      title: 'Operations',
      items: [
        { label: 'Dashboard', icon: 'pi pi-th-large', routerLink: '/dashboard', description: 'Overview & telemetry', roles: ['admin'] },
        { label: 'Services', icon: 'pi pi-wrench', routerLink: '/services', description: 'Repair tickets & active orders', badge: '8', roles: ['admin'] },
        { label: 'Appointments', icon: 'pi pi-calendar-plus', routerLink: '/appointments', description: 'Scheduled drop-offs', badge: '6', roles: ['admin'] },
        { label: 'Service Jobs', icon: 'pi pi-sliders-h', routerLink: '/service-jobs', description: 'Live workshop floor queue', roles: ['admin'] },
      ],
    },
    {
      title: 'Fleet & CRM',
      items: [
        { label: 'Customers', icon: 'pi pi-users', routerLink: '/customers', description: 'Rider directory & accounts', roles: ['admin'] },
        { label: 'Bicycles', icon: 'pi pi-compass', routerLink: '/bicycles', description: 'Bicycle fleet & serial numbers', roles: ['admin'] },
        { label: 'Technicians', icon: 'pi pi-user-plus', routerLink: '/technicians', description: 'Staff mechanics & assignments', roles: ['admin'] },
      ],
    },
    {
      title: 'Workshop & Finance',
      items: [
        { label: 'Inventory', icon: 'pi pi-box', routerLink: '/inventory', description: 'Components & spare parts stock', roles: ['admin'] },
        { label: 'Payments', icon: 'pi pi-credit-card', routerLink: '/payments', description: 'Billing receipts & settlements', roles: ['admin'] },
        { label: 'Reports', icon: 'pi pi-chart-line', routerLink: '/reports', description: 'Revenue & operational metrics', roles: ['admin'] },
      ],
    },
    {
      title: 'System',
      items: [
        { label: 'Settings', icon: 'pi pi-cog', routerLink: '/settings', description: 'Workshop rules & system defaults', roles: ['admin'] },
      ],
    },
  ];

  private userMenuGroups: MenuGroup[] = [
    {
      title: 'Operations',
      items: [
        { label: 'Services', icon: 'pi pi-wrench', routerLink: '/services', description: 'View, edit, and create services', roles: ['user'] },
      ],
    },
    {
      title: 'Fleet & CRM',
      items: [
        { label: 'Customers', icon: 'pi pi-user-plus', routerLink: '/customers', description: 'Register new rider', roles: ['user'] },
        { label: 'Bicycles', icon: 'pi pi-compass', routerLink: '/bicycles', description: 'Register new bicycle', roles: ['user'] },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Settings', icon: 'pi pi-cog', routerLink: '/settings', description: 'Profile, password & preferences', roles: ['user'] },
      ],
    },
  ];

  // Current groups based on role
  currentMenuGroups = computed(() => {
    return this.authService.isAdmin() ? this.adminMenuGroups : this.userMenuGroups;
  });

  // PrimeNG Structured Model for Desktop Menubar (Submenus under Category Titles)
  structuredMenuItems = computed<MenuItem[]>(() => {
    if (this.authService.isAdmin()) {
      return [
        {
          label: 'Dashboard',
          icon: 'pi pi-th-large',
          routerLink: '/dashboard',
        },
        {
          label: 'Operations',
          icon: 'pi pi-wrench',
          items: [
            {
              label: 'Services',
              icon: 'pi pi-wrench',
              routerLink: '/services',
              title: 'Repair tickets & active orders',
            },
            {
              label: 'Appointments',
              icon: 'pi pi-calendar-plus',
              routerLink: '/appointments',
              title: 'Scheduled drop-offs',
            },
            {
              label: 'Service Jobs',
              icon: 'pi pi-sliders-h',
              routerLink: '/service-jobs',
              title: 'Live workshop floor queue',
            },
          ],
        },
        {
          label: 'Fleet & CRM',
          icon: 'pi pi-users',
          items: [
            {
              label: 'Customers',
              icon: 'pi pi-users',
              routerLink: '/customers',
              title: 'Rider directory & accounts',
            },
            {
              label: 'Bicycles',
              icon: 'pi pi-compass',
              routerLink: '/bicycles',
              title: 'Bicycle fleet & serial numbers',
            },
            {
              label: 'Technicians',
              icon: 'pi pi-user-plus',
              routerLink: '/technicians',
              title: 'Staff mechanics & assignments',
            },
          ],
        },
        {
          label: 'Workshop & Finance',
          icon: 'pi pi-box',
          items: [
            {
              label: 'Inventory',
              icon: 'pi pi-box',
              routerLink: '/inventory',
              title: 'Components & spare parts stock',
            },
            {
              label: 'Payments',
              icon: 'pi pi-credit-card',
              routerLink: '/payments',
              title: 'Billing receipts & settlements',
            },
            {
              label: 'Reports',
              icon: 'pi pi-chart-line',
              routerLink: '/reports',
              title: 'Revenue & operational metrics',
            },
          ],
        },
        {
          label: 'Settings',
          icon: 'pi pi-cog',
          routerLink: '/settings',
        },
      ];
    } else {
      // User Structured Menu
      return [
        {
          label: 'Services',
          icon: 'pi pi-wrench',
          routerLink: '/services',
        },
        {
          label: 'Customers',
          icon: 'pi pi-user-plus',
          routerLink: '/customers',
        },
        {
          label: 'Bicycles',
          icon: 'pi pi-compass',
          routerLink: '/bicycles',
        },
        {
          label: 'Settings',
          icon: 'pi pi-cog',
          routerLink: '/settings',
        },
      ];
    }
  });

  userName = computed(() => {
    const user = this.authService.currentUser();
    if (user?.name) return user.name;
    return this.authService.isAdmin() ? 'Administrator' : 'Service Staff';
  });

  userRoleLabel = computed(() => {
    return this.authService.isAdmin() ? 'Admin' : 'User';
  });

  toggleSearch() {
    this.showMobileSearch.update((v) => !v);
  }

  goToSettings() {
    this.themeService.openSettings();
  }

  logout() {
    this.authService.logout();
  }
}
