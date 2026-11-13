import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, tap } from 'rxjs';
import type { ItemCarrito, Producto } from '../models/producto';

type CartResponse =
  | ItemCarrito[]
  | {
      items?: ItemCarrito[];
      carrito?: ItemCarrito[];
      data?: ItemCarrito[] | { items?: ItemCarrito[]; carrito?: ItemCarrito[] };
    };

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
    return this.http.get<CartResponse>(`${this.apiUrl}/carrito`).pipe(
      map((response) => {
        if (Array.isArray(response)) {
          return response;
        }

        const data = response.data;
        if (Array.isArray(response.items)) {
          return response.items;
        }
        if (Array.isArray(response.carrito)) {
          return response.carrito;
        }
        if (Array.isArray(data)) {
          return data;
        }
        return data?.items ?? data?.carrito ?? [];
      }),
      tap((items) => this.items.set(items))
    );
  }

  add(producto: Producto, idVariante?: number): Observable<unknown> {
    const idProducto = idVariante ?? producto.id_producto ?? producto.id;

    return this.http.post<unknown>(`${this.apiUrl}/carrito/agregar`, {
      id_producto: idProducto,
      cantidad: 1,
    }).pipe(
      switchMap((response) => this.load().pipe(map(() => response)))
    );
  }

  update(item: ItemCarrito, cantidad: number): Observable<unknown> {
    const idProducto = item.id_producto ?? item.id;

    return this.http.put<unknown>(`${this.apiUrl}/carrito/actualizar/${idProducto}`, { cantidad }).pipe(
      switchMap((response) => this.load().pipe(map(() => response)))
    );
  }

  remove(idProducto: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/carrito/eliminar/${idProducto}`).pipe(
      tap(() => {
        this.items.set(this.items().filter((item) => (item.id_producto ?? item.id) !== idProducto));
      })
    );
  }

  clear(): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/carrito/vaciar`).pipe(
      tap(() => this.items.set([]))
    );
  }
}