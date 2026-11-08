import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";

@Component({
  selector: "app-ofertas",
  standalone: true,
  imports: [RouterLink, ButtonModule, CardModule, TagModule],
  templateUrl: "./ofertas.html",
  styleUrl: "./ofertas.css",
})
export class OfertasComponent {
  readonly offers = [
    { index: "01", tag: "ENVÍO", title: "Envío gratis", copy: "En compras superiores a $100.000." },
    { index: "02", tag: "SOCIOS", title: "10% de bienvenida", copy: "En tu primera compra con una cuenta nueva." },
    { index: "03", tag: "CAMBIOS", title: "30 días para cambiar", copy: "Comprá tranquilo y elegí el talle ideal." },
    { index: "04", tag: "CUOTAS", title: "3 Cuotas sin interés", copy: "Pagando con tarjetas de crédito seleccionadas a través de Mercado Pago." },
    { index: "05", tag: "EQUIPOS", title: "Descuento por lote", copy: "Llevando más de 10 camisetas para tu equipo obtenés 15% OFF." }
  ];
}