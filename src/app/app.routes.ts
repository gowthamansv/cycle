import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { ServiceDashboardComponent } from './pages/service-dashboard/service-dashboard.component';
import { ServicesListComponent } from './pages/services-mgmt/services-list.component';
import { ServiceFormComponent } from './pages/services-mgmt/service-form.component';
import { AppointmentsListComponent } from './pages/appointments/appointments-list.component';
import { AppointmentFormComponent } from './pages/appointments/appointment-form.component';
import { ServiceJobsListComponent } from './pages/service-jobs/service-jobs-list.component';
import { CustomersListComponent } from './pages/customers/customers-list.component';
import { CustomerDetailComponent } from './pages/customers/customer-detail.component';
import { BicyclesListComponent } from './pages/bicycles/bicycles-list.component';
import { BicycleDetailComponent } from './pages/bicycles/bicycle-detail.component';
import { TechniciansListComponent } from './pages/technicians/technicians-list.component';
import { TechnicianDetailComponent } from './pages/technicians/technician-detail.component';
import { InventoryListComponent } from './pages/inventory/inventory-list.component';
import { PaymentsListComponent } from './pages/payments/payments-list.component';
import { ReportsDashboardComponent } from './pages/reports/reports-dashboard.component';
import { WorkshopSettingsComponent } from './pages/settings/workshop-settings.component';

import { Landing } from './pages/landing/landing';
import { AdminLoginComponent } from './pages/auth/admin-login.component';
import { NotFoundComponent } from './pages/notfound/notfound';
import { adminGuard } from './common/guards/admin.guard';
import { authGuard } from './common/guards/auth.guard';

// Existing UI Kit Demos for reference
import { MenuDemo } from './pages/uikit/menudemo';
import { TreeDemo } from './pages/uikit/treedemo';
import { OverlayDemo } from './pages/uikit/overlaydemo';
import { TableDemo } from './pages/uikit/tabledemo';
import { TimelineDemo } from './pages/uikit/timelinedemo';
import { PanelsDemo } from './pages/uikit/panelsdemo';
import { MiscDemo } from './pages/uikit/miscdemo';
import { MessagesDemo } from './pages/uikit/messagesdemo';
import { MediaDemo } from './pages/uikit/mediademo';
import { ListDemo } from './pages/uikit/listdemo';
import { InputDemo } from './pages/uikit/inputdemo';
import { FormLayoutDemo } from './pages/uikit/formlayoutdemo';
import { FileDemo } from './pages/uikit/filedemo';
import { ButtonDemo } from './pages/uikit/buttondemo';
import { ChartDemo } from './pages/uikit/chartdemo';
import { Documentation } from './pages/documentation/documentation';
import { Crud } from './pages/crud/crud';
import { Empty } from './pages/empty/empty';
import { Login } from './pages/auth/login';
import { Access } from './pages/auth/access';
import { Error } from './pages/auth/error';

