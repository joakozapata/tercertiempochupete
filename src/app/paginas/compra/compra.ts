import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, NgForm } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { MessageService } from "primeng/api";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import type { ItemCarrito } from "../../models/producto";
import { CarritoService } from "../../servicios/servicios-carrito";

interface CompraResponse {
  id_compra?: number | string;
  mensaje?: string;
}

interface ComprobanteCompra {
  idCompra: number | string | null;
  fecha: Date;
  datosEnvio: {
    direccion: string;
    ciudad: string;
    codigoPostal: string;
    telefono: string;
  };
  items: ItemCarrito[];
  total: number;
}

@Component({
  selector: "app-compra",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CardModule, ButtonModule, InputTextModule],
  templateUrl: "./compra.html",
  styleUrl: "./compra.css",
})
export class CompraComponent implements OnInit {
  readonly carritoService = inject(CarritoService);
  private readonly http = inject(HttpClient);
  private readonly messages = inject(MessageService);

  readonly loading = signal(false);
  readonly loadingCart = signal(true);
  readonly receipt = signal<ComprobanteCompra | null>(null);
  private readonly apiUrl = "http://localhost/API_TercerTiempo/public";

  readonly datosEnvio = {
    direccion: "",
    ciudad: "",
    codigoPostal: "",
    telefono: "",
  };

  ngOnInit(): void {
    this.carritoService.load().subscribe({
      next: () => this.loadingCart.set(false),
      error: (error) => {
        console.error("No se pudo cargar el carrito para finalizar la compra:", error);
        this.loadingCart.set(false);
        this.messages.add({
          severity: "error",
          summary: "No se pudo cargar el carrito",
          detail: "Volvé al carrito e intentá nuevamente.",
        });
      },
    });
  }

  finalizarPedido(form: NgForm): void {
    if (form.invalid || this.loading()) {
      form.control.markAllAsTouched();
      return;
    }

    const items = this.carritoService.items().map((item) => ({ ...item }));
    if (items.length === 0) {
      this.messages.add({
        severity: "warn",
        summary: "Carrito vacío",
        detail: "Agregá productos antes de confirmar la compra.",
      });
      return;
    }

    this.loading.set(true);
    this.http.post<CompraResponse>(`${this.apiUrl}/compras/finalizar`, this.datosEnvio).subscribe({
      next: (response) => {
        this.receipt.set({
          idCompra: response.id_compra ?? null,
          fecha: new Date(),
          datosEnvio: { ...this.datosEnvio },
          items,
          total: items.reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0),
        });
        this.carritoService.items.set([]);
        this.loading.set(false);
        this.messages.add({
          severity: "success",
          summary: "Compra confirmada",
          detail: "Tu comprobante está listo para imprimir.",
        });
      },
      error: (error) => {
        console.error("Error al procesar la compra:", error);
        this.loading.set(false);
        this.messages.add({
          severity: "error",
          summary: "No se pudo finalizar la compra",
          detail: typeof error.error?.error === "string"
            ? error.error.error
            : "Revisá tu carrito e intentá nuevamente.",
        });
      },
    });
  }

  nombreProducto(item: ItemCarrito): string {
    return item.producto?.nombre ?? item.nombre ?? `Producto ${item.id_producto ?? item.id}`;
  }

  imprimir(): void {
    window.print();
  }
}
