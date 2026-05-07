import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth-guard';

export const routes: Routes = [
  // ── Layout principal ────────────────────────────────────────────────────────
  {
    path: 'print',
    canActivate: [authGuard],
    children: [
      {
        path: 'receptions/:id',
        title: 'Imprimir Etiquetas',
        loadComponent: () => import('./inventory/pages/receptions-page/print-labels/print-labels'),
      },
      // Futuras rutas de impresión:
      // { path: 'sales/:id', loadComponent: () => import(...) },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/Dashboard/pages/dashboard/dashboard'),
    children: [

      // Inventory
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
                loadComponent: () => import('./inventory/pages/products-page/product-list/product-list'),
              },
              {
                path: ':id/detail',
                title: 'Detalle de Producto',
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
                loadComponent: () => import('./inventory/pages/receptions-page/reception-list-page/reception-list-page'),
              },
              {
                path: 'new',
                title: 'Nueva Recepción',
                loadComponent: () => import('./inventory/pages/receptions-page/reception-form/reception-form'),
              },
              {
                path: ':id',
                title: 'Detalle de Recepción',
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
                loadComponent: () => import('./inventory/pages/transfer-page/transfer-list-page/transfer-list-page'),
              },
              {
                path: 'new',
                title: 'Nueva Transferencia',
                loadComponent: () => import('./inventory/pages/transfer-page/create-transfer/create-transfer'),
              },
              {
                path: ':id',
                title: 'Detalle de Transferencia',
                loadComponent: () => import('./inventory/pages/transfer-page/transfer-details/transfer-details'),
              },
            ],
          },
        ],
      },

      // Sales
      {
        path: 'sales',
        children: [
          {
            path: 'pos',
            title: 'Punto de Venta',
            loadComponent: () => import('./sales/pages/pos-page/pos-page'),
          },
        ],
      },

      { path: '', redirectTo: 'inventory/receptions', pathMatch: 'full' },
      { path: '**', redirectTo: 'inventory/receptions' },
    ],
  },

  // ── Print — fuera del layout, sin sidebar/topbar ─────────────────────────

  // ── Auth ────────────────────────────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () => import('./core/auth/pages/login/login'),
  },

  { path: '**', redirectTo: '' },
];
