import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CarritoService } from '../../servicios/servicios-carrito';

@Component({
  selector: 'app-compra',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CardModule,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './compra.html', // O puedes usar tu template inline si lo prefieres
  styleUrl: './compra.css'
})
export class CompraComponent {
  readonly carritoService = inject(CarritoService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly loading = signal<boolean>(false);
  private readonly apiUrl = 'http://localhost/API_TercerTiempo/public';

  // Objeto enlazado con [(ngModel)] en tu HTML
  datosEnvio = {
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    telefono: ''
  };

  finalizarPedido() {
    // Validar campos obligatorios básicos antes de enviar
    if (!this.datosEnvio.direccion || !this.datosEnvio.ciudad || !this.datosEnvio.telefono) {
      alert('Por favor, completa los campos obligatorios de envío y contacto.');
      return;
    }

    this.loading.set(true);

    const payload = {
      ...this.datosEnvio,
      items: this.carritoService.items(),
      total: this.carritoService.total()
    };

    // Envío del pedido a tu API PHP
    this.http.post(`${this.apiUrl}/pedidos/crear`, payload).subscribe({
      next: () => {
        this.loading.set(false);
        // Limpiamos el carrito localmente tras el éxito
        this.carritoService.clear().subscribe();
        // Redirigimos al historial o a una vista de confirmación
        this.router.navigate(['/mis-compras']);
      },
      error: (err) => {
        console.error('Error al procesar el pedido:', err);
        this.loading.set(false);
        alert('Hubo un error al registrar tu compra. Inténtalo nuevamente.');
      }
    });
  }
}