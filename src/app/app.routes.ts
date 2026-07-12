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
        loadComponent: () => import('./homepage-real/homepage-real').then(m => m.HomepageReal)
      },
      {
        path: 'product/:id',
        loadComponent: () => import('./pages/products/product-detail/product-detail').then(m => m.ProductDetailComponent)
      },
      {
        path: 'risultati-ricerca',
        loadComponent: () => import('./pages/risultati-ricerca/risultati-ricerca').then(m => m.RisultatiRicerca)
      },
      {
        path: 'aiuto-contatti',
        loadComponent: () => import('./pages/aiuto-contatti/aiuto-contatti').then(m => m.AiutoContattiComponent)
      },
      {
        path: 'checkout',
        loadComponent: () => import('./pages/checkout/checkout').then(m => m.Checkout)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard-layout/dashboard-layout').then(m => m.DashboardLayout),
        canActivate: [authGuard], // Protezione: accessibile solo se loggati
        children: [
          {
            path: 'profilo',
            loadComponent: () => import('./pages/dashboard/user-profile/user-profile').then(m => m.UserProfile)
          },
          {
            path: 'indirizzi',
            loadComponent: () => import('./pages/dashboard/user-addresses/user-addresses').then(m => m.UserAddressesComponent)
          },
          {
            path: 'carte',
            loadComponent: () => import('./pages/dashboard/user-cards/user-cards').then(m => m.UserCardsComponent)
          },
          {
            path: 'preferiti',
            loadComponent: () => import('./pages/dashboard/wishlist/wishlist').then(m => m.Wishlist)
          },
          {
            path: 'carrello',
            loadComponent: () => import('./pages/cart/cart').then(m => m.Cart)
          },
          {
            path: 'ordini',
            loadComponent: () => import('./pages/dashboard/user-orders/user-orders').then(m => m.UserOrdersComponent)
          },
          { path: '', redirectTo: 'profilo', pathMatch: 'full' },
          {
            path: 'admin/categorie',
            loadComponent: () => import('./pages/admin/categories/category-list/category-list').then(m => m.CategoryList),
            canActivate: [adminGuard]
          },
          {
            path: 'admin/prodotti',
            loadComponent: () => import('./pages/admin/products/product-list/product-list').then(m => m.ProductList),
            canActivate: [adminGuard]
          },
          {
            path: 'admin/stanze',
            loadComponent: () => import('./pages/admin/rooms/room-list/room-list').then(m => m.RoomList),
            canActivate: [adminGuard]
          },
          {
            path: 'admin/ordini-tutti',
            loadComponent: () => import('./pages/admin/orders/order-list/order-list').then(m => m.OrderList),
            canActivate: [adminGuard]
          },
          {
            path: 'admin/resi',
            loadComponent: () => import('./pages/admin/returns/return-list/return-list').then(m => m.ReturnListComponent),
            canActivate: [adminGuard]
          },
          {
            path: 'admin/spedizioni',
            loadComponent: () => import('./pages/admin/shipments/shipment-list/shipment-list').then(m => m.ShipmentList),
            canActivate: [adminGuard]
          },
          {
            path: 'admin/magazzino',
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
