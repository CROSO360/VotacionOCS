// =======================
// Servicio: PuntoService
// Gestiona los puntos tratados en las sesiones del OCS
// =======================

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPunto } from '../interfaces/IPunto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PuntoService {

  private baseURL = environment.baseURL; // URL base del backend, definida en environment.ts

  constructor(private http: HttpClient) {}

  // =======================
  // Métodos GET
  // =======================

  /**
   * Obtiene todos los puntos registrados
   */
  getAllData(): Observable<IPunto[]> {
    return this.http.get<IPunto[]>(`${this.baseURL}/punto/all`);
  }

  /**
   * Obtiene un punto por su ID
   * @param id ID del punto
   */
  getDataById(id: string): Observable<IPunto> {
    return this.http.get<IPunto>(`${this.baseURL}/punto/find/${id}`);
  }

  /**
   * Busca un punto según filtros y relaciones opcionales
   * @param query Filtro de búsqueda
   * @param relations Relaciones a incluir (opcional)
   */
  getDataBy(query: string, relations?: string[]): Observable<IPunto> {
    let url = `${this.baseURL}/punto/findOneBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IPunto>(url);
  }

  /**
   * Obtiene múltiples puntos según un filtro
   * @param query Filtro aplicado
   * @param relations Relaciones a incluir (opcional)
   */
  getAllDataBy(query: string, relations?: string[]): Observable<IPunto[]> {
    let url = `${this.baseURL}/punto/findAllBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IPunto[]>(url);
  }

  // =======================
  // Métodos POST (guardar, crear, eliminar)
// =======================

  /**
   * Guarda o actualiza un punto
   * @param data Objeto IPunto con datos del punto
   */
  saveData(data: IPunto): Observable<IPunto> {
    return this.http.post<IPunto>(`${this.baseURL}/punto/save`, data);
  }

  /**
   * Crea un nuevo punto (puede incluir lógica adicional en backend)
   * @param data Objeto IPunto
   */
  crearPunto(data: IPunto): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/punto/crear`, data);
  }

  /**
   * Elimina un punto por su ID
   * @param id ID del punto a eliminar
   */
  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/punto/eliminar/${id}`, {});
  }

  /**
   * Reordena los puntos de una sesión
   * @param data Estructura con IDs y nuevos órdenes
   */
  reordenarPuntos(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/punto/reordenar`, data);
  }

  // =======================
  // Métodos para resultados de votación
  // =======================

  /**
   * Calcula automáticamente el resultado de un punto
   * @param id ID del punto
   */
  calcularResultados(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/punto/calcular-resultados/${id}`, {});
  }

  /**
   * Registra manualmente el resultado de un punto
   * @param data Objeto con resultado, id_punto, id_usuario
   */
  calcularResultadosManual(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/punto/resultado-manual`, data);
  }

  /**
   * Consulta los resultados registrados para un punto
   * @param id ID del punto
   */
  getResultados(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseURL}/punto/resultado/${id}`);
  }
}
