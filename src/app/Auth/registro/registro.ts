import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { AuthService } from "../../servicios/auth-servicio";

@Component({
  selector: "app-registro",
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, CardModule, InputTextModule, PasswordModule],
  templateUrl: "./registro.html",
  styleUrl: "./registro.css",
})
export class RegistroComponent {
  readonly auth: AuthService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);
  readonly loading = signal(false);

  readonly form = new FormGroup({
    nombre: new FormControl("", { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    confirmar: new FormControl("", { nonNullable: true, validators: [Validators.required] }),
  });

  passwordMismatch() {
    const value = this.form.getRawValue();
    return Boolean(value.confirmar && value.password !== value.confirmar);
  }

  submit() {
    if (this.form.invalid || this.passwordMismatch()) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.loading.set(true);
    const { confirmar: _, ...payload } = this.form.getRawValue();

    // Llamada asíncrona real al AuthService conectado a la API de PHP
    this.auth.register(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.messages.add({ 
          severity: "success", 
          summary: "Cuenta creada", 
          detail: "Ya podés iniciar sesión." 
        });
        void this.router.navigate(["/auth/inicio-sesion"]); // Ajusta la ruta si es /login según tus rutas
      },
      error: (err) => {
        this.loading.set(false);
        console.error("Error en registro", err);
        this.messages.add({ 
          severity: "error", 
          summary: "No pudimos registrarte", 
          detail: err.error?.mensaje || "Revisá los datos o el correo electrónico ya está registrado." 
        });
      }
    });
  }
}