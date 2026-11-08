import { Injectable, signal, computed } from "@angular/core";
import type { ItemCarrito, Producto, Compra } from "./models/producto";

@Injectable({
  providedIn: "root",
})
export class CarritoService {
  // Señal local con los ítems del carrito
  private readonly itemsSignal = signal<ItemCarrito[]>([]);
  readonly items = this.itemsSignal.asReadonly();

  // Cálculos automáticos
  readonly count = computed(() => this.itemsSignal().reduce((acc, item) => acc + item.cantidad, 0));
  readonly total = computed(() => this.itemsSignal().reduce((acc, item) => acc + (item.precio_unitario * item.cantidad), 0));

  load() {
    // Al no haber API, solo retornamos los ítems actuales
    return {
      subscribe: (observer: { next: (items: ItemCarrito[]) => void }) => observer.next(this.itemsSignal())
    };
  }

  add(producto: Producto, cantidad = 1) {
    const current = this.itemsSignal();
    const index = current.findIndex(i => i.id_producto === (producto.id_producto ?? producto.id));
    
    if (index > -1) {
      // Si ya está en el carrito, sumamos cantidad
      const updated = current.map((i, idx) =>
  idx === index ? { ...i, cantidad: i.cantidad + cantidad } : i,
);
      this.itemsSignal.set(updated);
    } else {
      // Si es nuevo, lo agregamos
      const newItem: ItemCarrito = {
        id: Date.now(),
        id_producto: producto.id_producto ?? producto.id,
        cantidad: cantidad,
        precio_unitario: producto.precio,
        nombre: producto.nombre,
        imagen: producto.imagen
      };
      this.itemsSignal.set([...current, newItem]);
    }

    return {
      subscribe: (observer: { next: (items: ItemCarrito[]) => void }) => observer.next(this.itemsSignal())
    };
  }

  update(item: ItemCarrito, cantidad: number) {
    const current = this.itemsSignal();
    const updated = current.map(i => i.id_producto === item.id_producto ? { ...i, cantidad } : i);
    this.itemsSignal.set(updated);

    return {
      subscribe: (observer: { next: (items: ItemCarrito[]) => void }) => observer.next(this.itemsSignal())
    };
  }

  remove(id_producto: number) {
    const filtered = this.itemsSignal().filter(i => i.id_producto !== id_producto);
    this.itemsSignal.set(filtered);

    return {
      subscribe: (observer: { next: (items: ItemCarrito[]) => void }) => observer.next(this.itemsSignal())
    };
  }

  clear() {
    this.itemsSignal.set([]);
    return {
      subscribe: (observer: { next: () => void }) => observer.next()
    };
  }

  checkout() {
    const fakeCompra: Compra = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      total: this.total(),
      estado: "Aprobada",
      detalles: [...this.itemsSignal()]
    };
    this.itemsSignal.set([]); // Vacía el carrito al finalizar

    return {
      subscribe: (observer: { next: (compra: Compra) => void }) => observer.next(fakeCompra)
    };
  }
}