// =======================
// Servicio: AuditoriaService
// Gestiona operaciones relacionadas con los registros de auditoría
// =======================

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IAuditoria } from '../interfaces/IAuditoria';

@Injectable({
  providedIn: 'root',
})
export class AuditoriaService {

  // URL base para pruebas locales
  //private baseURL = `http://localhost:3000`;

  // URL base para entorno productivo o proxy Angular
  private baseURL = `/api`;

  constructor(private http: HttpClient) {}

  // =======================
  // Métodos GET
  // =======================

  /**
   * Obtiene todos los registros de auditoría
   */
  getAllData(): Observable<IAuditoria[]> {
    return this.http.get<IAuditoria[]>(`${this.baseURL}/auditoria/all`);
  }

  /**
   * Obtiene un registro de auditoría por ID
   * @param id ID del registro
   */
  getDataById(id: string): Observable<IAuditoria> {
    return this.http.get<IAuditoria>(`${this.baseURL}/auditoria/find/${id}`);
  }

  /**
   * Obtiene un registro por query y relaciones opcionales
   * @param query Filtro de búsqueda (ej: id_punto=1)
   * @param relations Relaciones adicionales a incluir (opcional)
   */
  getDataBy(query: string, relations?: string[]): Observable<IAuditoria> {
    let url = `${this.baseURL}/auditoria/findOneBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IAuditoria>(url);
  }

  /**
   * Obtiene múltiples registros que cumplan con el query
   * @param query Filtro de búsqueda
   * @param relations Relaciones adicionales a incluir (opcional)
   */
  getAllDataBy(query: string, relations?: string[]): Observable<IAuditoria[]> {
    let url = `${this.baseURL}/auditoria/findAllBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IAuditoria[]>(url);
  }

  // =======================
  // Métodos POST
  // =======================

  /**
   * Guarda un nuevo registro de auditoría
   * @param data Objeto de tipo IAuditoria
   */
  saveData(data: IAuditoria): Observable<IAuditoria> {
    return this.http.post<IAuditoria>(`${this.baseURL}/auditoria/save`, data);
  }

  /**
   * Elimina un registro de auditoría por su ID
   * @param id ID del registro a eliminar
   */
  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/auditoria/delete/${id}`, {});
  }
}
