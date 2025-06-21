// =======================
// Servicio: GrupoUsuarioService
// Maneja la gestión de los grupos de usuario y su peso en las votaciones
// =======================

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IGrupoUsuario } from '../interfaces/IGrupoUsuario';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GrupoUsuarioService {

  private baseURL = environment.baseURL; // URL base del backend, definida en environment.ts

  constructor(private http: HttpClient) {}

  // =======================
  // Métodos GET
  // =======================

  /**
   * Obtiene todos los grupos de usuario registrados
   */
  getAllData(): Observable<IGrupoUsuario[]> {
    return this.http.get<IGrupoUsuario[]>(`${this.baseURL}/grupo-usuario/all`);
  }

  /**
   * Obtiene un grupo de usuario por su ID
   * @param id ID del grupo
   */
  getDataById(id: string): Observable<IGrupoUsuario> {
    return this.http.get<IGrupoUsuario>(`${this.baseURL}/grupo-usuario/find/${id}`);
  }

  /**
   * Busca un grupo por filtros y relaciones opcionales
   * @param query Filtro de búsqueda
   * @param relations Relaciones a incluir (opcional)
   */
  getDataBy(query: string, relations?: string[]): Observable<IGrupoUsuario> {
    let url = `${this.baseURL}/grupo-usuario/findOneBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IGrupoUsuario>(url);
  }

  /**
   * Obtiene múltiples grupos que cumplan un criterio de búsqueda
   * @param query Filtro aplicado
   * @param relations Relaciones adicionales (opcional)
   */
  getAllDataBy(query: string, relations?: string[]): Observable<IGrupoUsuario[]> {
    let url = `${this.baseURL}/grupo-usuario/findAllBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IGrupoUsuario[]>(url);
  }

  // =======================
  // Métodos POST
  // =======================

  /**
   * Guarda o actualiza un grupo de usuario
   * @param data Objeto IGrupoUsuario con los datos
   */
  saveData(data: IGrupoUsuario): Observable<IGrupoUsuario> {
    return this.http.post<IGrupoUsuario>(`${this.baseURL}/grupo-usuario/save`, data);
  }

  /**
   * Elimina un grupo de usuario por ID
   * @param id ID del grupo a eliminar
   */
  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/grupo-usuario/delete/${id}`, {});
  }
}
