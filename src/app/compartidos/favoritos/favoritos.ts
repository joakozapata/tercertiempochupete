import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FavoritoService } from '../../servicios/servicios-favorito';
import { CarritoService } from '../../servicios/servicios-carrito';
import type { Producto } from '../../models/producto';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css'
})
export class FavoritosComponent implements OnInit {
  private readonly favoritoService = inject(FavoritoService);
  private readonly carritoService = inject(CarritoService);

  // Expone la señal de favoritos directamente a la vista
  readonly favorites = this.favoritoService.favorites;

  // Imagen de respaldo por si el producto no tiene foto cargada
  readonly fallback = 'assets/placeholder-producto.png'; // Ajusta la ruta si tienes una imagen por defecto

  ngOnInit() {
    this.favoritoService.load().subscribe({
      error: (err) => console.error('Error al cargar favoritos:', err)
    });
  }

  addToCart(product: Producto) {
    this.carritoService.add(product).subscribe({
      next: () => console.log('Producto agregado al carrito desde favoritos'),
      error: (err) => console.error('Error al agregar al carrito:', err)
    });
  }

  remove(product: Producto) {
    this.favoritoService.remove(product).subscribe({
      next: () => console.log('Producto eliminado de favoritos'),
      error: (err) => console.error('Error al quitar de favoritos:', err)
    });
  }
}