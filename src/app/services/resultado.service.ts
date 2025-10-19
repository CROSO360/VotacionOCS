// =======================
// Servicio: ResultadoService
// Gestiona los resultados agregados calculados para los puntos del OCS
// =======================

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResultado } from '../interfaces/IResultado';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ResultadoService {

  private baseURL = environment.baseURL; // URL base del backend, definida en environment.ts

  constructor(private http: HttpClient) {}

  // =======================
  // Metodos GET
  // =======================

  /**
   * Recupera todos los resultados registrados
   */
  getAllData(): Observable<IResultado[]> {
    return this.http.get<IResultado[]>(`${this.baseURL}/resultado/all`);
  }

  /**
   * Recupera un resultado por su identificador
   * @param id Identificador del resultado
   */
  getDataById(id: string): Observable<IResultado> {
    return this.http.get<IResultado>(`${this.baseURL}/resultado/find/${id}`);
  }

  /**
   * Recupera un resultado filtrado por un query string opcionalmente incluyendo relaciones
   * @param query Query string de filtros (ej: punto=1)
   * @param relations Relaciones a expandir en la respuesta (opcional)
   */
  getDataBy(query: string, relations?: string[]): Observable<IResultado> {
    let url = `${this.baseURL}/resultado/findOneBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IResultado>(url);
  }

  /**
   * Recupera multiples resultados segun un filtro
   * @param query Query string de filtros (ej: punto=1)
   * @param relations Relaciones a expandir en la respuesta (opcional)
   */
  getAllDataBy(query: string, relations?: string[]): Observable<IResultado[]> {
    let url = `${this.baseURL}/resultado/findAllBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IResultado[]>(url);
  }

  // =======================
  // Metodos POST (guardar / eliminar)
  // =======================

  /**
   * Guarda o actualiza un resultado individual
   * @param data Objeto de tipo IResultado
   */
  saveData(data: IResultado): Observable<IResultado> {
    return this.http.post<IResultado>(`${this.baseURL}/resultado/save`, data);
  }

  /**
   * Guarda una lista de resultados en una sola peticion
   * @param data Arreglo de resultados
   */
  saveManyData(data: IResultado[]): Observable<IResultado[]> {
    return this.http.post<IResultado[]>(`${this.baseURL}/resultado/save/many`, data);
  }

  /**
   * Elimina un resultado por su identificador
   * @param id Identificador del resultado a eliminar
   */
  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/resultado/delete/${id}`, {});
  }
}
