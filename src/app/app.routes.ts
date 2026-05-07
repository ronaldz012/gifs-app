import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth-guard';
import { featureGuard } from './core/auth/guards/feature-guard';

export const routes: Routes = [
  // ── Layout principal (con sidebar/topbar) ────────────────────────────────
  {
    path: 'login',
    loadComponent: () => import('./core/auth/pages/login/login'),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/Dashboard/pages/dashboard/dashboard'),
    children: [

      // Home
      {
        path: 'home',
        title: 'Inicio',
        loadComponent: () => import('./core/pages/home-page')
      },

      // Páginas de errort
      {
        path: 'unauthorized',
        title: 'Sin permiso',
        loadComponent: () => import('./core/pages/unauthorize-page'),
      },
      {
        path: 'not-found',
        title: 'No encontrado',
        loadComponent: () => import('./core/pages/not-found-page'),
      },

      // ── Inventory ──────────────────────────────────────────────────────────
      {
        path: 'inventory',
        children: [
          {
            path: 'products',
            loadComponent: () => import('./inventory/pages/products-page/products-page'),
            children: [
              {
                path: '',
                title: 'Productos',
                canActivate: [featureGuard],
                data: { module: 'inventory', feature: 'products' },
                loadComponent: () => import('./inventory/pages/products-page/product-list/product-list'),
              },
              {
                path: ':id/detail',
                title: 'Detalle de Producto',
                canActivate: [featureGuard],
                data: { module: 'inventory', feature: 'products' },
                loadComponent: () => import('./inventory/pages/products-page/product-detail/product-detail'),
              },
            ],
          },
          {
            path: 'receptions',
            loadComponent: () => import('./inventory/pages/receptions-page/receptions-page'),
            children: [
              {
                path: '',
                title: 'Recepciones',
                canActivate: [featureGuard],
                data: { module: 'inventory', feature: 'receptions' },
                loadComponent: () => import('./inventory/pages/receptions-page/reception-list-page/reception-list-page'),
              },
              {
                path: 'new',
                title: 'Nueva Recepción',
                canActivate: [featureGuard],
                data: { module: 'inventory', feature: 'receptions', permission: 'canCreate' },
                loadComponent: () => import('./inventory/pages/receptions-page/reception-form/reception-form'),
              },
              {
                path: ':id',
                title: 'Detalle de Recepción',
                canActivate: [featureGuard],
                data: { module: 'inventory', feature: 'receptions' },
                loadComponent: () => import('./inventory/pages/receptions-page/reception-details/reception-details'),
              },
            ],
          },
          {
            path: 'transfers',
            loadComponent: () => import('./inventory/pages/transfer-page/transfer-page'),
            children: [
              {
                path: '',
                title: 'Transferencias',
                canActivate: [featureGuard],
                data: { module: 'inventory', feature: 'transfers' },
                loadComponent: () => import('./inventory/pages/transfer-page/transfer-list-page/transfer-list-page'),
              },
              {
                path: 'new',
                title: 'Nueva Transferencia',
                canActivate: [featureGuard],
                data: { module: 'inventory', feature: 'transfers', permission: 'canCreate' },
                loadComponent: () => import('./inventory/pages/transfer-page/create-transfer/create-transfer'),
              },
              {
                path: ':id',
                title: 'Detalle de Transferencia',
                canActivate: [featureGuard],
                data: { module: 'inventory', feature: 'transfers' },
                loadComponent: () => import('./inventory/pages/transfer-page/transfer-details/transfer-details'),
              },
            ],
          },
        ],
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
            loadComponent: () => import('./sales/pages/pos-page/pos-page'),
          },
        ],
      },

      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: '**', redirectTo: 'not-found' },
    ],
  },

  // ── Print — fuera del layout ───────────────────────────────────────────────
  {
    path: 'print',
    canActivate: [authGuard],
    children: [
      {
        path: 'receptions/:id',
        title: 'Imprimir Etiquetas',
        loadComponent: () => import('./inventory/pages/receptions-page/print-labels/print-labels'),
      },
    ],
  },

  // ── Auth ───────────────────────────────────────────────────────────────────
  { path: '**', redirectTo: '' },
];
