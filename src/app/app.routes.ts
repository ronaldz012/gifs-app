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
    path: 'print',
    canActivate: [authGuard],
    children: [
      {
        path: 'receptions/:id',
        title: 'Imprimir Etiquetas',
        loadComponent: () => import('@features/inventory/pages/receptions-page/print-labels/print-labels')
      }
    ]
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('@layout/maint-layout/main-layout'),
    children: [
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
            loadComponent: () => import('@features/inventory/pages/products-page/products-page'),
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
              }
            ]
          },
          {
            path: 'receptions',
            loadComponent: () => import('@features/inventory/pages/receptions-page/receptions-page'),
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
            loadComponent: () => import('@features/inventory/pages/transfer-page/transfer-page'),
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
