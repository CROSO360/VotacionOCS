// =======================
// Servicio: ResolucionService
// Administra las resoluciones emitidas para cada punto tratado en el OCS
// =======================

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResolucion } from '../interfaces/IResolucion';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ResolucionService {

  private baseURL = environment.baseURL; // URL base del backend, definida en environment.ts

  constructor(private http: HttpClient) {}

  // =======================
  // Métodos GET
  // =======================

  /**
   * Obtiene todas las resoluciones registradas
   */
  getAllData(): Observable<IResolucion[]> {
    return this.http.get<IResolucion[]>(`${this.baseURL}/resolucion/all`);
  }

  /**
   * Obtiene una resolución por su ID
   * @param id ID de la resolución
   */
  getDataById(id: string): Observable<IResolucion> {
    return this.http.get<IResolucion>(`${this.baseURL}/resolucion/find/${id}`);
  }

  /**
   * Busca una resolución por filtro y relaciones opcionales
   * @param query Condición de búsqueda
   * @param relations Relaciones adicionales (opcional)
   */
  getDataBy(query: string, relations?: string[]): Observable<IResolucion> {
    let url = `${this.baseURL}/resolucion/findOneBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IResolucion>(url);
  }

  /**
   * Obtiene todas las resoluciones que cumplan un criterio específico
   * @param query Condición de búsqueda
   * @param relations Relaciones adicionales (opcional)
   */
  getAllDataBy(query: string, relations?: string[]): Observable<IResolucion[]> {
    let url = `${this.baseURL}/resolucion/findAllBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IResolucion[]>(url);
  }

  // =======================
  // Métodos POST / PATCH
  // =======================

  /**
   * Guarda o actualiza una resolución asociada a un punto
   * @param data Objeto de tipo IResolucion
   */
  saveData(data: IResolucion): Observable<IResolucion> {
    return this.http.post<IResolucion>(`${this.baseURL}/resolucion/save`, data);
  }

  /**
   * Elimina una resolución por su ID
   * @param id ID de la resolución a eliminar
   */
  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/resolucion/delete/${id}`, {});
  }

  /**
   * Actualiza los datos de una resolución existente
   * @param data Objeto parcial con campos a actualizar
   */
  updateData(data: any): Observable<IResolucion> {
    return this.http.patch<IResolucion>(`${this.baseURL}/resolucion/actualizar`, data);
  }
}
