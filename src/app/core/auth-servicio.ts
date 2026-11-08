import { Injectable, signal } from "@angular/core";
import type { Usuario } from "../models/producto";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  readonly user = signal<Usuario | null>({
    id: 1,
    nombre: "Joaquín Figueroa",
    email: "joakofigueroa07@gmail.com",
    rol: "admin" // Para que puedas probar el panel de administración libremente
  });

  isAuthenticated(): boolean {
    return this.user() !== null; 
  }

  isAdmin(): boolean {
    const u = this.user();
    return u !== null && u.rol === "admin";
  }

  login(credentials: { email: string; password: string }): boolean {
    // Simulamos un inicio de sesión exitoso guardando el usuario
    this.user.set({
      id: 1,
      nombre: "Joaquín Figueroa",
      email: credentials.email,
      rol: "admin"
    });
    return true;
  }

  register(data: { nombre: string; email: string; password: string }): boolean {
    this.user.set({
      id: 1,
      nombre: data.nombre,
      email: data.email,
      rol: "admin"
    });
    return true;
  }

  loadProfile(): Usuario | null {
    return this.user();
  }

  logout() {
    this.user.set(null);
  }
}