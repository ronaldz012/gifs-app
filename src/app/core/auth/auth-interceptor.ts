import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { BranchContextService } from '@core/services/branch-context-service';
import { ConnectivityService } from '@core/services/connectivity-service';
import { environment } from 'environments/environment';
import { catchError, switchMap, throwError, timeout } from 'rxjs';

const BACKEND_URL = environment.BACKEND_URL;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth0 = inject(Auth0Service);
  const branchContext = inject(BranchContextService);

  if (req.url.includes('/api/Auth/health')) {
    return next(req);
  }

  if (!req.url.startsWith(BACKEND_URL)) {
    return next(req).pipe(
      timeout(8000),
      catchError((error: unknown) => {
        const status = (error as { status?: number })?.status;
        if (status === 0 || (error as { name?: string })?.name === 'TimeoutError') inject(ConnectivityService).markOffline('offline');
        else if (status !== undefined && status >= 500) inject(ConnectivityService).markOffline('backend-down');
        return throwError(() => error as HttpErrorResponse);
      }),
    );
  }

  const audience = environment.auth0.authorizationParams.audience;

  return auth0.getAccessTokenSilently({ authorizationParams: { audience } } as never).pipe(
    switchMap((token) => {
      if (!token) {
        return next(req).pipe(
          timeout(8000),
          catchError((error: unknown) => {
            const status = (error as { status?: number })?.status;
            if (status === 0 || (error as { name?: string })?.name === 'TimeoutError') inject(ConnectivityService).markOffline('offline');
            else if (status !== undefined && status >= 500) inject(ConnectivityService).markOffline('backend-down');
            return throwError(() => error as HttpErrorResponse);
          }),
        );
      }
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };
      const existingBranchId = req.headers.get('X-Branch-Id');
      if (!existingBranchId) {
        const branchId = branchContext.getActiveBranchId();
        if (branchId) headers['X-Branch-Id'] = branchId;
      }
      const authReq = req.clone({ setHeaders: headers });
      return next(authReq).pipe(
        timeout(8000),
        catchError((error: unknown) => {
          const status = (error as { status?: number })?.status;
          if (status === 0 || (error as { name?: string })?.name === 'TimeoutError') inject(ConnectivityService).markOffline('offline');
          else if (status !== undefined && status >= 500) inject(ConnectivityService).markOffline('backend-down');
          return throwError(() => error as HttpErrorResponse);
        }),
      );
    }),
    catchError((error: unknown) => {
      const status = (error as { status?: number })?.status;
      if (status === 0 || (error as { name?: string })?.name === 'TimeoutError') inject(ConnectivityService).markOffline('offline');
      else if (status !== undefined && status >= 500) inject(ConnectivityService).markOffline('backend-down');
      return throwError(() => error as HttpErrorResponse);
    }),
  );
};
