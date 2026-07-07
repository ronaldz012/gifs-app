import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { BranchContextService } from '@core/services/branch-context-service';
import { CookieService } from 'ngx-cookie-service';
import { SessionService } from '@features/auth/services/session-service';
import { map, catchError, of } from 'rxjs';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const cookieService = inject(CookieService);
  const branchContext = inject(BranchContextService);
  const sessionService = inject(SessionService);

  const token = cookieService.get('auth_token');

  if (!token || isTokenExpired(token)) {
    cookieService.delete('auth_token');
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  if (branchContext.available().length === 0) {
    return sessionService.restore().pipe(
      map(() => true),
      catchError(() => of(router.createUrlTree(['/login'])))
    );
  }

  return true;
};
