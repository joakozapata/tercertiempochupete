import { Component, inject } from "@angular/core";
import { CurrencyPipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";
import { FavoritoService } from "../../servicios/servicios-favorito";
import { CarritoService } from "../../servicios/servicios-carrito";
import { MessageService } from "primeng/api";
import type { Producto } from "../../models/producto";

@Component({
  selector: "app-favoritos",
  standalone: true,
  imports: [CurrencyPipe, RouterLink, ButtonModule, CardModule, TagModule],
  templateUrl: "./favoritos.html",
  styleUrl: "./favoritos.css",
})
export class FavoritosComponent {
  readonly favoritesService = inject(FavoritoService);
  private readonly cart = inject(CarritoService);
  private readonly messages = inject(MessageService);

  readonly favorites = this.favoritesService.favorites;
  readonly fallback = "https://images.unsplash.com/photo-1515555230216-82228b88ea98?w=900&h=900&fit=crop&auto=format";

 remove(product: Producto) {
    this.favoritesService.remove(product).subscribe({
      next: () => {
        this.messages.add({ severity: "info", summary: "Eliminado de favoritos", detail: product.nombre });
      }
    });
  }

  addToCart(product: Producto) {
    this.cart.add(product).subscribe({
      next: () => {
        this.messages.add({ severity: "success", summary: "Añadido al carrito", detail: product.nombre });
      }
    });
  }
}