import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { MessageService } from 'primeng/api'; // <--- 1. Importalo acá
import { ConfirmationService } from 'primeng/api'; // <--- 1. Importalo acá

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    MessageService,
    ConfirmationService // <--- 2. Agregalo acá
  ]
};