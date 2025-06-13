import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { appsettings } from '../settings/appsettings';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const publicPaths = [
    '/auth/login',
    '/auth/refresh',
    '/auth/verificaemail',
    '/api/users/register',
    '/api/restobar/buscarestobarpornombre',
    '/api/restobar/buscarestobarporubicacion',
    '/api/restobar/buscatodosrestobarparalanding'
  ];

  const relativeUrl = req.url.replace(appsettings.apiUrlBAse, '');
  const pathOnly = '/' + relativeUrl.split('?')[0];

  // Si la URL está en las rutas públicas, no modificar la solicitud
  if (publicPaths.includes(pathOnly)) {
    return next(req);
  }

  const token = localStorage.getItem('token');

  // Si no hay token, continuar la solicitud sin el header Authorization
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Redirigir solo si hubo intento de autenticación y se recibió 401
      if (error.status === 401 && token) {
        authService.logout();
        router.navigate(['']).then(() => location.reload());
      }
      return throwError(() => error);
    })
  );
};
