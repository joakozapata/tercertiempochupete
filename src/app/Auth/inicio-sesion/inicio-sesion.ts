import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

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
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly apiUrl = 'http://localhost/API_TercerTiempo/public';

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
    const credentials = this.form.value;

    // Petición POST a tu API de PHP (ajusta la ruta del endpoint si difiere en tu backend, ej: /auth/login)
 this.http.post<any>(`${this.apiUrl}/usuarios/login`, credentials).subscribe({
      next: (response) => {
        this.loading.set(false);

        // Extrae el token y el rol de la respuesta del backend
        const token = response.token || response.access_token;
        const rol = response.rol || response.user?.rol || 'cliente';

        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('rol', rol);

          // Redirige al catálogo o a la página principal tras iniciar sesión con éxito
          this.router.navigate(['/productos']);
        } else {
          alert('No se pudo autenticar correctamente.');
        }
      },
      error: (err) => {
        console.error('Error al iniciar sesión:', err);
        this.loading.set(false);
        alert('Credenciales incorrectas o error de conexión con la API.');
      }
    });
  }
}