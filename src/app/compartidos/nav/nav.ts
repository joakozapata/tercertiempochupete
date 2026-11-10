import { Component, inject, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { BadgeModule } from "primeng/badge";
import { MenubarModule } from "primeng/menubar";
import { CarritoService } from "../../servicios/servicios-carrito";
import { AuthService } from "../../servicios/auth-servicio";

@Component({
  selector: "app-nav",
  standalone: true,
  imports: [RouterLink, ButtonModule, BadgeModule, MenubarModule],
  templateUrl: "./nav.html",
  styleUrl: "./nav.css",
})
export class NavComponent {
  readonly cart = inject(CarritoService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly items = signal([
    { label: "Inicio", icon: "pi pi-home", routerLink: ["/"] },
    { label: "Productos", icon: "pi pi-shopping-bag", routerLink: ["/productos"] },
    { label: "Ofertas", icon: "pi pi-tag", routerLink: ["/ofertas"] },
    { label: "Favoritos", icon: "pi pi-heart", routerLink: ["/favoritos"] },
    { label: "Contacto", icon: "pi pi-envelope", routerLink: ["/contacto"] }
  ]);

  logout() {
    this.auth.logout();
    void this.router.navigate(["/"]);
  }
}