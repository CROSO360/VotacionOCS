// =======================
// Servicio: PuntoDocumentoService
// Gestiona la relación entre puntos y documentos asociados
// =======================

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPuntoDocumento } from '../interfaces/IPuntoDocumento';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PuntoDocumentoService {

  private baseURL = environment.baseURL; // URL base del backend, definida en environment.ts

  constructor(private http: HttpClient) {}

  // =======================
  // Métodos GET
  // =======================

  /**
   * Obtiene todas las relaciones punto-documento registradas
   */
  getAllData(): Observable<IPuntoDocumento[]> {
    return this.http.get<IPuntoDocumento[]>(`${this.baseURL}/punto-documento/all`);
  }

  /**
   * Obtiene una relación punto-documento por su ID
   * @param id ID del registro
   */
  getDataById(id: string): Observable<IPuntoDocumento> {
    return this.http.get<IPuntoDocumento>(`${this.baseURL}/punto-documento/find/${id}`);
  }

  /**
   * Busca una relación punto-documento por filtros y relaciones opcionales
   * @param query Filtro de búsqueda
   * @param relations Relaciones adicionales a incluir (opcional)
   */
  getDataBy(query: string, relations?: string[]): Observable<IPuntoDocumento> {
    let url = `${this.baseURL}/punto-documento/findOneBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IPuntoDocumento>(url);
  }

  /**
   * Obtiene múltiples relaciones punto-documento según un filtro
   * @param query Filtro aplicado
   * @param relations Relaciones a incluir (opcional)
   */
  getAllDataBy(query: string, relations?: string[]): Observable<IPuntoDocumento[]> {
    let url = `${this.baseURL}/punto-documento/findAllBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IPuntoDocumento[]>(url);
  }

  // =======================
  // Métodos POST
  // =======================

  /**
   * Guarda o actualiza una relación punto-documento
   * @param data Objeto IPuntoDocumento con los datos
   */
  saveData(data: IPuntoDocumento): Observable<IPuntoDocumento> {
    return this.http.post<IPuntoDocumento>(`${this.baseURL}/punto-documento/save`, data);
  }

  /**
   * Elimina una relación punto-documento por su ID
   * @param id ID de la relación a eliminar
   */
  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/punto-documento/delete/${id}`, {});
  }
}
