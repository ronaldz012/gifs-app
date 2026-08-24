import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { BranchContextService } from '@core/services/branch-context-service';
import { environment } from 'environments/environment';
import { catchError, switchMap, throwError } from 'rxjs';

const BACKEND_URL = environment.BACKEND_URL;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth0 = inject(Auth0Service);
  const branchContext = inject(BranchContextService);

  // Si la petición NO es hacia tu backend, continuar normalmente
  if (!req.url.startsWith(BACKEND_URL)) {
    return next(req);
  }

  const audience = environment.auth0.authorizationParams.audience;

  return auth0.getAccessTokenSilently({ authorizationParams: { audience } } as never).pipe(
    switchMap((token) => {
      if (!token) {
        return next(req);
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
      return next(authReq);
    }),
    catchError((error: unknown) => {
      return throwError(() => error as HttpErrorResponse);
    }),
  );
};
