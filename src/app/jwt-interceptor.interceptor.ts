// =======================================
// INTERCEPTOR HTTP PARA ADJUNTAR JWT
// =======================================

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

// =======================================
// INTERCEPTOR DE AUTENTICACIÓN JWT
// Se ejecuta en cada solicitud HTTP saliente
// =======================================

export const jwtInterceptorInterceptor: HttpInterceptorFn = (req, next) => {

  // Inyectamos el servicio de cookies para acceder al token
  const cookieService = inject(CookieService);
  const token: string = cookieService.get('token');

  // Clonamos la solicitud original si hay token
  let modifiedReq = req;

  if (token) {
    modifiedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  // Continuamos con la solicitud (modificada o no)
  return next(modifiedReq);
};
