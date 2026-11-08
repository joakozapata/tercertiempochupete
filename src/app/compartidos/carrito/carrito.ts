import { CurrencyPipe } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { ConfirmationService, MessageService } from "primeng/api";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import type { ItemCarrito } from "../../models/producto";
import { CarritoService } from "../../servicios-carrito";

@Component({
  selector: "app-carrito",
  standalone: true,
  imports: [CurrencyPipe, RouterLink, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: "./carrito.html",
  styleUrl: "./carrito.css",
})
export class CarritoComponent implements OnInit {
  readonly cart = inject(CarritoService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);
  private readonly router = inject(Router);

  readonly checkingOut = signal(false);
  readonly fallback =
    "https://images.unsplash.com/photo-1515555230216-82228b88ea98?w=300&h=300&fit=crop&auto=format";

  ngOnInit() {
    this.cart.load();
  }

  name(item: ItemCarrito) {
    return item.producto?.nombre || item.nombre || `Producto ${item.id_producto}`;
  }

  image(item: ItemCarrito) {
    return item.producto?.imagen || item.imagen || this.fallback;
  }

  increase(item: ItemCarrito) {
    if (item.cantidad < 99) {
      this.cart.update(item, item.cantidad + 1);
    }
  }

  decrease(item: ItemCarrito) {
    if (item.cantidad > 1) {
      this.cart.update(item, item.cantidad - 1);
    }
  }

  remove(item: ItemCarrito) {
    this.cart.remove(item.id_producto);
    this.messages.add({
      severity: "success",
      summary: "Producto eliminado",
      detail: item.nombre || item.producto?.nombre,
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
        this.cart.clear();
        this.messages.add({
          severity: "info",
          summary: "Carrito vaciado",
          detail: "Se eliminaron todos los productos.",
        });
      },
    });
  }

  checkout() {
    this.checkingOut.set(true);

    try {
      this.cart.clear();
      this.checkingOut.set(false);

      this.messages.add({
        severity: "success",
        summary: "¡Compra exitosa!",
        detail: "Tu pedido se ha procesado correctamente.",
      });

      void this.router.navigate(["/productos"]);
    } catch {
      this.checkingOut.set(false);
      this.messages.add({
        severity: "error",
        summary: "No pudimos finalizar",
        detail: "Intentá nuevamente.",
      });
    }
  }
}