import { CurrencyPipe } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
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
import { AuthService } from "../../core/auth-servicio";
import { CarritoService } from "../../servicios-carrito";
import { FavoritoService } from "../../servicios-favorito";

@Component({
  selector: "app-productos",
  standalone: true,
  imports: [CurrencyPipe, ReactiveFormsModule, ButtonModule, CardModule, DialogModule, InputTextModule, SkeletonModule, TagModule],
  templateUrl: "./productos.html",
  styleUrl: "./productos.css",
})
export class ProductosComponent {
  readonly auth: AuthService = inject(AuthService);
  private readonly cart = inject(CarritoService);
  private readonly favorites = inject(FavoritoService);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);

  private readonly catalog = signal<Producto[]>([
    {
      id: 1,
      nombre: "Camiseta Oficial Tercer Tiempo 2026",
      descripcion: "Edición especial con detalles metalizados y tela respirable de alto rendimiento.",
      precio: 45000,
      imagen: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=900&h=900&fit=crop&auto=format",
      stock: 12,
      categoria: "Indumentaria",
    },
    {
      id: 2,
      nombre: "Short Deportivo Pro",
      descripcion: "Diseñado para máxima movilidad dentro y fuera de la cancha.",
      precio: 22000,
      imagen: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=900&h=900&fit=crop&auto=format",
      stock: 5,
      categoria: "Indumentaria",
    },
    {
      id: 3,
      nombre: "Pelota de Fútbol 3T Match",
      descripcion: "Costuras termoselladas y aprobación profesional FIFA Quality Pro.",
      precio: 68000,
      imagen: "https://images.unsplash.com/photo-1614632537456-e58f260492cb?w=900&h=900&fit=crop&auto=format",
      stock: 0,
      categoria: "Accesorios",
    },
  ]);

  readonly search = new FormControl("", { nonNullable: true });

  private readonly query = toSignal(
    this.search.valueChanges.pipe(debounceTime(250), distinctUntilChanged()),
    { initialValue: "" },
  );

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

  readonly selected = signal<Producto | null>(null);
  readonly loading = signal(false);
  readonly placeholders = [1, 2, 3, 4, 5, 6];
  dialogVisible = false;

  imageFor(product: Producto) {
    return product.imagen || "https://images.unsplash.com/photo-1515555230216-82228b88ea98?w=900&h=900&fit=crop&auto=format";
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
    this.cart.add(product);
    this.messages.add({ severity: "success", summary: "Añadido", detail: `${product.nombre} está en tu carrito.` });
  }

  toggleFavorite(product: Producto) {
    if (!this.requireSession()) return;
    this.favorites.toggle(product);
    this.messages.add({ severity: "success", summary: "Favoritos actualizados", detail: product.nombre });
  }

  private requireSession() {
    if (this.auth.isAuthenticated()) return true;
    this.messages.add({ severity: "info", summary: "Iniciá sesión", detail: "Necesitás una cuenta para continuar." });
    void this.router.navigate(["/login"]);
    return false;
  }
}