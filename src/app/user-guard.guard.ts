// Importación de funciones y servicios necesarios
import { inject } from '@angular/core'; // Permite inyectar servicios de forma directa en funciones
import { CanActivateFn, Router } from '@angular/router'; // Interfaz y clase para protección de rutas
import { CookieService } from 'ngx-cookie-service'; // Servicio para manejo de cookies

// Guard personalizado para proteger rutas si no existe el token
export const userGuardGuard: CanActivateFn = (route, state) => {
  const cookieSrvice = inject(CookieService); // Inyección del servicio de cookies
  const router = inject(Router); // Inyección del servicio de enrutamiento

  const cookie = cookieSrvice.check('token'); // Verifica si existe la cookie 'token'

  if (!cookie) {
    // Si no hay token, redirige al login
    router.navigate(['/', 'login']);
    return false;
  } else {
    // Si existe el token, permite el acceso a la ruta
    return true;
  }
};
