import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'user' | 'admin';
  creado?: string;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost/API_TercerTiempo/public';

  readonly user = signal<Usuario | null>(this.getStoredUser());

  private getStoredUser(): Usuario | null {
    const stored = localStorage.getItem("usuario");
    return stored ? JSON.parse(stored) : null;
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  estaLogueado(): boolean {
    return this.user() !== null && !!this.getToken();
  }

  // <--- SE AGREGA ESTO PARA EVITAR EL ERROR EN EL COMPONENTE
  isAuthenticated(): boolean {
    return this.estaLogueado();
  }

  esAdmin(): boolean {
    const u = this.user();
    return u !== null && u.rol === "admin";
  }

  // <--- AGREGA ESTE ALIAS AQUÍ
  isAdmin(): boolean {
    return this.esAdmin();
  }

  nombreUsuario(): string {
    return this.user()?.nombre ?? "";
  }

login(credentials: { email: string; clave?: string; password?: string }): Observable<{ token: string; usuario: Usuario }> {
    const passwordAEnviar = credentials.password ?? credentials.clave ?? "";
    return this.http
      .post<{ token: string; usuario: Usuario }>(`${this.apiUrl}/usuarios/login`, {
        email: credentials.email.trim().toLowerCase(),
        password: passwordAEnviar,
      })
      .pipe(
        tap((res) => {
          localStorage.setItem("token", res.token);
          localStorage.setItem("usuario", JSON.stringify(res.usuario));
          localStorage.setItem("rol", res.usuario.rol);
          this.user.set(res.usuario);
        })
      );
  }

 registro(data: { nombre: string; email: string; clave?: string; password?: string }): Observable<any> {
    const passwordAEnviar = data.clave ?? data.password ?? "";
    return this.http.post(`${this.apiUrl}/registro`, {
      nombre: data.nombre,
      email: data.email,
      contraseña: passwordAEnviar,
    });
  }

  // Alias para que 'register' (en inglés) apunte a 'registro'
  register(data: { nombre: string; email: string; clave?: string; password?: string }): Observable<any> {
    return this.registro(data);
  }

  loadProfile(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/usuarios`).pipe(
      tap((usuario) => {
        localStorage.setItem("usuario", JSON.stringify(usuario));
        this.user.set(usuario);
      })
    );
  }

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("rol");
    this.user.set(null);
  }
}