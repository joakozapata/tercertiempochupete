import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import type { Producto } from "../models/producto";

@Injectable({
  providedIn: "root",
})
export class FavoritoService {
  private http = inject(HttpClient);
 private readonly apiUrl = 'http://localhost/API_TercerTiempo/public'; // Ruta exacta a tu backend PHP

  readonly favorites = signal<Producto[]>([]);

  // Cargar favoritos desde la API
  load(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/favoritos`).pipe(
      tap((favs) => this.favorites.set(favs))
    );
  }

  // Agregar un producto a favoritos
  add(id_producto: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/favoritos/agregar`, { id_producto }).pipe(
      tap(() => this.load().subscribe())
    );
  }

  // Quitar de favoritos
  remove(producto: Producto): Observable<any> {
    const id = producto.id_producto ?? producto.id;
    return this.http.delete(`${this.apiUrl}/favoritos/eliminar/${id}`).pipe(
      tap(() => {
        this.favorites.set(this.favorites().filter(p => (p.id_producto ?? p.id) !== id));
      })
    );
  }

  // Alternar favorito (ideal para el botón de la UI / catálogo)
  toggle(producto: Producto): Observable<any> {
    const id = producto.id_producto ?? producto.id;
    const current = this.favorites();
    const exists = current.some(p => (p.id_producto ?? p.id) === id);

    if (exists) {
      return this.remove(producto);
    } else {
      return this.add(id);
    }
  }
}