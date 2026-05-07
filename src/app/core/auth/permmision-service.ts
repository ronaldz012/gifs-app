import { inject, Injectable } from '@angular/core';
import {FeaturePermission} from './guards/feature-guard';
import {BranchContextService} from './branch-context-service';

/**
 * Uso en componentes:
 *
 *   readonly perm = inject(PermissionService);
 *
 *   // En template:
 *   @if (perm.can('inventory', 'products', 'canCreate')) { <button>Nuevo</button> }
 *
 *   // O con helpers cortos:
 *   @if (perm.canCreate('inventory', 'products')) { ... }
 */
@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly branchContext = inject(BranchContextService);

  /**
   * Verifica un permiso específico sobre una feature.
   * @param moduleRoute  Valor de Module.route  (ej: 'inventory')
   * @param featureRoute Valor de Feature.route (ej: 'products')
   * @param permission   Permiso a verificar     (ej: 'canCreate')
   */
  can(moduleRoute: string, featureRoute: string, permission: FeaturePermission): boolean {
    const active = this.branchContext.active();
    if (!active) return false;

    const mod = active.modules.find(m => m.route === moduleRoute);
    if (!mod) return false;

    const feature = mod.features.find(f => f.route === featureRoute);
    return feature?.[permission] ?? false;
  }

  // ── Helpers cortos ──────────────────────────────────────────────────────────

  canRead(moduleRoute: string, featureRoute: string): boolean {
    return this.can(moduleRoute, featureRoute, 'canRead');
  }

  canCreate(moduleRoute: string, featureRoute: string): boolean {
    return this.can(moduleRoute, featureRoute, 'canCreate');
  }

  canUpdate(moduleRoute: string, featureRoute: string): boolean {
    return this.can(moduleRoute, featureRoute, 'canUpdate');
  }

  canDelete(moduleRoute: string, featureRoute: string): boolean {
    return this.can(moduleRoute, featureRoute, 'canDelete');
  }

  /**
   * Devuelve todos los permisos de una feature de una vez.
   * Útil para pasarlos como input a un componente.
   *
   * Ejemplo:
   *   readonly perms = computed(() => this.perm.permsFor('inventory', 'products'));
   *   // { canRead: true, canCreate: false, canUpdate: true, canDelete: false }
   */
  permsFor(moduleRoute: string, featureRoute: string) {
    return {
      canRead: this.canRead(moduleRoute, featureRoute),
      canCreate: this.canCreate(moduleRoute, featureRoute),
      canUpdate: this.canUpdate(moduleRoute, featureRoute),
      canDelete: this.canDelete(moduleRoute, featureRoute),
    };
  }
}
