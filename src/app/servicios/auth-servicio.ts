import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import type { Usuario } from "../models/producto";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = "http://localhost/api-proyecto"; // Ajusta según tu backend

  readonly user = signal<Usuario | null>(this.getStoredUser());

  private getStoredUser(): Usuario | null {
    const stored = localStorage.getItem("usuario");
    return stored ? JSON.parse(stored) : null;
  }

  isAuthenticated(): boolean {
    return this.user() !== null && !!localStorage.getItem("token");
  }

  isAdmin(): boolean {
    const u = this.user();
    return u !== null && u.rol === "admin";
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<{ token: string; usuario: Usuario }>(`${this.apiUrl}/usuarios/login`, credentials).pipe(
      tap((res) => {
        localStorage.setItem("token", res.token);
        localStorage.setItem("usuario", JSON.stringify(res.usuario));
        this.user.set(res.usuario);
      })
    );
  }

  register(data: { nombre: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios/registro`, data);
  }

  loadProfile(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/usuarios`).pipe(
      tap((usuario) => {
        localStorage.setItem("usuario", JSON.stringify(usuario));
        this.user.set(usuario);
      })
    );
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    this.user.set(null);
  }
}