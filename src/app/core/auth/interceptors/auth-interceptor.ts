import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {environment} from '../../../../environments/environment';
import {catchError, throwError} from 'rxjs';
import {AuthService} from '../auth.service';
import {Router} from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token= inject(CookieService).get('auth_token');
  const authService = inject(AuthService);
  const router = inject(Router);

  if(token && req.url.startsWith(environment.BACKEND_URL)) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout(); // Limpiamos todo
        if (!router.url.includes('login')) {
          void router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    }));
}
