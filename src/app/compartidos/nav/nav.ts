import { Component, DestroyRef, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import { filter } from "rxjs";
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
  private readonly destroyRef = inject(DestroyRef);

  readonly items = [
    { label: "Inicio", icon: "pi pi-home", routerLink: ["/inicio"] },
    { label: "Productos", icon: "pi pi-shopping-bag", routerLink: ["/productos"] },
    { label: "Ofertas", icon: "pi pi-tag", routerLink: ["/ofertas"] },
    { label: "Favoritos", icon: "pi pi-heart", routerLink: ["/favoritos"] },
    { label: "Contacto", icon: "pi pi-envelope", routerLink: ["/contacto"] },
  ];

  readonly isLoggedIn = signal(false);
  readonly nombreUsuario = computed(() => this.auth.user()?.nombre ?? "");
  readonly cantidadItems = computed(() => this.cart.count());
  private profileRequestedFor: string | null = null;

  constructor() {
    this.refreshSession();
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.refreshSession());
  }

  logout(): void {
    this.auth.logout();
    this.profileRequestedFor = null;
    this.isLoggedIn.set(false);
    void this.router.navigate(["/inicio"]);
  }

  private refreshSession(): void {
    const token = this.auth.getToken();
    this.isLoggedIn.set(!!token);

    if (!token || this.auth.user() || this.profileRequestedFor === token) {
      return;
    }

    this.profileRequestedFor = token;
    this.auth.loadProfile().subscribe({
      error: (error) => console.error("No se pudo cargar el nombre del usuario:", error),
    });
  }
}
