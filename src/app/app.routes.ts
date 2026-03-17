import { Routes } from '@angular/router';
import {authGuard} from './core/auth/guards/auth-guard';

export const routes: Routes = [
    {
        path:'dashboard',
        // canActivate:[authGuard],
      loadComponent: () => import('./gifs/pages/dashboard/dashboard'),
        children:[
                {
                    path:'trending',
                    loadComponent:() => import('./gifs/pages/trending/trending')
                },
                {
                    path:'search',
                    loadComponent:() => import('./gifs/pages/search/search')
                },
                {
                  path:'products',
                  loadComponent: () => import('./inventory/pages/products-page/products-page')
                },
                {
                  path:'receptions',
                  loadComponent: () => import('./inventory/pages/receptions-page/receptions-page')
                },
                {
                  path:'**',
                  redirectTo: 'trending',
                }

        ]
    },
    {
      path:'login',
      loadComponent: () => import('./core/auth/pages/login/login'),
    },
    {
        path:'**',
        redirectTo:'dashboard'
    }

];
