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
            routerLink: ['/services']
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
    ];
  }
}
