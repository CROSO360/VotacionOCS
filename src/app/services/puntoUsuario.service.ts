// =======================
// Servicio: PuntoUsuarioService
// Administra los votos emitidos por los usuarios sobre los puntos de una sesión
// =======================

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPuntoUsuario } from '../interfaces/IPuntoUsuario';

@Injectable({
  providedIn: 'root',
})
export class PuntoUsuarioService {

  // URL base para entorno local de pruebas
  //private baseURL = `http://localhost:3000`;

  // URL base para entorno productivo o proxy Angular
  private baseURL = `/api`;

  constructor(private http: HttpClient) {}

  // =======================
  // Métodos GET
  // =======================

  /**
   * Obtiene todos los votos registrados en el sistema
   */
  getAllData(): Observable<IPuntoUsuario[]> {
    return this.http.get<IPuntoUsuario[]>(`${this.baseURL}/punto-usuario/all`);
  }

  /**
   * Obtiene un voto por su ID
   * @param id ID del registro punto-usuario
   */
  getDataById(id: string): Observable<IPuntoUsuario> {
    return this.http.get<IPuntoUsuario>(`${this.baseURL}/punto-usuario/find/${id}`);
  }

  /**
   * Busca un registro de voto por filtro y relaciones opcionales
   * @param query Filtro aplicado (ej: punto.id_punto=1)
   * @param relations Relaciones a incluir (opcional)
   */
  getDataBy(query: string, relations?: string[]): Observable<IPuntoUsuario> {
    let url = `${this.baseURL}/punto-usuario/findOneBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IPuntoUsuario>(url);
  }

  /**
   * Obtiene múltiples votos que cumplan un criterio
   * @param query Filtro de búsqueda
   * @param relations Relaciones adicionales (opcional)
   */
  getAllDataBy(query: string, relations?: string[]): Observable<IPuntoUsuario[]> {
    let url = `${this.baseURL}/punto-usuario/findAllBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IPuntoUsuario[]>(url);
  }

  // =======================
  // Métodos POST: Guardado y eliminación
  // =======================

  /**
   * Guarda o actualiza un registro punto-usuario (voto individual)
   */
  saveData(data: IPuntoUsuario): Observable<IPuntoUsuario> {
    return this.http.post<IPuntoUsuario>(`${this.baseURL}/punto-usuario/save`, data);
  }

  /**
   * Guarda múltiples registros punto-usuario (votos masivos)
   */
  saveManyData(data: IPuntoUsuario[]): Observable<IPuntoUsuario[]> {
    return this.http.post<IPuntoUsuario[]>(`${this.baseURL}/punto-usuario/save/many`, data);
  }

  /**
   * Elimina un voto por su ID
   */
  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/punto-usuario/delete/${id}`, {});
  }

  /**
   * Registra un voto emitido por un usuario
   * @param data Objeto con id_punto, id_usuario, opcion, es_razonado
   */
  saveVote(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/punto-usuario/voto`, data);
  }

  // =======================
  // Funcionalidades especiales
  // =======================

  /**
   * Genera los votos para todos los miembros según la sesión
   * @param idSesion ID de la sesión
   */
  generarPuntosUsuario(idSesion: number): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/punto-usuario/generar-puntovoto/${idSesion}`, {});
  }

  /**
   * Elimina todos los votos asociados a una sesión
   * @param idSesion ID de la sesión
   */
  eliminarPuntosUsuario(idSesion: number): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/punto-usuario/eliminar-puntovoto/${idSesion}`, {});
  }

  /**
   * Cambia entre principal y alterno para un usuario en una sesión
   * @param idSesion ID de la sesión
   * @param idUsuario ID del usuario a alternar
   */
  cambiarPrincipalAlterno(idSesion: number, idUsuario: number): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/punto-usuario/cambiar-principal-alterno`, {
      id_sesion: idSesion,
      id_usuario: idUsuario
    });
  }
}
