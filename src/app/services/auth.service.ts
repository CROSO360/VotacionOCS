// =======================
// Servicio: AuthService
// Maneja la autenticación de usuarios mediante el endpoint /auth/login
// =======================

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private baseURL = environment.baseURL; // URL base del backend, definida en environment.ts
  

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
