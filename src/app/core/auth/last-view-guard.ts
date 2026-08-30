import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BranchContextService } from '@core/services/branch-context-service';

const LAST_VIEW_KEY = 'last_view';

export interface LastView {
  branchId: string;
  path: string;
}

export const lastViewGuard: CanActivateFn = () => {
  const router = inject(Router);
  const branchContext = inject(BranchContextService);

  try {
    const raw = localStorage.getItem(LAST_VIEW_KEY);
    if (raw) {
      const last: LastView = JSON.parse(raw);
      if (last?.path && last?.branchId) {
        const branch = branchContext.available().find((b) => b.branchId === last.branchId);
        // Si el branch ya no existe o no tiene permiso, ignorar
        if (branch) {
          const hasAccess = branch.features.some((f) => {
            const route = f.route;
            // path exact or prefix match for nested
            return last.path === `/${route}` || last.path.startsWith(`/${route}/`) || last.path.startsWith(`/${route}?`);
          });
          // also check that current active branch's features allow, but we check target branch
          if (hasAccess) {
            // Switch active branch if needed to match last view's branch
            if (branchContext.active()?.branchId !== branch.branchId) {
              branchContext.setActive(branch);
            }
            return router.createUrlTree([last.path]);
          }
        }
      }
    }
  } catch {}

  // Fallback: si la última branch activa tiene POS, ir a POS, si no dashboard
  const active = branchContext.active();
  const hasPos = !!active?.features.find((f) => f.route === 'sales/pos' && (f.permissions.includes('read') || f.permissions.includes('*')));
  return router.createUrlTree([hasPos ? '/sales/pos' : '/dashboard']);
};
