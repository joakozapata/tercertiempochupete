import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Inicia la aplicación Angular utilizando el componente raíz <app-root>
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));