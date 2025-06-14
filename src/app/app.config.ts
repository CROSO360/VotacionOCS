// =======================================
// CONFIGURACIÓN PRINCIPAL DE LA APLICACIÓN ANGULAR
// =======================================

import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

// Rutas y configuración del interceptor
import { routes } from './app.routes';
import { jwtInterceptorInterceptor } from './jwt-interceptor.interceptor';

// =======================================
// CONFIGURACIÓN DE PROVEEDORES
// =======================================

export const appConfig: ApplicationConfig = {
  providers: [
    // Animaciones de Angular Material
    provideAnimations(),

    // Configuración global de ToastrService
    provideToastr({
      timeOut: 5000,
      preventDuplicates: true,
    }),

    // Configuración de rutas
    provideRouter(routes),

    // Habilitación de Hydration (SSR/SPA)
    provideClientHydration(),

    // Cliente HTTP con Fetch y uso de interceptor JWT
    provideHttpClient(
      withFetch(),
      withInterceptors([jwtInterceptorInterceptor])
    ),

    // Registro de Service Worker (solo en producción)
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
