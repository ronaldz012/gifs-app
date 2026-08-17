import { inject, Injectable } from '@angular/core';
import { FeaturePermission } from '@core/auth/feature-guard';
import { BranchContextService } from '@core/services/branch-context-service';

/**
 * Uso en componentes:
 *
 *   readonly perm = inject(PermissionService);
 *
 *   // En template:
 *   @if (perm.can('inventory', 'products', 'create')) { <button>Nuevo</button> }
 *
 *   // O con helpers cortos:
 *   @if (perm.canCreate('inventory', 'products')) { ... }
 */
@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly branchContext = inject(BranchContextService);

  can(moduleRoute: string, featureRoute: string, permission: FeaturePermission): boolean {
    const active = this.branchContext.active();
    if (!active) return false;

    const feature = active.features.find((f) => f.route === `${moduleRoute}/${featureRoute}`);
    if (!feature) return false;
    return feature.permissions.includes('*') || feature.permissions.includes(permission);
  }

  canRead(moduleRoute: string, featureRoute: string): boolean {
    return this.can(moduleRoute, featureRoute, 'read');
  }

  canCreate(moduleRoute: string, featureRoute: string): boolean {
    return this.can(moduleRoute, featureRoute, 'create');
  }

  canUpdate(moduleRoute: string, featureRoute: string): boolean {
    return this.can(moduleRoute, featureRoute, 'update');
  }

  canDelete(moduleRoute: string, featureRoute: string): boolean {
    return this.can(moduleRoute, featureRoute, 'delete');
  }

  permsFor(moduleRoute: string, featureRoute: string) {
    return {
      canRead: this.canRead(moduleRoute, featureRoute),
      canCreate: this.canCreate(moduleRoute, featureRoute),
      canUpdate: this.canUpdate(moduleRoute, featureRoute),
      canDelete: this.canDelete(moduleRoute, featureRoute),
    };
  }

  /** Filtra features de menú que el usuario puede leer (para sidebar/dashboard). */
  hasReadPermission(feature: { permissions: string[] }): boolean {
    return feature.permissions.includes('*') || feature.permissions.includes('read');
  }
}
