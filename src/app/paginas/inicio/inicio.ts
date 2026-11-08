import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";

@Component({
  selector: "app-inicio",
  standalone: true,
  imports: [RouterLink, ButtonModule, CardModule, TagModule],
  templateUrl: "./inicio.html",
  styleUrl: "./inicio.css",
})
export class InicioComponent {
  readonly features = [
    { icon: "pi pi-bolt", title: "Rendimiento", description: "Productos elegidos para competir al máximo nivel." },
    { icon: "pi pi-shield", title: "Garantía oficial", description: "Trabajamos con marcas y distribuidores oficiales." },
    { icon: "pi pi-truck", title: "Envíos ágiles", description: "Seguimiento de tu compra desde tu perfil." },
  ];
}