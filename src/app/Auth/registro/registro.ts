import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';


@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class RegistroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly apiUrl = 'http://localhost/API_TercerTiempo/public';

  // Señal para controlar el estado de carga del botón
  readonly loading = signal<boolean>(false);

  // Formulario reactivo con los nombres exactos que usa tu HTML
  form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmar: ['', [Validators.required]]
  });

  // Computed signal para verificar si las contraseñas no coinciden (usada en tu @if)
  readonly passwordMismatch = computed(() => {
    const pass = this.form.get('password')?.value;
    const confirm = this.form.get('confirmar')?.value;
    const confirmTouched = this.form.get('confirmar')?.touched;
    return confirmTouched && pass && confirm && pass !== confirm;
  });

  submit() {
    if (this.form.invalid || this.passwordMismatch()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const formData = this.form.getRawValue();
    const payload = {
      nombre: formData.nombre.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password
    };

    this.http.post<{ mensaje?: string }>(`${this.apiUrl}/usuarios/registro`, payload).subscribe({
      next: () => {
        this.loading.set(false);
        alert('¡Cuenta creada con éxito! Por favor, inicia sesión.');
        void this.router.navigate(['/inicioSesion']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al registrar usuario:', err);
        this.loading.set(false);
        const apiError = typeof err.error?.error === 'string' ? err.error.error : null;
        const message = apiError
          ?? (err.status === 0
            ? 'No se pudo conectar con la API. Verificá que el servidor esté activo.'
            : 'No se pudo crear la cuenta. Intentá nuevamente.');
        alert(message);
      }
    });
  }
}