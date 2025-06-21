// =======================
// Servicio: SesionDocumentoService
// Administra los documentos asociados a una sesión del OCS
// =======================

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ISesionDocumento } from '../interfaces/ISesionDocumento';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SesionDocumentoService {

  private baseURL = environment.baseURL; // URL base del backend, definida en environment.ts

  constructor(private http: HttpClient) {}

  // =======================
  // Métodos GET
  // =======================

  /**
   * Obtiene todos los documentos vinculados a sesiones
   */
  getAllData(): Observable<ISesionDocumento[]> {
    return this.http.get<ISesionDocumento[]>(`${this.baseURL}/sesion-documento/all`);
  }

  /**
   * Obtiene un documento de sesión por ID
   * @param id ID del documento de sesión
   */
  getDataById(id: string): Observable<ISesionDocumento> {
    return this.http.get<ISesionDocumento>(`${this.baseURL}/sesion-documento/find/${id}`);
  }

  /**
   * Busca un documento de sesión por condición y relaciones opcionales
   * @param query Condición de búsqueda (ej. id_sesion=3)
   * @param relations Relaciones adicionales a cargar (opcional)
   */
  getDataBy(query: string, relations?: string[]): Observable<ISesionDocumento> {
    let url = `${this.baseURL}/sesion-documento/findOneBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<ISesionDocumento>(url);
  }

  /**
   * Obtiene todos los documentos de sesión que cumplan un filtro
   * @param query Condición de búsqueda
   * @param relations Relaciones opcionales a incluir
   */
  getAllDataBy(query: string, relations?: string[]): Observable<ISesionDocumento[]> {
    let url = `${this.baseURL}/sesion-documento/findAllBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<ISesionDocumento[]>(url);
  }

  // =======================
  // Métodos POST
  // =======================

  /**
   * Guarda o actualiza un documento relacionado con una sesión
   * @param data Objeto ISesionDocumento
   */
  saveData(data: ISesionDocumento): Observable<ISesionDocumento> {
    return this.http.post<ISesionDocumento>(`${this.baseURL}/sesion-documento/save`, data);
  }

  /**
   * Elimina un documento de sesión por su ID
   * @param id ID del registro sesion-documento
   */
  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/sesion-documento/delete/${id}`, {});
  }
}
