import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./layout-page.component/layout-page.component').then(m => m.LayoutPageComponent),
    children: [
      { 
        path: '', 
        loadComponent: () => import('./homepage/homepage.component').then(m => m.HomepageComponent)
      },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./pages/dashboard/dashboard-layout/dashboard-layout').then(m => m.DashboardLayout),
        canActivate: [authGuard], // Protezione: accessibile solo se loggati
        children: [
          { 
            path: 'profile', 
            loadComponent: () => import('./pages/dashboard/user-profile/user-profile').then(m => m.UserProfile)
          },
          { path: '', redirectTo: 'profile', pathMatch: 'full' }
        ]
      }
    ]
  },
  { path: '**', redirectTo: '' }
];