import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [MenubarModule, IconFieldModule, InputIconModule, InputTextModule],

  template: `
    <header class="topbar">
      <!-- LOGO -->
      <div class="logo-section">
        <img src="../../../../public/assets/images/logo.png" alt="Cycle Admin" class="logo" />
      </div>

      <!-- DESKTOP NAVIGATION -->
      <nav class="navigation">
        <p-menubar [model]="nestedMenuItems" styleClass="admin-menubar"> </p-menubar>
      </nav>

      <!-- SEARCH -->
      <div class="search-section">
        <!-- Desktop search -->
        <p-iconfield class="desktop-search">
          <p-inputicon class="pi pi-search"></p-inputicon>

          <input type="text" pInputText placeholder="Search..." />
        </p-iconfield>

        <!-- Mobile search button -->
        <button class="mobile-search-btn" type="button" aria-label="Search">
          <i class="pi pi-search"></i>
        </button>
      </div>

      <!-- RIGHT ACTIONS -->
      <div class="topbar-actions">
        <!-- SETTINGS -->
        <button
          class="action-btn settings-btn"
          type="button"
          (click)="goToSettings()"
          aria-label="Settings"
        >
          <i class="pi pi-cog"></i>
        </button>

        <!-- USER -->
        <div class="user-section">
          <div class="avatar">
            <i class="pi pi-user"></i>
          </div>

          <div class="user-details">
            <span class="user-name"> Admin </span>

            <span class="user-role"> Administrator </span>
          </div>

          <button class="logout-btn" type="button" (click)="logout()" aria-label="Logout">
            <i class="pi pi-sign-out"></i>
          </button>
        </div>
      </div>
    </header>
  `,

  styles: [
    `
      /* =========================================
   TOPBAR
========================================= */

      .topbar {
        width: 100%;
        height: 72px;

        display: flex;
        align-items: center;

        padding: 0 28px;
        gap: 20px;

        background: #4b5563;
        border-bottom: 1px solid rgba(255, 255, 255, 0.12);

        box-sizing: border-box;

        position: relative;
        z-index: 1000;
      }

      /* =========================================
   LOGO
========================================= */

      .logo-section {
        display: flex;
        align-items: center;

        flex: 0 0 auto;
      }

      .logo {
        width: 44px;
        height: 44px;

        object-fit: contain;
      }

      /* =========================================
   NAVIGATION
========================================= */

      .navigation {
        flex: 1 1 auto;

        min-width: 0;

        display: flex;
        align-items: center;
      }

      /* =========================================
   PRIMENG MENUBAR
========================================= */

      /*
   PrimeNG Menubar has its own background.
   Override it so it becomes part of the
   same #4b5563 topbar.
*/

      :host ::ng-deep .admin-menubar {
        width: 100%;

        background: transparent !important;
        border: none !important;

        padding: 0 !important;

        border-radius: 0 !important;
      }

      /* Menu items */

      :host ::ng-deep .admin-menubar .p-menubar-root-list {
        background: transparent !important;

        display: flex;
        align-items: center;

        gap: 4px;
      }

      /* Menu item links */

      :host ::ng-deep .admin-menubar .p-menubar-item-link {
        color: #ffffff !important;

        background: transparent !important;

        border-radius: 8px;

        padding: 10px 12px;

        white-space: nowrap;

        transition:
          background 0.2s ease,
          color 0.2s ease;
      }

      /* Hover */

      :host ::ng-deep .admin-menubar .p-menubar-item-link:hover {
        background: rgba(255, 255, 255, 0.1) !important;

        color: #ff6a00 !important;
      }

      /* Icons */

      :host ::ng-deep .admin-menubar .p-menuitem-icon {
        color: inherit !important;
      }

      /* Dropdown panels */

      :host ::ng-deep .admin-menubar .p-menubar-submenu {
        background: #ffffff !important;

        border: 1px solid #e5e7eb;

        border-radius: 8px;

        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      }

      /* Dropdown text */

      :host ::ng-deep .admin-menubar .p-menuitem-link {
        color: #374151 !important;
      }

      /* Dropdown hover */

      :host ::ng-deep .admin-menubar .p-menubar-submenu .p-menuitem-link:hover {
        background: #f3f4f6 !important;

        color: #ff6a00 !important;
      }

      /* =========================================
   SEARCH
========================================= */

      .search-section {
        flex: 0 1 220px;

        min-width: 160px;

        display: flex;
        align-items: center;
      }

      /*
   Prevent PrimeNG IconField from collapsing.
*/

      .desktop-search {
        width: 100%;

        display: block;
      }

      /*
   Input itself must occupy full width.
*/

      :host ::ng-deep .desktop-search input {
        width: 100%;

        min-width: 0;

        box-sizing: border-box;

        background: rgba(255, 255, 255, 0.12);

        border: 1px solid rgba(255, 255, 255, 0.2);

        color: #ffffff;

        border-radius: 8px;

        padding: 10px 12px 10px 38px;
      }

      :host ::ng-deep .desktop-search input::placeholder {
        color: rgba(255, 255, 255, 0.65);
      }

      :host ::ng-deep .desktop-search input:focus {
        border-color: #ff6a00;

        box-shadow: 0 0 0 2px rgba(255, 106, 0, 0.15);
      }

      /* Search icon */

      :host ::ng-deep .desktop-search .p-inputicon {
        color: #d1d5db;
      }

      /* Mobile search button */

      .mobile-search-btn {
        display: none;

        width: 40px;
        height: 40px;

        align-items: center;
        justify-content: center;

        border: none;
        border-radius: 8px;

        background: transparent;

        color: #ffffff;

        cursor: pointer;

        font-size: 18px;
      }

      .mobile-search-btn:hover {
        background: rgba(255, 255, 255, 0.1);

        color: #ff6a00;
      }

      /* =========================================
   RIGHT ACTIONS
========================================= */

      .topbar-actions {
        flex: 0 0 auto;

        display: flex;
        align-items: center;

        gap: 12px;
      }

      /* =========================================
   SETTINGS
========================================= */

      .action-btn {
        width: 40px;
        height: 40px;

        display: flex;
        align-items: center;
        justify-content: center;

        border: none;
        border-radius: 8px;

        background: transparent;

        color: #ffffff;

        cursor: pointer;

        font-size: 18px;

        transition:
          background 0.2s ease,
          color 0.2s ease;
      }

      .action-btn:hover {
        background: rgba(255, 255, 255, 0.1);

        color: #ff6a00;
      }

      /* =========================================
   USER
========================================= */

      .user-section {
        display: flex;
        align-items: center;

        gap: 10px;

        padding-left: 14px;

        border-left: 1px solid rgba(255, 255, 255, 0.2);
      }

      .avatar {
        width: 40px;
        height: 40px;

        display: flex;
        align-items: center;
        justify-content: center;

        flex: 0 0 auto;

        background: #ff6a00;

        color: #ffffff;

        border-radius: 50%;
      }

      .avatar i {
        font-size: 17px;
      }

      .user-details {
        display: flex;
        flex-direction: column;

        min-width: 90px;
      }

      .user-name {
        font-size: 14px;

        font-weight: 600;

        color: #ffffff;
      }

      .user-role {
        font-size: 12px;

        color: #d1d5db;
      }

      /* =========================================
   LOGOUT
========================================= */

      .logout-btn {
        width: 38px;
        height: 38px;

        display: flex;
        align-items: center;
        justify-content: center;

        flex: 0 0 auto;

        border: none;
        border-radius: 8px;

        background: transparent;

        color: #fca5a5;

        cursor: pointer;

        font-size: 17px;
      }

      .logout-btn:hover {
        background: rgba(255, 255, 255, 0.1);

        color: #ef4444;
      }

      /* =========================================
   TABLET
========================================= */

      @media (max-width: 1100px) {
        .topbar {
          padding: 0 18px;

          gap: 14px;
        }

        .navigation {
          overflow: hidden;
        }

        :host ::ng-deep .admin-menubar .p-menubar-root-list {
          overflow-x: auto;

          scrollbar-width: none;
        }

        :host ::ng-deep .admin-menubar .p-menubar-root-list::-webkit-scrollbar {
          display: none;
        }

        :host ::ng-deep .admin-menubar .p-menubar-item-link {
          padding: 9px 10px;

          font-size: 13px;
        }

        .search-section {
          flex: 0 1 180px;

          min-width: 140px;
        }
      }

      /* =========================================
   MOBILE
========================================= */

      @media (max-width: 768px) {
        .topbar {
          height: 64px;

          padding: 0 14px;

          gap: 8px;
        }

        /* Logo */

        .logo {
          width: 40px;
          height: 40px;
        }

        /* Hide desktop navigation */

        .navigation {
          display: none;
        }

        /*
     Search section becomes icon only.
  */

        .search-section {
          flex: 1;

          min-width: 0;

          justify-content: flex-end;
        }

        .desktop-search {
          display: none;
        }

        .mobile-search-btn {
          display: flex;
        }

        /* Actions */

        .topbar-actions {
          gap: 4px;
        }

        .settings-btn {
          display: none;
        }

        /* User */

        .user-section {
          padding-left: 8px;

          gap: 6px;
        }

        .user-details {
          display: none;
        }

        .avatar {
          width: 38px;
          height: 38px;
        }

        .logout-btn {
          width: 36px;
          height: 36px;
        }
      }

      /* =========================================
   SMALL MOBILE
========================================= */

      @media (max-width: 480px) {
        .topbar {
          padding: 0 10px;
        }

        .logo {
          width: 36px;
          height: 36px;
        }

        .mobile-search-btn {
          width: 36px;
          height: 36px;
        }

        .avatar {
          width: 36px;
          height: 36px;
        }

        .logout-btn {
          width: 34px;
          height: 34px;
        }
      }
    `,
  ],
})
export class AppTopbar {
  mobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.mobileMenuOpen.update((value) => !value);
  }

  constructor(private router: Router) {}

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  logout() {
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');

    this.router.navigate(['/login']);
  }

  nestedMenuItems = [
    {
      label: 'Customers',
      icon: 'pi pi-fw pi-table',
      items: [
        {
          label: 'New',
          icon: 'pi pi-fw pi-user-plus',
          items: [
            {
              label: 'Customer',
              icon: 'pi pi-fw pi-plus',
            },
            {
              label: 'Duplicate',
              icon: 'pi pi-fw pi-copy',
            },
          ],
        },
        {
          label: 'Edit',
          icon: 'pi pi-fw pi-user-edit',
        },
      ],
    },
    {
      label: 'Orders',
      icon: 'pi pi-fw pi-shopping-cart',
      items: [
        {
          label: 'View',
          icon: 'pi pi-fw pi-list',
        },
        {
          label: 'Search',
          icon: 'pi pi-fw pi-search',
        },
      ],
    },
    {
      label: 'Shipments',
      icon: 'pi pi-fw pi-envelope',
      items: [
        {
          label: 'Tracker',
          icon: 'pi pi-fw pi-compass',
        },
        {
          label: 'Map',
          icon: 'pi pi-fw pi-map-marker',
        },
        {
          label: 'Manage',
          icon: 'pi pi-fw pi-pencil',
        },
      ],
    },
    {
      label: 'Profile',
      icon: 'pi pi-fw pi-user',
      items: [
        {
          label: 'Settings',
          icon: 'pi pi-fw pi-cog',
        },
        {
          label: 'Billing',
          icon: 'pi pi-fw pi-file',
        },
      ],
    },
    {
      label: 'Quit',
      icon: 'pi pi-fw pi-sign-out',
    },
  ];
}
