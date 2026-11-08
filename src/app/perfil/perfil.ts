import { Component, inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";
import { AuthService } from "../core/auth-servicio"

@Component({
  selector: "app-perfil",
  standalone: true,
  imports: [ButtonModule, CardModule, TagModule],
  templateUrl: "./perfil.html",
  styleUrl: "./perfil.css",
})
export class PerfilComponent implements OnInit {
  readonly auth: AuthService = inject(AuthService);

  private readonly router = inject(Router);

  ngOnInit() { 
    this.auth.loadProfile(); 
  }

  logout() { 
    this.auth.logout(); 
    void this.router.navigate(["/"]); 
  }
}