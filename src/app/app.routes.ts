import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { Dashboard } from './pages/dashboard/dashboard';
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

export const routes: Routes = [
  {
    path: '',
    component: AppLayout,
  },
  {
    path: 'dashboard',
    component: Dashboard,
  },
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
  { path: '**', redirectTo: '/notfound' },
];