export const routes: Routes = [
  // Dedicated Admin Authentication Route
  {
    path: 'admin/login',
    component: AdminLoginComponent,
    title: 'Admin Portal Login | Cycle Service Center'
  },

  // Public Landing & Customer Entry Routes
  {
    path: 'landing',
    component: Landing,
    title: 'Cycle Service Center • Premium Workshop & Maintenance'
  },
  {
    path: 'login',
    component: Login,
    title: 'Customer Login | Cycle Service Center'
  },
  { path: 'auth/login', component: AdminLoginComponent },
  { path: 'auth/access', component: Access, title: 'Access Denied' },
  { path: 'auth/error', component: Error, title: 'System Error' },

  // Bicycle Service Management Routes (Base Protected by AuthGuard)
  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      // Primary Operational Dashboard (Admin Only)
      { path: '', component: ServiceDashboardComponent, canActivate: [adminGuard], title: 'Dashboard | Cycle Service Center' },
      { path: 'admin', component: ServiceDashboardComponent, canActivate: [adminGuard], title: 'Admin Workspace | Cycle Service Center' },
      { path: 'dashboard', component: ServiceDashboardComponent, canActivate: [adminGuard], title: 'Dashboard | Cycle Service Center' },

      // Services (Accessible to both Admin and User)
      { path: 'services', component: ServicesListComponent, title: 'Services | Cycle Service Center' },
      { path: 'services/new', component: ServiceFormComponent, title: 'Create Service | Cycle Service Center' },

      // Appointments (Admin Only)
      { path: 'appointments', component: AppointmentsListComponent, canActivate: [adminGuard], title: 'Appointments | Cycle Service Center' },
      { path: 'appointments/new', component: AppointmentFormComponent, canActivate: [adminGuard], title: 'New Appointment | Cycle Service Center' },

      // Service Jobs (Admin Only)
      { path: 'service-jobs', component: ServiceJobsListComponent, canActivate: [adminGuard], title: 'Service Jobs | Cycle Service Center' },

      // Customers (Accessible to both - User sees direct create interface)
      { path: 'customers', component: CustomersListComponent, title: 'Customers | Cycle Service Center' },
      { path: 'customers/:id', component: CustomerDetailComponent, canActivate: [adminGuard], title: 'Customer Profile | Cycle Service Center' },

      // Bicycles (Accessible to both - User sees direct create interface)
      { path: 'bicycles', component: BicyclesListComponent, title: 'Bicycle Fleet | Cycle Service Center' },
      { path: 'bicycles/:id', component: BicycleDetailComponent, canActivate: [adminGuard], title: 'Bicycle Profile | Cycle Service Center' },

      // Technicians (Admin Only)
      { path: 'technicians', component: TechniciansListComponent, canActivate: [adminGuard], title: 'Technicians | Cycle Service Center' },
      { path: 'technicians/:id', component: TechnicianDetailComponent, canActivate: [adminGuard], title: 'Technician Profile | Cycle Service Center' },

      // Workshop & Finance (Admin Only)
      // { path: 'inventory', component: InventoryListComponent, canActivate: [adminGuard], title: 'Inventory | Cycle Service Center' },
      // { path: 'payments', component: PaymentsListComponent, canActivate: [adminGuard], title: 'Payments | Cycle Service Center' },
      // { path: 'reports', component: ReportsDashboardComponent, canActivate: [adminGuard], title: 'Reports | Cycle Service Center' },

      // Settings (Role-aware for both Admin and User)
      { path: 'settings', component: WorkshopSettingsComponent, title: 'Settings | Cycle Service Center' },

      // Template & UIKit Demo Pages (Admin Only)
      { path: 'documentation', component: Documentation, canActivate: [adminGuard] },
      { path: 'crud', component: Crud, canActivate: [adminGuard] },
      { path: 'empty', component: Empty, canActivate: [adminGuard] },
      { path: 'pages/crud', component: Crud, canActivate: [adminGuard] },
      { path: 'pages/empty', component: Empty, canActivate: [adminGuard] },
      { path: 'pages/notfound', component: NotFoundComponent },

      // UI Kit Demos
      { path: 'button', data: { breadcrumb: 'Button' }, component: ButtonDemo },
      { path: 'charts', data: { breadcrumb: 'Charts' }, component: ChartDemo },
      { path: 'file', data: { breadcrumb: 'File' }, component: FileDemo },
      { path: 'formlayout', data: { breadcrumb: 'Form Layout' }, component: FormLayoutDemo },
      { path: 'input', data: { breadcrumb: 'Input' }, component: InputDemo },
      { path: 'list', data: { breadcrumb: 'List' }, component: ListDemo },
      { path: 'media', data: { breadcrumb: 'Media' }, component: MediaDemo },
      { path: 'message', data: { breadcrumb: 'Message' }, component: MessagesDemo },
      { path: 'misc', data: { breadcrumb: 'Misc' }, component: MiscDemo },
      { path: 'panel', data: { breadcrumb: 'Panel' }, component: PanelsDemo },
      { path: 'timeline', data: { breadcrumb: 'Timeline' }, component: TimelineDemo },
      { path: 'table', data: { breadcrumb: 'Table' }, component: TableDemo },
      { path: 'overlay', data: { breadcrumb: 'Overlay' }, component: OverlayDemo },
      { path: 'tree', data: { breadcrumb: 'Tree' }, component: TreeDemo },
      { path: 'menu', data: { breadcrumb: 'Menu' }, component: MenuDemo },
      { path: 'uikit/button', component: ButtonDemo },
      { path: 'uikit/charts', component: ChartDemo },
      { path: 'uikit/file', component: FileDemo },
      { path: 'uikit/formlayout', component: FormLayoutDemo },
      { path: 'uikit/input', component: InputDemo },
      { path: 'uikit/list', component: ListDemo },
      { path: 'uikit/media', component: MediaDemo },
      { path: 'uikit/message', component: MessagesDemo },
      { path: 'uikit/misc', component: MiscDemo },
      { path: 'uikit/panel', component: PanelsDemo },
      { path: 'uikit/timeline', component: TimelineDemo },
      { path: 'uikit/table', component: TableDemo },
      { path: 'uikit/overlay', component: OverlayDemo },
      { path: 'uikit/tree', component: TreeDemo },
      { path: 'uikit/menu', component: MenuDemo },
    ],
  },

  // 404 Not Found Handling
  {
    path: 'notfound',
    component: NotFoundComponent,
    title: '404 - Page Not Found | Cycle Service Center'
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: '404 - Page Not Found | Cycle Service Center'
  },
];
