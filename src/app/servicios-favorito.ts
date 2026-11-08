import { Injectable, signal } from "@angular/core";
import type { Producto } from "./models/producto";

@Injectable({
  providedIn: "root",
})
export class FavoritoService {
  readonly favorites = signal<Producto[]>([]);

  load() {
    return {
      subscribe: (observer: { next: (favs: Producto[]) => void }) => observer.next(this.favorites())
    };
  }

  // Agregamos este método para que coincida con el componente
  remove(producto: Producto) {
    const id = producto.id_producto ?? producto.id;
    this.favorites.set(this.favorites().filter(p => (p.id_producto ?? p.id) !== id));
    return {
      subscribe: (observer: { next: () => void }) => observer.next()
    };
  }

  toggle(producto: Producto) {
    const id = producto.id_producto ?? producto.id;
    const current = this.favorites();
    const exists = current.some(p => (p.id_producto ?? p.id) === id);
    
    if (exists) {
      this.favorites.set(current.filter(p => (p.id_producto ?? p.id) !== id));
    } else {
      this.favorites.set([...current, producto]);
    }

    return {
      subscribe: (observer: { next: () => void }) => observer.next()
    };
  }
}