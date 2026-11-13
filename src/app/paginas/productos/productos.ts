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
import { MessageService } from 'primeng/api';
import { ProductService } from '../../servicios/product-service';
import { CarritoService } from '../../servicios/servicios-carrito';
import { FavoritoService } from '../../servicios/servicios-favorito';
import type { Producto, VarianteProducto } from '../../models/producto';

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
  private readonly messages = inject(MessageService);

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
    const variant = this.selectedVariant(product);
    if (!variant) {
      this.messages.add({
        severity: 'warn',
        summary: 'Sin stock disponible',
        detail: 'Elegí un talle con unidades disponibles para continuar.'
      });
      return;
    }

    this.carritoService.add(product, variant.id_producto).subscribe({
      next: () => this.messages.add({
        severity: 'success',
        summary: 'Producto agregado',
        detail: `${product.nombre} · Talle ${variant.talle} agregado al carrito.`
      }),
      error: (err) => {
        console.error('Error al agregar al carrito:', err);
        this.messages.add({
          severity: 'error',
          summary: 'No se pudo agregar',
          detail: 'No se pudo agregar el producto al carrito. Intentá nuevamente.'
        });
      }
    });
  }

  variantsFor(product: Producto): VarianteProducto[] {
    return product.talles ?? [{
      id_producto: product.id_producto ?? product.id,
      talle: product.talle ?? 'Único',
      stock: Number(product.stock ?? 0),
    }];
  }

  selectedVariant(product: Producto): VarianteProducto | null {
    const variants = this.variantsFor(product);
    const selectedId = this.selectedTalles[product.id];
    return variants.find((variant) => variant.id_producto === selectedId && variant.stock > 0)
      ?? variants.find((variant) => variant.stock > 0)
      ?? null;
  }

  readonly selectedTalles: Record<number, number> = {};

  selectVariant(product: Producto, variant: VarianteProducto) {
    if (variant.stock > 0) {
      this.selectedTalles[product.id] = variant.id_producto;
    }
  }

  isFavorite(product: Producto): boolean {
    const id = product.id_producto ?? (product as any).id;
    return this.favoritoService.favorites().some(fav => (fav.id_producto ?? (fav as any).id) === id);
  }

  toggleFavorite(product: Producto) {
    this.favoritoService.toggle(product).subscribe({
      next: () => {
        console.log('Favorito actualizado');
        // Forzamos la recarga de favoritos para que la UI se pinte al instante
        this.favoritoService.load().subscribe();
      },
      error: (err) => console.error('Error al actualizar favoritos:', err)
    });
  }

  open(product: Producto) {
    this.selected.set(product);
    this.dialogVisible = true;
  }
}