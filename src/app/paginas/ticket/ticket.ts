import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    TagModule,
    SkeletonModule,
    TableModule
  ],
  templateUrl: './ticket.html',
  styleUrl: './ticket.css'
})
export class TicketComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost/API_TercerTiempo/public';

  // Estados reactivos con Signals basados en tu HTML
  readonly loading = signal<boolean>(true);
  readonly downloading = signal<boolean>(false);
  readonly ticketData = signal<any | null>(null);

  ngOnInit() {
    // Captura el ID de la ruta (ej: /ticket/5)
    const idTicket = this.route.snapshot.paramMap.get('id');
    if (idTicket) {
      this.cargarTicket(idTicket);
    } else {
      this.loading.set(false);
    }
  }

  cargarTicket(id: string) {
    this.loading.set(true);
    this.http.get<any>(`${this.apiUrl}/pedidos/${id}`).subscribe({
      next: (response) => {
        // Asigna los datos del ticket devueltos por la API
        this.ticketData.set(response);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar el ticket:', err);
        this.loading.set(false);
      }
    });
  }

  descargarPdf() {
    const ticket = this.ticketData();
    if (!ticket) return;

    this.downloading.set(true);

    // Petición opcional para generar o descargar el PDF desde el backend
    this.http.get(`${this.apiUrl}/pedidos/${ticket.id || ticket.id_ticket}/pdf`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ticket-${ticket.numero_ticket || ticket.id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.downloading.set(false);
      },
      error: (err) => {
        console.error('Error al descargar el PDF:', err);
        this.downloading.set(false);
        // Fallback simple si el backend no genera PDF de forma directa aún:
        window.print(); 
      }
    });
  }
}