// guards/auth-interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../servicios/auth-servicio'; // <-- Apunta al nombre exacto de tu archivo

export const authInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  const token = inject(AuthService).getToken();

  if (token) {
    const peticionClonada = peticion.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return siguiente(peticionClonada);
  }

  return siguiente(peticion);
};