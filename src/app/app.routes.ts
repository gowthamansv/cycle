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

    children: [
      // Primary Operational Dashboard (Admin Only)
      { path: '', component: ServiceDashboardComponent, title: 'Dashboard | Cycle Service Center' },
      { path: 'admin', component: ServiceDashboardComponent, title: 'Admin Workspace | Cycle Service Center' },
      { path: 'dashboard', component: ServiceDashboardComponent, title: 'Dashboard | Cycle Service Center' },

      // Services (Accessible to both Admin and User)
      { path: 'services', component: ServicesListComponent, title: 'Services | Cycle Service Center' },
      { path: 'services/new', component: ServiceFormComponent, title: 'Create Service | Cycle Service Center' },

      // Appointments (Admin Only)
      // { path: 'appointments', component: AppointmentsListComponent,  title: 'Appointments | Cycle Service Center' },
      // { path: 'appointments/new', component: AppointmentFormComponent,  title: 'New Appointment | Cycle Service Center' },

      // Service Jobs (Redirected to unified Services Management)
      // { path: 'service-jobs', redirectTo: 'services', pathMatch: 'full' },

      // Customers (Accessible to both - User sees direct create interface)
      { path: 'customers', component: CustomersListComponent, title: 'Customers | Cycle Service Center' },
      { path: 'customers/:id', component: CustomerDetailComponent, title: 'Customer Profile | Cycle Service Center' },

      // Bicycles (Accessible to both - User sees direct create interface)
      { path: 'bicycles', component: BicyclesListComponent, title: 'Bicycle Fleet | Cycle Service Center' },
      { path: 'bicycles/:id', component: BicycleDetailComponent, title: 'Bicycle Profile | Cycle Service Center' },

      // Technicians (Admin Only)
      { path: 'technicians', component: TechniciansListComponent, title: 'Technicians | Cycle Service Center' },
      { path: 'technicians/:id', component: TechnicianDetailComponent, title: 'Technician Profile | Cycle Service Center' },

      // Settings (Role-aware for both Admin and User)
      // { path: 'settings', component: WorkshopSettingsComponent, title: 'Settings | Cycle Service Center' },

      // Template & UIKit Demo Pages (Admin Only)
      { path: 'documentation', component: Documentation, },
      { path: 'crud', component: Crud, },
      { path: 'empty', component: Empty, },
      { path: 'pages/crud', component: Crud, },
      { path: 'pages/empty', component: Empty, },
      { path: 'pages/notfound', component: NotFoundComponent },
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
