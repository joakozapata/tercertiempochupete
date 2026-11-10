import { CurrencyPipe, DatePipe } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import type { Compra, Ticket } from "../../models/producto"; // Nota: ajustado a singular según tu modelo

@Component({
  selector: "app-mis-compras",
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ButtonModule, CardModule, TableModule, TagModule],
  templateUrl: "./mis-compras.html",
  styleUrl: "./mis-compras.css",
})
export class MisComprasComponent implements OnInit {
  // Inyección de servicios necesarios para API, alertas y rutas
  private readonly messages = inject(MessageService);

  // Señales reactivas para almacenar las compras, el estado de carga y el ticket actual
  readonly purchases = signal<Compra[]>([]);
  readonly loading = signal(true);
  readonly ticketLoading = signal<number | null>(null);

  // Al iniciar el componente, se solicitan las compras del usuario a la API
  ngOnInit() {
  // Sin API, iniciamos con una lista vacía o de prueba
  this.purchases.set([]);
  this.loading.set(false);
}

  // Función auxiliar para obtener el ID correcto de la compra (soporta id_compra o id)
  purchaseId(purchase: Compra) { 
    return purchase.id_compra ?? purchase.id; 
  }

  // Función para solicitar la generación y apertura del ticket PDF de una compra específica
  ticket(purchase: Compra) {
  const id = this.purchaseId(purchase);
  this.ticketLoading.set(id);

  // Simulamos la generación del ticket localmente con un pequeño retraso
  setTimeout(() => {
    this.ticketLoading.set(null);
    this.messages.add({ severity: "success", summary: "Ticket generado", detail: `Descargando ticket de la compra #${id}` });
  }, 600);
}
}