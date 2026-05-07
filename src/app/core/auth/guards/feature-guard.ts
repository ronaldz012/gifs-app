import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { BranchContextService } from '../branch-context-service';
import { Feature } from '../interfaces/Respones/LoginResponse';

/**
 * Datos esperados en route.data:
 *   module:     string  — coincide con Module.route   (ej: 'inventory')
 *   feature:    string  — coincide con Feature.route  (ej: 'products')
 *   permission: FeaturePermission — permiso mínimo requerido (default: 'canRead')
 */
export type FeaturePermission = 'canRead' | 'canCreate' | 'canUpdate' | 'canDelete';

export interface FeatureRouteData {
  module: string;
  feature: string;
  permission?: FeaturePermission;
}

export const featureGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const branchContext = inject(BranchContextService);

  const { module: moduleRoute, feature: featureRoute, permission = 'canRead' } =
    route.data as FeatureRouteData;

  // Sin datos de ruta configurados → dejar pasar (rutas sin restricción de feature)
  if (!moduleRoute || !featureRoute) return true;

  const active = branchContext.active();

  if (!active) {
    return router.createUrlTree(['/login']);
  }

  const mod = active.modules.find(m => m.route === moduleRoute);

  if (!mod) {
    return router.createUrlTree(['/unauthorized']);
  }

  const feature: Feature | undefined = mod.features.find(f => f.route === featureRoute);

  if (!feature || !feature[permission]) {
    return router.createUrlTree(['/unauthorized']);
  }

  return true;
};
