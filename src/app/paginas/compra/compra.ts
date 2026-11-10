import { Component, inject, signal } from "@angular/core";
import { CommonModule, CurrencyPipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { CarritoService } from "../../servicios/servicios-carrito"; // Ajusta la ruta si corresponde
import { CompraService } from "../../servicios/compra-service";   // Ajusta la ruta si corresponde

@Component({
  selector: "app-compra",
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TableModule
  ],
  templateUrl: "./compra.html",
  styleUrl: "./compra.css",
})
export class CompraComponent {
  readonly carritoService = inject(CarritoService);
  private readonly compraService = inject(CompraService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  // Estado de carga para el botón de confirmar
  readonly loading = signal(false);

  // Formulario de datos de envío/contacto exigido para la orden
  datosEnvio = {
    direccion: "",
    ciudad: "",
    codigoPostal: "",
    telefono: ""
  };

  finalizarPedido() {
    // Validar datos básicos de envío
    if (!this.datosEnvio.direccion || !this.datosEnvio.ciudad || !this.datosEnvio.telefono) {
      this.messageService.add({
        severity: "warn",
        summary: "Campos incompletos",
        detail: "Por favor, completa los datos de envío obligatorios."
      });
      return;
    }

    if (this.carritoService.items().length === 0) {
      this.messageService.add({
        severity: "warn",
        summary: "Carrito vacío",
        detail: "No tienes productos en el carrito para comprar."
      });
      return;
    }

    this.loading.set(true);

    // Llamada al servicio de compra para registrar el checkout en la API
    this.compraService.finalizarCompra(this.datosEnvio).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.messageService.add({
          severity: "success",
          summary: "¡Compra realizada!",
          detail: "Tu orden ha sido registrada exitosamente."
        });

        // Vaciar el carrito localmente tras el éxito
        this.carritoService.clear().subscribe();

        // Redirigir al historial de mis compras para ver/descargar el ticket PDF
        this.router.navigate(["/mis-compras"]);
      },
      error: (err) => {
        this.loading.set(false);
        console.error("Error al procesar la compra", err);
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Ocurrió un error al procesar tu compra. Intenta nuevamente."
        });
      }
    });
  }
}