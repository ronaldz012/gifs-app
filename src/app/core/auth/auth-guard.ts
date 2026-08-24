import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { SessionService } from '@features/auth/services/session-service';
import { map, catchError, of, switchMap, filter, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const sessionService = inject(SessionService);
  const auth = inject(AuthService);

  if (state.url.includes('code=') && state.url.includes('state=')) {
    const search = window.location.search;
    history.replaceState({}, '', '/callback' + search);
    return of(router.createUrlTree(['/callback']));
  }

  return auth.isLoading$.pipe(
    filter((loading) => !loading),
    take(1),
    switchMap(() =>
      auth.isAuthenticated$.pipe(
        take(1),
        switchMap((isAuth) => {
          if (!isAuth) {
            return of(router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }));
          }
          return sessionService.restore().pipe(
            map(() => true),
            catchError(() =>
              of(router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } })),
            ),
          );
        }),
      ),
    ),
  );
};
