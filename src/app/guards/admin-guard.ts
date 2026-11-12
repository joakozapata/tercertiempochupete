import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Puedes verificar el token o un rol específico guardado en el localStorage
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol'); // O la forma en que guardes el rol del usuario

  if (token && rol === 'admin') {
    return true; // Permite el paso si es administrador
  }

  // Si no tiene permisos, lo redirige al inicio o al login
  router.navigate(['/']);
  return false;
};