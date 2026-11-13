import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../servicios/auth-servicio';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/inicioSesion']);
  }

  return auth.isAdmin() ? true : router.createUrlTree(['/productos']);
};