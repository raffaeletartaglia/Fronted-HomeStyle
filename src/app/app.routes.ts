import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin-guard';

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
        path: 'product/:id',
        loadComponent: () => import('./pages/products/product-detail/product-detail').then(m => m.ProductDetailComponent)
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
          { path: '', redirectTo: 'profile', pathMatch: 'full' },
          {
            path: 'admin/categories',
            loadComponent: () => import('./pages/admin/categories/category-list/category-list').then(m => m.CategoryList),
            canActivate: [adminGuard]
          },
          {
            path: 'admin/products',
            loadComponent: () => import('./pages/admin/products/product-list/product-list').then(m => m.ProductList),
            canActivate: [adminGuard]
          },
          {
            path: 'admin/rooms',
            loadComponent: () => import('./pages/admin/rooms/room-list/room-list').then(m => m.RoomList),
            canActivate: [adminGuard]
          },
          {
            path: 'admin/all-orders',
            loadComponent: () => import('./pages/admin/orders/order-list/order-list').then(m => m.OrderList),
            canActivate: [adminGuard]
          },
          {
            path: 'admin/returns',
            loadComponent: () => import('./pages/admin/returns/return-list/return-list').then(m => m.ReturnListComponent),
            canActivate: [adminGuard]
          },
          {
            path: 'admin/shipments',
            loadComponent: () => import('./pages/admin/shipments/shipment-list/shipment-list').then(m => m.ShipmentList),
            canActivate: [adminGuard]
          },
          {
            path: 'admin/inventory',
            loadComponent: () => import('./pages/admin/inventory/inventory-list/inventory-list').then(m => m.InventoryList),
            canActivate: [adminGuard]
          }
        ]
      }
    ]
  },
  { 
    path: 'not-found', 
    loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFound)
  },
  { path: '**', redirectTo: 'not-found' }
];
