import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { ProductService } from '../../servicios/product-service';
import { CarritoService } from '../../servicios/servicios-carrito';
import { FavoritoService } from '../../servicios/servicios-favorito';
import type { Producto } from '../../models/producto';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    SkeletonModule,
    DialogModule
  ],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class ProductosComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly carritoService = inject(CarritoService);
  private readonly favoritoService = inject(FavoritoService);

  // Estados reactivos con Signals
  readonly products = signal<Producto[]>([]);
  readonly loading = signal<boolean>(true);
  
  // Control para el buscador reactivo
  readonly search = new FormControl('');

  // Control para el diálogo de detalles
  dialogVisible = false;
  readonly selected = signal<Producto | null>(null);

  // Array de placeholders para el skeleton loader mientras carga
  readonly placeholders = Array(6);

  ngOnInit() {
    this.cargarProductos();
    this.favoritoService.load().subscribe();

    // Configurar búsqueda reactiva con retraso para optimizar peticiones
    this.search.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(termino => {
      this.cargarProductos(termino || '');
    });
  }

  cargarProductos(busqueda: string = '') {
    this.loading.set(true);
    this.productService.listar(busqueda).subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.loading.set(false);
      }
    });
  }

  // Manejador seguro de la imagen del producto
  imageFor(product: Producto): string {
    return product.imagen || 'assets/placeholder-producto.png';
  }

  addToCart(product: Producto) {
    this.carritoService.add(product).subscribe({
      next: () => console.log('Producto agregado al carrito con éxito'),
      error: (err) => console.error('Error al agregar al carrito:', err)
    });
  }

  isFavorite(product: Producto): boolean {
    const id = product.id_producto ?? (product as any).id;
    return this.favoritoService.favorites().some(fav => (fav.id_producto ?? (fav as any).id) === id);
  }

  toggleFavorite(product: Producto) {
    this.favoritoService.toggle(product).subscribe({
      next: () => console.log('Favorito actualizado'),
      error: (err) => console.error('Error al actualizar favoritos:', err)
    });
  }

  open(product: Producto) {
    this.selected.set(product);
    this.dialogVisible = true;
  }
}