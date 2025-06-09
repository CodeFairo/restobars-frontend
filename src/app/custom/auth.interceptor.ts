import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  // Ignorar login y creación de usuario
  if (req.url.includes('login') || req.url.includes('register')|| req.url.includes('verificaemail')|| req.url.includes('inicio')) {
    return next(req);
  }

  const token = localStorage.getItem('token');

  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(clonedRequest).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        // Token inválido o expirado
        authService.logout();
        //router.navigate(['/login']);
        router.navigate(['/login']).then(() => {
          location.reload();
        });
      }
      return throwError(() => err);
    })
  );
};