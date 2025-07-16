// =======================
// Servicio: UsuarioService
// Administra las operaciones relacionadas con los usuarios del sistema OCS
// =======================

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUsuario } from '../interfaces/IUsuario';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  private baseURL = environment.baseURL; // URL base del backend, definida en environment.ts

  constructor(private http: HttpClient) {}

  // =======================
  // Métodos GET
  // =======================

  /**
   * Obtiene todos los usuarios registrados
   */
  getAllData(): Observable<IUsuario[]> {
    return this.http.get<IUsuario[]>(`${this.baseURL}/usuario/all`);
  }

  /**
   * Obtiene un usuario por su ID
   * @param id ID del usuario
   */
  getDataById(id: string): Observable<IUsuario> {
    return this.http.get<IUsuario>(`${this.baseURL}/usuario/find/${id}`);
  }

  /**
   * Busca un usuario por condiciones específicas
   * @param query Condición de búsqueda (ej. codigo=U001)
   * @param relations Relaciones adicionales (opcional)
   */
  getDataBy(query: string, relations?: string[]): Observable<IUsuario> {
    let url = `${this.baseURL}/usuario/findOneBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IUsuario>(url);
  }

  /**
   * Obtiene todos los usuarios que cumplan un filtro específico
   * @param query Condición de búsqueda
   * @param relations Relaciones opcionales
   */
  getAllDataBy(query: string, relations?: string[]): Observable<IUsuario[]> {
    let url = `${this.baseURL}/usuario/findAllBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IUsuario[]>(url);
  }

  // =======================
  // Métodos POST / DELETE
  // =======================

  /**
   * Guarda un nuevo usuario o actualiza uno existente
   * @param data Objeto IUsuario
   */
  saveData(data: IUsuario): Observable<IUsuario> {
    return this.http.post<IUsuario>(`${this.baseURL}/usuario/save`, data);
  }

  /**
   * Elimina un usuario por su ID
   * @param id ID del usuario
   */
  deleteData(id: number): Observable<any> {
    return this.http.delete(`${this.baseURL}/usuario/delete/${id}`, {});
  }

  /**
   * Actualiza los datos de un usuario específico
   * @param data Objeto IUsuario con cambios
   */
  updateData(data: IUsuario): Observable<IUsuario> {
    return this.http.post<IUsuario>(`${this.baseURL}/usuario/update`, data);
  }

  // =======================
  // Métodos específicos
  // =======================

  /**
   * Obtiene la lista de reemplazos disponibles para un usuario dado
   * @param id ID del usuario titular
   */
  reemplazosDispobibles(id: number): Observable<any[]> {
    return this.http.get<IUsuario[]>(`${this.baseURL}/usuario/reemplazos-disponibles/${id}`);
  }

  generarCodigo(): Observable<any> {
    return this.http.get<any>(`${this.baseURL}/usuario/generar-codigo`);
  }
}
