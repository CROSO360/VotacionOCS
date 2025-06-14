// =======================
// Servicio: AuthService
// Maneja la autenticación de usuarios mediante el endpoint /auth/login
// =======================

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  // URL base para entorno local de pruebas
 // private baseURL = `http://localhost:3000`;

  // URL base para entorno productivo o proxy Angular
  private baseURL = `/api`;

  constructor(private http: HttpClient) {}

  // =======================
  // Métodos de autenticación
  // =======================

  /**
   * Inicia sesión enviando las credenciales del usuario
   * @param credentials Objeto con código y contraseña
   * @returns Observable con la respuesta del servidor (token, usuario, etc.)
   */
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/auth/login`, credentials);
  }
}
