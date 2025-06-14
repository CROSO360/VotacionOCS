// =======================
// Servicio: FacultadService
// Gestiona las operaciones relacionadas con facultades universitarias
// =======================

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IFacultad } from '../interfaces/IFacultad';

@Injectable({
  providedIn: 'root',
})
export class FacultadService {

  // URL base para entorno local de pruebas
  //private baseURL = `http://localhost:3000`;

  // URL base para entorno productivo o proxy Angular
  private baseURL = `/api`;

  constructor(private http: HttpClient) {}

  // =======================
  // Métodos GET
  // =======================

  /**
   * Obtiene todas las facultades registradas
   */
  getAllData(): Observable<IFacultad[]> {
    return this.http.get<IFacultad[]>(`${this.baseURL}/facultad/all`);
  }

  /**
   * Obtiene una facultad por su ID
   * @param id ID de la facultad
   */
  getDataById(id: string): Observable<IFacultad> {
    return this.http.get<IFacultad>(`${this.baseURL}/facultad/find/${id}`);
  }

  /**
   * Busca una facultad por filtro y relaciones opcionales
   * @param query Filtro de búsqueda (ej: nombre=Salud)
   * @param relations Relaciones a incluir (opcional)
   */
  getDataBy(query: string, relations?: string[]): Observable<IFacultad> {
    let url = `${this.baseURL}/facultad/findOneBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IFacultad>(url);
  }

  /**
   * Obtiene todas las facultades que cumplan un criterio
   * @param query Filtro de búsqueda
   * @param relations Relaciones a incluir (opcional)
   */
  getAllDataBy(query: string, relations?: string[]): Observable<IFacultad[]> {
    let url = `${this.baseURL}/facultad/findAllBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IFacultad[]>(url);
  }

  // =======================
  // Métodos POST
  // =======================

  /**
   * Guarda o actualiza una facultad
   * @param data Objeto IFacultad con los datos a guardar
   */
  saveData(data: IFacultad): Observable<IFacultad> {
    return this.http.post<IFacultad>(`${this.baseURL}/facultad/save`, data);
  }

  /**
   * Elimina una facultad por su ID
   * @param id ID de la facultad a eliminar
   */
  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/facultad/delete/${id}`, {});
  }
}
