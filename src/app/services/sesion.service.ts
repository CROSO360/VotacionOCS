// =======================
// Servicio: SesionService
// Administra las sesiones del Órgano Colegiado Superior (OCS)
// =======================

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ISesion } from '../interfaces/ISesion';

@Injectable({
  providedIn: 'root',
})
export class SesionService {

  // URL base para entorno local de pruebas
  //private baseURL = `http://localhost:3000`;

  // URL base para entorno productivo o proxy Angular
  private baseURL = `/api`;

  constructor(private http: HttpClient) {}

  // =======================
  // Métodos GET
  // =======================

  /**
   * Obtiene todas las sesiones registradas
   */
  getAllData(): Observable<ISesion[]> {
    return this.http.get<ISesion[]>(`${this.baseURL}/sesion/all`);
  }

  /**
   * Obtiene una sesión por su ID
   * @param id ID de la sesión
   */
  getDataById(id: string): Observable<ISesion> {
    return this.http.get<ISesion>(`${this.baseURL}/sesion/find/${id}`);
  }

  /**
   * Busca una sesión por filtros y relaciones opcionales
   * @param query Condición de búsqueda (ej. id_sesion=1)
   * @param relations Relaciones adicionales (opcional)
   */
  getDataBy(query: string, relations?: string[]): Observable<ISesion> {
    let url = `${this.baseURL}/sesion/findOneBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<ISesion>(url);
  }

  /**
   * Obtiene múltiples sesiones que cumplan un filtro específico
   * @param query Condición de búsqueda
   * @param relations Relaciones adicionales (opcional)
   */
  getAllDataBy(query: string, relations?: string[]): Observable<ISesion[]> {
    let url = `${this.baseURL}/sesion/findAllBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<ISesion[]>(url);
  }

  // =======================
  // Métodos POST
  // =======================

  /**
   * Guarda o actualiza los datos de una sesión
   * @param data Objeto ISesion
   */
  saveData(data: ISesion): Observable<ISesion> {
    return this.http.post<ISesion>(`${this.baseURL}/sesion/save`, data);
  }

  /**
   * Elimina una sesión por su ID
   * @param id ID de la sesión
   */
  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/sesion/delete/${id}`, {});
  }

  // =======================
  // Métodos especiales
  // =======================

  /**
   * Solicita la generación del reporte PDF de una sesión finalizada
   * @param id ID de la sesión
   * @returns Blob PDF como archivo descargable
   */
  getReporte(id: number): Observable<any> {
    return this.http.get(`${this.baseURL}/sesion/reporte/${id}`, {
      responseType: 'blob',
    });
  }
}
