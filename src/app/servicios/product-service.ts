import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import type { Producto } from "../models/producto";

@Injectable({
  providedIn: "root",
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = "http://localhost/api-proyecto"; // Ajusta según tu backend

  // Listar todos los productos
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos`);
  }

  // Ver un producto por ID
  getProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/productos/${id}`);
  }

  // Crear producto (admin)
  crearProducto(producto: Partial<Producto>): Observable<any> {
    return this.http.post(`${this.apiUrl}/productos`, producto);
  }

  // Editar producto (admin)
  actualizarProducto(id: number, producto: Partial<Producto>): Observable<any> {
    return this.http.put(`${this.apiUrl}/productos/${id}`, producto);
  }

  // Subir imagen de producto (admin)
  subirImagen(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/productos/imagen`, formData);
  }

  // Eliminar producto (admin)
  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/productos/${id}`);
  }
}