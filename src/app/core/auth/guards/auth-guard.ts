import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { BranchContextService } from '../branch-context-service';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp está en segundos, Date.now() en ms
    return payload.exp * 1000 < Date.now();
  } catch {
    // token malformado → tratar como expirado
    return true;
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const cookieService = inject(CookieService);
  const branchContext = inject(BranchContextService);

  const token = cookieService.get('auth_token');

  if (!token || isTokenExpired(token)) {
    cookieService.delete('auth_token');
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  // Restaurar branches si los signals están vacíos (recarga de página)
  if (branchContext.available().length === 0) {
    const raw = localStorage.getItem('branches');
    if (raw) {
      branchContext.restoreFromStorage(JSON.parse(raw));
    }
  }

  return true;
};