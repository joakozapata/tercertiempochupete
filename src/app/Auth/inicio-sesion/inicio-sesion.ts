import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { AuthService } from "../../core/auth-servicio";

@Component({
  selector: "app-inicio-sesion",
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, CardModule, InputTextModule, PasswordModule],
  templateUrl: "./inicio-sesion.html",
  styleUrl: "./inicio-sesion.css",
})
export class LoginComponent {
  readonly auth: AuthService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);
  readonly loading = signal(false);
  
  readonly form = new FormGroup({
    email: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl("", { nonNullable: true, validators: [Validators.required] }),
  });

  invalid(control: "email" | "password") {
    const field = this.form.controls[control];
    return field.invalid && (field.dirty || field.touched);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.loading.set(true);

    // Llamada local directa sin .subscribe()
    const exito = this.auth.login(this.form.getRawValue());
    
    this.loading.set(false);

    if (exito) {
      this.messages.add({ 
        severity: "success", 
        summary: "Bienvenido", 
        detail: "Sesión iniciada correctamente." 
      });
      void this.router.navigate(["/productos"]);
    } else {
      this.messages.add({ 
        severity: "error", 
        summary: "No pudimos ingresar", 
        detail: "Revisá tu correo y contraseña." 
      });
    }
  }
}