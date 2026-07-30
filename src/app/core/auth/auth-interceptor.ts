import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  filter,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { Router } from '@angular/router';
import { BranchContextService } from '@core/services/branch-context-service';
import { AuthService } from '@features/auth/services/auth-service';
import { environment } from 'environments/environment';

const BACKEND_URL = environment.BACKEND_URL;
const REFRESH_URL = `${BACKEND_URL}/api/Auth/refresh-token`;
const REVOKE_URL = `${BACKEND_URL}/api/Auth/revoke`;
const LOGIN_URL = `${BACKEND_URL}/api/Auth/Login`;

let isRefreshing = false;
const refreshResult$ = new BehaviorSubject<boolean | null>(null);

function isExcludedUrl(url: string): boolean {
  return url === REFRESH_URL || url === REVOKE_URL || url === LOGIN_URL;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const branchContext = inject(BranchContextService);
  const router = inject(Router);
  const http = inject(HttpClient);

  if (req.url.startsWith(BACKEND_URL)) {
    const headers: Record<string, string> = {};

    const existingBranchId = req.headers.get('X-Branch-Id');
    if (!existingBranchId) {
      const branchId = branchContext.getActiveBranchId();
      if (branchId) headers['X-Branch-Id'] = branchId;
    }

    req = req.clone({ setHeaders: headers, withCredentials: true });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) return throwError(() => error);

      if (isExcludedUrl(req.url)) {
        authService.logout();
        if (!router.url.includes('login')) {
          void router.navigate(['/login']);
        }
        return throwError(() => error);
      }

      if (isRefreshing) {
        return refreshResult$.pipe(
          filter((r) => r !== null),
          take(1),
          switchMap((r) => {
            if (!r) return throwError(() => error);
            return next(req.clone({ withCredentials: true }));
          }),
        );
      }

      isRefreshing = true;
      refreshResult$.next(null);

      return http.post<void>(REFRESH_URL, {}, { withCredentials: true }).pipe(
        switchMap(() => {
          isRefreshing = false;
          refreshResult$.next(true);
          return next(req.clone({ withCredentials: true }));
        }),
        catchError((refreshError) => {
          isRefreshing = false;
          refreshResult$.next(false);
          http.post(REVOKE_URL, {}, { withCredentials: true }).subscribe();
          authService.logout();
          if (!router.url.includes('login')) {
            void router.navigate(['/login']);
          }
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};