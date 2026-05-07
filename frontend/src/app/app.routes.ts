import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: '',
    loadComponent: () => import('./pages/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'mis-tanques',
        loadComponent: () => import('./pages/mis-tanques/mis-tanques.component').then(m => m.MisTanquesComponent),
      },
      {
        path: 'mediciones/:sensorId',
        loadComponent: () => import('./components/graficos/graficos.component').then(m => m.GraficosComponent),
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./pages/admin/usuarios/usuarios.component').then(m => m.UsuariosComponent),
        canActivate: [adminGuard],
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];