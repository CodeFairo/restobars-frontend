import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  return token
    ? true                          // hay token, permite acceso
    : router.createUrlTree(['/']); // no hay token, redirige al login
};


/*import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccesoService } from '../services/acceso.service';

export const authGuard: CanActivateFn = (route, state) => {
     const token = localStorage.getItem("token") || "";
     const router = inject(Router);

     const accesoService = inject(AccesoService)
     if(token != ""){  
          return true;
     }else {
          const url = router.createUrlTree([""])
          return url;
     }
  
};*/
