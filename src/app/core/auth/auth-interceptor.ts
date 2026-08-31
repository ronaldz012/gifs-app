import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { BranchContextService } from '@core/services/branch-context-service';
import { ConnectivityService } from '@core/services/connectivity-service';
import { environment } from 'environments/environment';
import { catchError, switchMap, throwError, timeout, tap, MonoTypeOperatorFunction } from 'rxjs';

const BACKEND_URL = environment.BACKEND_URL;

function withConnectivityTracking<T>(connectivity: ConnectivityService): MonoTypeOperatorFunction<T> {
  return (source) =>
    source.pipe(
      timeout(8000),
      tap(() => connectivity.reportSuccess()),
      catchError((error: unknown) => {
        connectivity.reportFailure();
        Object.assign(error as object, { __connectivityHandled: true });
        return throwError(() => error as HttpErrorResponse);
      }),
    );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth0 = inject(Auth0Service);
  const branchContext = inject(BranchContextService);
  const connectivity = inject(ConnectivityService);
  const router = inject(Router);

  if (req.url.includes('/api/Auth/health') || req.url.includes('gstatic.com/generate_204')) {
    return next(req);
  }

  if (!req.url.startsWith(BACKEND_URL)) {
    return next(req).pipe(withConnectivityTracking(connectivity));
  }

  const audience = environment.auth0.authorizationParams.audience;

  return auth0.getAccessTokenSilently({ authorizationParams: { audience } } as never).pipe(
    switchMap((token) => {
      if (!token) {
        return next(req).pipe(withConnectivityTracking(connectivity));
      }
      const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
      const existingBranchId = req.headers.get('X-Branch-Id');
      if (!existingBranchId) {
        const branchId = branchContext.getActiveBranchId();
        if (branchId) headers['X-Branch-Id'] = branchId;
      }
      const authReq = req.clone({ setHeaders: headers });
      return next(authReq).pipe(withConnectivityTracking(connectivity));
    }),
    catchError((error: unknown) => {
      if ((error as { __connectivityHandled?: boolean })?.__connectivityHandled) {
        return throwError(() => error as HttpErrorResponse);
      }
      router.navigate(['/login'], { queryParams: { reason: 'session-expired' } });
      return throwError(() => error as HttpErrorResponse);
    }),
  );
};
