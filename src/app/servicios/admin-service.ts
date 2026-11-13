import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import type { Usuario } from "../models/producto";

export interface UsuarioAdminUpdate {
  nombre: string;
  email: string;
  rol: "admin" | "user";
}

@Injectable({
  providedIn: "root",
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = "http://localhost/API_TercerTiempo/public/usuarios";

  listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/todos`);
  }

  editarUsuario(id: number, usuario: UsuarioAdminUpdate): Observable<{ mensaje: string; usuario: Usuario }> {
    return this.http.put<{ mensaje: string; usuario: Usuario }>(`${this.apiUrl}/${id}`, usuario);
  }

  eliminarUsuario(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${id}`);
  }
}
