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

  // Obtenemos el token desde Auth0 (memoria o renovación silenciosa automática)
  return auth0.getAccessTokenSilently().pipe(
    switchMap((token) => {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };

      // Inyectar X-Branch-Id si no existe en la petición original
      const existingBranchId = req.headers.get('X-Branch-Id');
      if (!existingBranchId) {
        const branchId = branchContext.getActiveBranchId();
        if (branchId) headers['X-Branch-Id'] = branchId;
      }

      const authReq = req.clone({ setHeaders: headers });
      return next(authReq);
    }),
    catchError((error: HttpErrorResponse) => {
      // Si Auth0 no puede obtener token o el backend retorna 401
      if (error.status === 401) {
        // Redirigir al login unificado de Auth0
        auth0.loginWithRedirect();
      }
      return throwError(() => error);
    }),
  );
};
