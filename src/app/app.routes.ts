import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/auth-guard';
import { featureGuard } from '@core/auth/feature-guard';


export const routes: Routes = [
  // ── Layout principal (con sidebar/topbar) ────────────────────────────────
  {
    path: 'login',
    loadComponent: () => import('@features/auth/login/login')
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('@layout/maint-layout/main-layout'),
    children: [
      //dev
      {path: 'dev',
        loadComponent: () => import('./dev/dev.component/dev.component'),
      },
      // Home
      {
        path: 'home',
        title: 'Inicio',
        loadComponent: () => import('@shared/components/pages/home-page')
      },
      // Páginas de error
      {
        path: 'unauthorized',
        title: 'Sin permiso',
        loadComponent: () => import('@shared/components/pages/unauthorize-page')
      },
      {
        path: 'not-found',
        title: 'No encontrado',
        loadComponent: () => import('@shared/components/pages/not-found-page')
      },
      // ── Inventory ──────────────────────────────────────────────────────────
      {
        path: 'inventory',
        children: [
          {
            path: 'products',
            children: [
              {
                path: '',
                title: 'Productos',
                canActivate: [featureGuard],
                data: { module: 'inventory', feature: 'products' },
                loadComponent: () => import('@features/inventory/pages/products-page/product-list/product-list')
              },
              {
                path: ':id/detail',
                title: 'Detalle de Producto',
                canActivate: [featureGuard],
                data: { module: 'inventory', feature: 'products' },
                loadComponent: () => import('@features/inventory/pages/products-page/product-detail/product-detail')
              },
              {
                path: ':id/movements',
                title: 'Movimientos de Stock',
                canActivate: [featureGuard],
                data: { module: 'inventory', feature: 'products' }, // O la feature que corresponda a kardex/movimientos
                loadComponent: () => import('@features/inventory/pages/products-page/stock-movements-list/stock-movements-list')
              }
            ]
          },
          {
            path: 'receptions',
            children: [
              {
                path: '',
                title: 'Recepciones',
                canActivate: [featureGuard],
                data: { module: 'inventory', feature: 'receptions' },
                loadComponent: () => import('@features/inventory/pages/receptions-page/reception-list-page/reception-list-page')
              },
              {
                path: 'new',
                title: 'Nueva Recepción',
                canActivate: [featureGuard],
                data: { module: 'inventory', feature: 'receptions', permission: 'canCreate' },
                loadComponent: () => import('@features/inventory/pages/receptions-page/reception-form/reception-form')
              },
              {
                path: ':id',
                title: 'Detalle de Recepción',
                canActivate: [featureGuard],
                data: { module: 'inventory', feature: 'receptions' },
                loadComponent: () => import('@features/inventory/pages/receptions-page/reception-details/reception-details')
              }
            ]
          },
          {
            path: 'transfers',
            children: [
              {
                path: '',
                title: 'Transferencias',
                canActivate: [featureGuard],
                data: { module: 'inventory', feature: 'transfers' },
                loadComponent: () => import('@features/inventory/pages/transfer-page/transfer-list-page/transfer-list-page')
              },
              {
                path: 'new',
                title: 'Nueva Transferencia',
                canActivate: [featureGuard],
                data: { module: 'inventory', feature: 'transfers', permission: 'canCreate' },
                loadComponent: () => import('@features/inventory/pages/transfer-page/create-transfer/create-transfer')
              },
              {
                path: ':id',
                title: 'Detalle de Transferencia',
                canActivate: [featureGuard],
                data: { module: 'inventory', feature: 'transfers' },
                loadComponent: () => import('@features/inventory/pages/transfer-page/transfer-details/transfer-details')
              }
            ]
          }
        ]
      },
      // ── Sales ──────────────────────────────────────────────────────────────
      {
        path: 'sales',
        children: [
          {
            path: 'pos',
            title: 'Punto de Venta',
            canActivate: [featureGuard],
            data: { module: 'sales', feature: 'pos' },
            loadComponent: () => import('@features/sales/pages/pos-page/pos-page')
          }
        ]
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: '**', redirectTo: 'not-found' }
    ]
  },

  // ── Print — fuera del layout (no specific routes defined here)
  // ── Auth ───────────────────────────────────────────────────────────────────
  { path: '**', redirectTo: '' }
];
