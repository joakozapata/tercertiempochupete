import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../servicios/auth-servicio';

@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './inicio-sesion.html',
  styleUrl: './inicio-sesion.css'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // Señal para manejar el estado de carga del botón
  readonly loading = signal<boolean>(false);

  // Formulario reactivo con los nombres exactos que usa tu HTML ([formGroup]="form")
  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    clave: ['', [Validators.required, Validators.minLength(4)]]
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const credentials = this.form.getRawValue();

    this.auth.login({
      email: credentials.email,
      password: credentials.clave
    }).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/productos']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al iniciar sesión:', err);
        this.auth.logout();
        this.loading.set(false);
        const message = err.status === 401
          ? 'Correo o contraseña incorrectos.'
          : err.status === 0
            ? 'No se pudo conectar con la API. Verificá que el servidor esté activo.'
            : 'No se pudo iniciar sesión. Intentá nuevamente.';
        alert(message);
      }
    });
  }
}