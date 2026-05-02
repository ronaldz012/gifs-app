import { Routes } from '@angular/router';
import {authGuard} from './core/auth/guards/auth-guard';

// @ts-ignore
export const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./core/Dashboard/pages/dashboard/dashboard'),
    children: [
      {
        path: 'inventory',
        children: [
          {
            path: 'products',
            loadComponent: () => import('./inventory/pages/products-page/products-page'),
            children: [
              {
                path: '',
                title: 'Lista de Productos',
                loadComponent: () => import('./inventory/pages/products-page/product-list/product-list')
              },
              {
                path: ':id/detail',
                title: 'Detalle de Producto',
                loadComponent: () => import('./inventory/pages/products-page/product-detail/product-detail')
              },
              // {
              //   path: ':id/stock',
              //   title: 'Stock de Producto',
              //   loadComponent: () => import('./inventory/pages/products-page/product-stock/product-stock')
              // },
              // {
              //   path: ':id/movements',
              //   title: 'Movimientos de Producto',
              //   loadComponent: () => import('./inventory/pages/products-page/product-movements/product-movements')
              // },
            ]
          },
          { path: 'receptions', loadComponent: () => import('./inventory/pages/receptions-page/receptions-page'),
            children: [
              {
                path: '',
                title:'receptions',
                loadComponent: () => import('./inventory/pages/receptions-page/reception-list-page/reception-list-page'),
              },
              {
                path: 'new',
                title:'receptions',
                loadComponent: () => import('./inventory/pages/receptions-page/reception-form/reception-form')
              },
              {
                path: ':id',
                title:'receptions',
                loadComponent: () => import('./inventory/pages/receptions-page/reception-details/reception-details'),
              },

            ]
          },
          { path: 'transfers', loadComponent: () => import('./inventory/pages/transfer-page/transfer-page'),
            children:[
              {
                path: '',
                title:'Transferencias',
                loadComponent: () => import('./inventory/pages/transfer-page/transfer-list-page/transfer-list-page')
              },
              {
                path: 'new',
                title:'Transferencias',
                loadComponent: () => import('./inventory/pages/transfer-page/create-transfer/create-transfer')
              },
              {
                path: ':id',
                title:'Transferencias',
                loadComponent: () => import('./inventory/pages/transfer-page/transfer-details/transfer-details'),
              },

            ]
          },
        ]
      },
      {
        path: 'sales',
        children: [
          { path: 'pos', loadComponent: () => import('./sales/pages/pos-page/pos-page') },
        ]
      },
      {
        path: '**',
        redirectTo: ''
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./core/auth/pages/login/login'),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
