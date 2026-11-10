import { inject } from "@angular/core";
import { Router, type CanActivateFn } from "@angular/router";
import { AuthService } from "../servicios/auth-servicio"; // Ajusta la ruta si es necesario

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  // Si no es admin, redirige al inicio
  router.navigate(["/"]);
  return false;
};