import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { FavoritoService } from '../../servicios/servicios-favorito';
import { CarritoService } from '../../servicios/servicios-carrito';
import type { Producto } from '../../models/producto';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, TagModule],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css'
})
export class FavoritosComponent implements OnInit {
  private readonly favoritoService = inject(FavoritoService);
  private readonly carritoService = inject(CarritoService);
  private readonly messages = inject(MessageService);

  // Expone la señal de favoritos directamente a la vista
  readonly favorites = this.favoritoService.favorites;

  readonly fallback =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="640" height="460" viewBox="0 0 640 460"%3E%3Crect width="640" height="460" fill="%23101012"/%3E%3Ctext x="50%25" y="50%25" fill="%2331d09e" font-size="24" text-anchor="middle" dominant-baseline="middle" font-family="Arial"%3ESIN IMAGEN%3C/text%3E%3C/svg%3E';

  ngOnInit() {
    this.favoritoService.load().subscribe({
      error: (err) => console.error('Error al cargar favoritos:', err)
    });
  }

  image(product: Producto): string {
    const image = product.imagen?.trim();
    if (!image) return this.fallback;
    if (/^https?:\/\//i.test(image)) return image;

    const imagePath = image
      .replace(/^\/+/, '')
      .replace(/^public\/uploads\//i, '')
      .replace(/^uploads\//i, '');

    return `http://localhost/API_TercerTiempo/public/uploads/${imagePath}`;
  }

  addToCart(product: Producto) {
    this.carritoService.add(product).subscribe({
      next: () => this.messages.add({
        severity: 'success',
        summary: 'Producto agregado',
        detail: `${product.nombre} se agregó al carrito.`
      }),
      error: (err) => {
        console.error('Error al agregar al carrito:', err);
        this.messages.add({
          severity: 'error',
          summary: 'No se pudo agregar',
          detail: 'Intentá nuevamente en unos momentos.'
        });
      }
    });
  }

  remove(product: Producto) {
    this.favoritoService.remove(product).subscribe({
      next: () => console.log('Producto eliminado de favoritos'),
      error: (err) => console.error('Error al quitar de favoritos:', err)
    });
  }
}