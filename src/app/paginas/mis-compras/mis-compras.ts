import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-mis-compras',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    TagModule,
    ButtonModule
  ],
  templateUrl: './mis-compras.html',
  styleUrl: './mis-compras.css'
})
export class MisComprasComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = 'http://localhost/API_TercerTiempo/public';

  // Señales exactamente iguales a las que usa tu HTML
  readonly purchases = signal<any[]>([]);
  readonly loading = signal<boolean>(true);
  readonly ticketLoading = signal<string | number | null>(null);

  ngOnInit() {
    this.cargarCompras();
  }

  cargarCompras() {
    this.loading.set(true);
    this.http.get<any>(`${this.apiUrl}/pedidos`).subscribe({
      next: (response) => {
        // Soporta tanto si la API responde un array directo como un objeto con propiedad
        const data = Array.isArray(response) ? response : response?.pedidos || [];
        this.purchases.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar las compras:', err);
        this.loading.set(false);
      }
    });
  }

  // Manejador flexible para extraer el ID sin importar cómo venga la propiedad de la base de datos
  purchaseId(purchase: any): string | number {
    return purchase.id_pedido ?? purchase.id ?? purchase.numero_ticket ?? '0';
  }

  // Método que se ejecuta al hacer clic en "Ver ticket"
  ticket(purchase: any) {
    const id = this.purchaseId(purchase);
    this.ticketLoading.set(id);

    // Simula un breve retardo de carga y redirige a la vista del ticket detallado que ya armamos
    setTimeout(() => {
      this.ticketLoading.set(null);
      this.router.navigate(['/ticket', id]);
    }, 400);
  }
}