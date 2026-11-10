import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule, CurrencyPipe, DatePipe } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { MessageService } from "primeng/api";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { SkeletonModule } from "primeng/skeleton";
import { TicketService } from "../../servicios/ticket-service";

@Component({
  selector: "app-ticket",
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    RouterLink,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    SkeletonModule,
  ],
  templateUrl: "./ticket.html",
  styleUrl: "./ticket.css",
})
export class TicketComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ticketService = inject(TicketService);
  private readonly messages = inject(MessageService);

  readonly ticketData = signal<any>(null);
  readonly loading = signal(true);
  readonly downloading = signal(false);

  ngOnInit() {
    const idCompra = this.route.snapshot.paramMap.get("id_compra");
    if (idCompra) {
      this.cargarTicket(Number(idCompra));
    } else {
      this.loading.set(false);
    }
  }

  cargarTicket(idCompra: number) {
    this.loading.set(true);
    this.ticketService.getTicket(idCompra).subscribe({
      next: (data) => {
        this.ticketData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error("Error al obtener ticket", err);
        this.messages.add({
          severity: "error",
          summary: "Error",
          detail: "No se pudo recuperar la información del ticket.",
        });
        this.loading.set(false);
      },
    });
  }

  descargarPdf() {
    const ticket = this.ticketData();
    if (!ticket || !ticket.id_compra) return;

    this.downloading.set(true);
    this.ticketService.generarTicket(ticket.id_compra).subscribe({
      next: (res: any) => {
        this.downloading.set(false);
        this.messages.add({
          severity: "success",
          summary: "Ticket descargado",
          detail: "El comprobante PDF se ha abierto en una ventana.",
        });
        if (res && res.pdf_path) {
          window.open(res.pdf_path, "_blank");
        }
      },
      error: (err) => {
        console.error("Error al generar PDF", err);
        this.downloading.set(false);
        this.messages.add({
          severity: "error",
          summary: "Error",
          detail: "No se pudo generar el comprobante PDF.",
        });
      },
    });
  }
}