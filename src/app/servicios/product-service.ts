import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import type { Producto, ProductoInput } from "../models/producto";

@Injectable({
  providedIn: "root",
})
export class ProductService {
  private http = inject(HttpClient);
 private readonly apiUrl = 'http://localhost/API_TercerTiempo/public/productos';

listar(buscar: string = ""): Observable<Producto[]> {
    let params = new HttpParams();
    if (buscar) {
        params = params.set("buscar", buscar);
    }
    // Apuntamos explícitamente a /productos usando la URL base limpia
    return this.http.get<Producto[]>(this.apiUrl, { params });
}

  // Ver un producto por ID
  verUno(id: number): Observable<Producto> {
   return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  // Crear producto (admin)
  crear(producto: ProductoInput): Observable<any> {
    return this.http.post(this.apiUrl, producto);
  }

  // Editar producto (admin)
  editar(id: number, producto: ProductoInput): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, producto);
  }

  // Eliminar producto (admin)
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Subir imagen de producto (admin)
  subirImagen(archivo: File): Observable<{ imagen: string }> {
    const datos = new FormData();
    datos.append("imagen", archivo); // El nombre "imagen" debe coincidir con lo que lee PHP en $_FILES
    return this.http.post<{ imagen: string }>(`${this.apiUrl}/imagen`, datos);
  }
}
