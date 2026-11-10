import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";
import { AuthService } from "../servicios/auth-servicio";

@Component({
  selector: "app-perfil",
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TagModule],
  templateUrl: "./perfil.html",
  styleUrl: "./perfil.css",
})
export class PerfilComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit() {
    // Si loadProfile devuelve un observable hacia el backend, nos suscribimos:
    this.auth.loadProfile().subscribe({
      error: (err) => {
        console.error("No se pudo cargar el perfil del usuario", err);
      }
    });
  }

  logout() { 
    this.auth.logout(); 
    void this.router.navigate(["/"]); 
  }
}