import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  return token
    ? true                          // hay token, permite acceso
    : router.createUrlTree(['/']); // no hay token, redirige al login
};


