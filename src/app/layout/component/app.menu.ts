import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, AppMenuitem, RouterModule],
  template: `
    <ul class="layout-menu">
      @for (item of model; track item.label) {
        @if (!item.separator) {
          <li app-menuitem [item]="item" [root]="true"></li>
        } @else {
          <li class="menu-separator"></li>
        }
      }
    </ul>
  `,
})
export class AppMenu implements OnInit {
  model: MenuItem[] = [];

  ngOnInit() {
    this.model = [
      {
        label: 'OPERATIONS',
        items: [
          {
            label: 'Dashboard',
            icon: 'pi pi-fw pi-th-large',
            routerLink: ['/']
          },
          {
            label: 'Services',
            icon: 'pi pi-fw pi-wrench',
            routerLink: ['/services'],
            badge: '8',
            badgeClass: 'p-badge-warning'
          },
          {
            label: 'Appointments',
            icon: 'pi pi-fw pi-calendar-plus',
            routerLink: ['/appointments'],
            badge: '6',
            badgeClass: 'p-badge-info'
          },
          {
            label: 'Service Jobs',
            icon: 'pi pi-fw pi-sliders-h',
            routerLink: ['/service-jobs']
          }
        ]
      },
      {
        label: 'FLEET & CRM',
        items: [
          {
            label: 'Customers',
            icon: 'pi pi-fw pi-users',
            routerLink: ['/customers']
          },
          {
            label: 'Bicycles',
            icon: 'pi pi-fw pi-compass',
            routerLink: ['/bicycles']
          },
          {
            label: 'Technicians',
            icon: 'pi pi-fw pi-user-plus',
            routerLink: ['/technicians']
          }
        ]
      },
      {
        label: 'WORKSHOP & FINANCE',
        items: [
          {
            label: 'Inventory',
            icon: 'pi pi-fw pi-box',
            routerLink: ['/inventory']
          },
          {
            label: 'Payments',
            icon: 'pi pi-fw pi-credit-card',
            routerLink: ['/payments']
          },
          {
            label: 'Reports',
            icon: 'pi pi-fw pi-chart-line',
            routerLink: ['/reports']
          }
        ]
      },
      {
        label: 'SYSTEM',
        items: [
          {
            label: 'Settings',
            icon: 'pi pi-fw pi-cog',
            routerLink: ['/settings']
          }
        ]
      }
    ];
  }
}
