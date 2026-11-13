import { CurrencyPipe } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";
import type { Producto, VarianteProducto } from "../../models/producto";
import { ProductService } from "../../servicios/product-service";
import { CarritoService } from "../../servicios/servicios-carrito";

@Component({
  selector: "app-ofertas",
  standalone: true,
  imports: [CurrencyPipe, RouterLink, ButtonModule, CardModule, TagModule],
  templateUrl: "./ofertas.html",
  styleUrl: "./ofertas.css",
})
export class OfertasComponent implements OnInit {
  private readonly productsService = inject(ProductService);
  private readonly cart = inject(CarritoService);
  private readonly messages = inject(MessageService);

  readonly offers = [
    { index: "01", tag: "ENVÍO", title: "Envío gratis", copy: "En compras superiores a $100.000." },
    { index: "02", tag: "SOCIOS", title: "10% de bienvenida", copy: "En tu primera compra con una cuenta nueva." },
    { index: "03", tag: "CAMBIOS", title: "30 días para cambiar", copy: "Comprá tranquilo y elegí el talle ideal." },
    { index: "04", tag: "CUOTAS", title: "3 Cuotas sin interés", copy: "Pagando con tarjetas de crédito seleccionadas a través de Mercado Pago." },
    { index: "05", tag: "EQUIPOS", title: "Descuento por lote", copy: "Llevando más de 10 camisetas para tu equipo obtenés 15% OFF." }
  ];
  readonly recommendedProducts = signal<Producto[]>([]);
  readonly loadingProducts = signal(true);
  readonly selectedTalles: Record<number, number> = {};

  ngOnInit() {
    this.productsService.listar().subscribe({
      next: (products) => {
        const preferredNames = ["Camiseta Oficial Rugby", "Short Deportivo Training"];
        const preferred = preferredNames
          .map((name) => products.find((product) => product.nombre === name))
          .filter((product): product is Producto => product !== undefined);
        const available = products.filter((product) => Number(product.stock ?? 0) > 0);
        const featured = [
          ...preferred.filter((product) => Number(product.stock ?? 0) > 0),
          ...available,
          ...preferred,
          ...products,
        ].filter((product, index, list) =>
          list.findIndex((candidate) => candidate.id === product.id) === index
        );
        this.recommendedProducts.set(featured.slice(0, 2));
        this.loadingProducts.set(false);
      },
      error: (error) => {
        console.error("No se pudieron cargar los productos destacados:", error);
        this.loadingProducts.set(false);
        this.messages.add({
          severity: "error",
          summary: "Ofertas no disponibles",
          detail: "No se pudieron cargar los productos. Intentá nuevamente más tarde.",
        });
      },
    });
  }

  variantsFor(product: Producto): VarianteProducto[] {
    return product.talles ?? [{
      id_producto: product.id_producto ?? product.id,
      talle: product.talle ?? "Único",
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

  selectVariant(product: Producto, variant: VarianteProducto) {
    if (variant.stock > 0) {
      this.selectedTalles[product.id] = variant.id_producto;
    }
  }

  addToCart(product: Producto) {
    const variant = this.selectedVariant(product);
    if (!variant) {
      return;
    }

    this.cart.add(product, variant.id_producto).subscribe({
      next: () => this.messages.add({
        severity: "success",
        summary: "Producto agregado",
        detail: `${product.nombre} · Talle ${variant.talle} agregado al carrito.`,
      }),
      error: (error) => {
        console.error("No se pudo agregar el producto destacado:", error);
        this.messages.add({
          severity: "error",
          summary: "No se pudo agregar",
          detail: typeof error.error?.error === "string"
            ? error.error.error
            : "No se pudo agregar el producto. Intentá nuevamente.",
        });
      },
    });
  }

  imageFor(product: Producto): string {
    return product.imagen
      ? `http://localhost/API_TercerTiempo/public/uploads/${product.imagen}`
      : "assets/placeholder-producto.png";
  }
}