import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SessionService } from '@features/auth/services/session-service';
import { map, catchError, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const sessionService = inject(SessionService);

  return sessionService.restore().pipe(
    map(() => true),
    catchError(() =>
      of(
        router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url },
        }),
      ),
    ),
  );
};
