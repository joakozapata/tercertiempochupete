import { CurrencyPipe } from "@angular/common";
import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { debounceTime, distinctUntilChanged } from "rxjs";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
import { SkeletonModule } from "primeng/skeleton";
import { TagModule } from "primeng/tag";
import type { Producto } from "../../models/producto";
import { AuthService } from "../../servicios/auth-servicio";
import { CarritoService } from "../../servicios/servicios-carrito";
import { FavoritoService } from "../../servicios/servicios-favorito";
import { ProductService } from "../../servicios/product-service";

@Component({
  selector: "app-productos",
  standalone: true,
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    DialogModule,
    InputTextModule,
    SkeletonModule,
    TagModule,
  ],
  templateUrl: "./productos.html",
  styleUrl: "./productos.css",
})
export class ProductosComponent implements OnInit {
  readonly auth: AuthService = inject(AuthService);
  private readonly cart = inject(CarritoService);
  private readonly favorites = inject(FavoritoService);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);

  readonly catalog = signal<Producto[]>([]);
  readonly loading = signal(true);
  readonly selected = signal<Producto | null>(null);
  readonly placeholders = [1, 2, 3, 4, 5, 6];
  dialogVisible = false;

  readonly search = new FormControl("", { nonNullable: true });

  private readonly query = toSignal(
    this.search.valueChanges.pipe(debounceTime(250), distinctUntilChanged()),
    { initialValue: "" },
  );

  ngOnInit() {
    this.cargarProductos();
    if (this.auth.isAuthenticated()) {
      this.favorites.load().subscribe();
    }
  }

  cargarProductos() {
    this.loading.set(true);
    this.productService.getProductos().subscribe({
      next: (data) => {
        this.catalog.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error("Error al cargar productos desde la API", err);
        this.messages.add({
          severity: "error",
          summary: "Error de API",
          detail: "No se pudieron obtener los productos de la tienda.",
        });
        this.loading.set(false);
      },
    });
  }

  private normalize(text: string) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  readonly products = computed(() => {
    const q = this.normalize(this.query().trim());
    if (!q) return this.catalog();
    return this.catalog().filter((p) =>
      this.normalize(`${p.nombre} ${p.categoria ?? ""} ${p.descripcion ?? ""}`).includes(q),
    );
  });

  imageFor(product: Producto) {
    if (!product.imagen) {
      return "https://images.unsplash.com/photo-1515555230216-82228b88ea98?w=900&h=900&fit=crop&auto=format";
    }
    if (product.imagen.startsWith("http")) {
      return product.imagen;
    }
    return `http://localhost/api-proyecto/uploads/${product.imagen}`;
  }

  isFavorite(product: Producto) {
    const id = product.id_producto ?? product.id;
    return this.favorites.favorites().some((p) => (p.id_producto ?? p.id) === id);
  }

  open(product: Producto) {
    this.selected.set(product);
    this.dialogVisible = true;
  }

  addToCart(product: Producto) {
    if (!this.requireSession()) return;
    this.cart.add(product).subscribe({
      next: () => {
        this.messages.add({
          severity: "success",
          summary: "Añadido",
          detail: `${product.nombre} está en tu carrito.`,
        });
      },
    });
  }

  toggleFavorite(product: Producto) {
    if (!this.requireSession()) return;
    this.favorites.toggle(product).subscribe({
      next: () => {
        this.messages.add({
          severity: "success",
          summary: "Favoritos",
          detail: `Actualizado: ${product.nombre}`,
        });
      },
    });
  }

  private requireSession() {
    if (this.auth.isAuthenticated()) return true;
    this.messages.add({
      severity: "info",
      summary: "Iniciá sesión",
      detail: "Necesitás una cuenta para continuar.",
    });
    void this.router.navigate(["/auth/inicio-sesion"]);
    return false;
  }
}