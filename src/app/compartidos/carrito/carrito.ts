import { CurrencyPipe } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { ConfirmationService, MessageService } from "primeng/api";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import type { ItemCarrito } from "../../models/producto";
import { ProductService } from "../../servicios/product-service";
import { CarritoService } from "../../servicios/servicios-carrito";
import { forkJoin, map, of, switchMap, type Observable } from "rxjs";

@Component({
  selector: "app-carrito",
  standalone: true,
  imports: [CurrencyPipe, RouterLink, ConfirmDialogModule, ButtonModule, CardModule],
  providers: [ConfirmationService],
  templateUrl: "./carrito.html",
  styleUrl: "./carrito.css",
})
export class CarritoComponent implements OnInit {
  readonly cart = inject(CarritoService);
  private readonly products = inject(ProductService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);
  private readonly router = inject(Router);

  readonly checkingOut = signal(false);
  readonly fallback =
    "https://images.unsplash.com/photo-1515555230216-82228b88ea98?w=300&h=300&fit=crop&auto=format";

  ngOnInit() {
    this.cart.load().pipe(
      switchMap((items) =>
        items.length
          ? forkJoin(items.map((item) => this.loadProduct(item)))
          : of(items)
      )
    ).subscribe({
      next: (items) => this.cart.items.set(items),
      error: (err) => console.error("Error al cargar los productos del carrito", err)
    });
  }

  private loadProduct(item: ItemCarrito): Observable<ItemCarrito> {
    if (item.producto) {
      return of({
        ...item,
        nombre: item.nombre ?? item.producto.nombre,
        imagen: item.imagen ?? item.producto.imagen,
        precio_unitario: item.precio_unitario ?? item.producto.precio,
      });
    }

    const idProducto = item.id_producto ?? item.id;
    return this.products.verUno(idProducto).pipe(
      map((producto) => ({
        ...item,
        producto,
        nombre: item.nombre ?? producto.nombre,
        imagen: item.imagen ?? producto.imagen,
        precio_unitario: item.precio_unitario ?? producto.precio,
      }))
    );
  }

  name(item: ItemCarrito) {
    return item.producto?.nombre || item.nombre || `Producto ${item.id_producto}`;
  }

  image(item: ItemCarrito) {
    const img = item.producto?.imagen || item.imagen;
    if (!img) return this.fallback;
    if (/^https?:\/\//i.test(img)) return img;
    const imagePath = img
      .replace(/^\/+/, "")
      .replace(/^public\/uploads\//i, "")
      .replace(/^uploads\//i, "");
    return `http://localhost/API_TercerTiempo/public/uploads/${imagePath}`;
  }

  increase(item: ItemCarrito) {
    if (item.cantidad < 99) {
      this.cart.update(item, item.cantidad + 1).subscribe({
        error: (err) => console.error("Error al actualizar cantidad", err)
      });
    }
  }

  decrease(item: ItemCarrito) {
    if (item.cantidad > 1) {
      this.cart.update(item, item.cantidad - 1).subscribe({
        error: (err) => console.error("Error al actualizar cantidad", err)
      });
    }
  }

  remove(item: ItemCarrito) {
    this.cart.remove(item.id_producto ?? item.id).subscribe({
      next: () => {
        this.messages.add({
          severity: "success",
          summary: "Producto eliminado",
          detail: item.nombre || item.producto?.nombre || "Producto quitado del carrito",
        });
      },
      error: (err) => {
        console.error("Error al eliminar item", err);
        this.messages.add({
          severity: "error",
          summary: "Error",
          detail: "No se pudo eliminar el producto del carrito.",
        });
      }
    });
  }

  confirmClear() {
    this.confirmation.confirm({
      header: "Vaciar carrito",
      message: "¿Querés eliminar todos los productos?",
      icon: "pi pi-exclamation-triangle",
      acceptButtonProps: { label: "Vaciar", severity: "danger" },
      rejectButtonProps: { label: "Cancelar", severity: "secondary", outlined: true },
      accept: () => {
        this.cart.clear().subscribe({
          next: () => {
            this.messages.add({
              severity: "info",
              summary: "Carrito vaciado",
              detail: "Se eliminaron todos los productos.",
            });
          },
          error: (err) => console.error("Error al vaciar carrito", err)
        });
      },
    });
  }

  // Redirige al componente de Compra (Checkout) para ingresar datos de envío
  proceedToCheckout() {
    if (this.cart.items().length === 0) {
      this.messages.add({
        severity: "warn",
        summary: "Carrito vacío",
        detail: "Agrega productos antes de finalizar la compra.",
      });
      return;
    }
    void this.router.navigate(["/compra"]);
  }
}