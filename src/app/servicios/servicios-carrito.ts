import { Injectable, inject, signal, computed } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import type { ItemCarrito, Producto } from "../models/producto";

@Injectable({
  providedIn: "root",
})
export class CarritoService {
  private http = inject(HttpClient);
  private apiUrl = "http://localhost/api_proyecto/public"; // Ajustado a tu entorno PHP con public

  private readonly itemsSignal = signal<ItemCarrito[]>([]);
  readonly items = this.itemsSignal.asReadonly();

  // Cálculos automáticos con signals
  readonly count = computed(() => this.itemsSignal().reduce((acc, item) => acc + item.cantidad, 0));
  readonly total = computed(() => this.itemsSignal().reduce((acc, item) => acc + (item.precio_unitario * item.cantidad), 0));

  // Ver / Cargar carrito
  load(): Observable<ItemCarrito[]> {
    return this.http.get<ItemCarrito[]>(`${this.apiUrl}/carrito`).pipe(
      tap((items) => this.itemsSignal.set(items))
    );
  }

  cargarCarrito(): Observable<ItemCarrito[]> {
    return this.load();
  }

  // Agregar producto al carrito
  add(product: Producto): Observable<any> {
    const id = product.id_producto ?? product.id;
    return this.http.post(`${this.apiUrl}/carrito`, { id_producto: id }).pipe(
      tap(() => {
        // Sincronizamos y recargamos el carrito desde el backend para mantener cantidades exactas
        this.load().subscribe();
      })
    );
  }

  // Cambiar cantidad
  update(item: ItemCarrito, cantidad: number): Observable<any> {
    const id_producto = item.id_producto;
    return this.http.put(`${this.apiUrl}/carrito/actualizar/${id_producto}`, { cantidad }).pipe(
      tap(() => {
        const updated = this.itemsSignal().map(i => i.id_producto === id_producto ? { ...i, cantidad } : i);
        this.itemsSignal.set(updated);
      })
    );
  }

  // Quitar producto
  remove(id_producto: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/carrito/eliminar/${id_producto}`).pipe(
      tap(() => {
        const filtered = this.itemsSignal().filter(i => i.id_producto !== id_producto);
        this.itemsSignal.set(filtered);
      })
    );
  }

  // Vaciar carrito
  clear(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/carrito/vaciar`).pipe(
      tap(() => this.itemsSignal.set([]))
    );
  }
}