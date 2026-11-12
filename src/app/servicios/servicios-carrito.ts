import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import type { ItemCarrito, Producto } from '../models/producto';

@Injectable({
  providedIn: 'root',
})
export class CarritoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost/API_TercerTiempo/public';

  readonly items = signal<ItemCarrito[]>([]);
  readonly count = computed(() => this.items().length);
  readonly total = computed(() =>
    this.items().reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0)
  );

  load(): Observable<ItemCarrito[]> {
    return this.http.get<any>(`${this.apiUrl}/carrito`).pipe(
      tap((response: any) => {
        const productos: ItemCarrito[] = Array.isArray(response)
          ? response
          : Array.isArray(response?.items)
            ? response.items
            : [];
        this.items.set(productos);
      })
    );
  }

  add(producto: Producto): Observable<any> {
    const idProducto = producto.id_producto ?? producto.id;

    return this.http.post(`${this.apiUrl}/carrito/agregar`, { id_producto: idProducto }).pipe(
      tap(() => this.load().subscribe())
    );
  }

  update(item: ItemCarrito, cantidad: number): Observable<any> {
    const idProducto = item.id_producto ?? item.id;

    return this.http.put(`${this.apiUrl}/carrito/actualizar/${idProducto}`, { cantidad }).pipe(
      tap(() => this.load().subscribe())
    );
  }

  remove(idProducto: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/carrito/eliminar/${idProducto}`).pipe(
      tap(() => {
        this.items.set(this.items().filter((item) => (item.id_producto ?? item.id) !== idProducto));
      })
    );
  }

  clear(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/carrito/limpiar`).pipe(
      tap(() => this.items.set([]))
    );
  }
}