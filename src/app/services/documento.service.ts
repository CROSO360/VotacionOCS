// =======================
// Servicio: DocumentoService
// Gestiona las operaciones relacionadas con documentos cargados al sistema
// =======================

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IDocumento } from '../interfaces/IDocumento';

@Injectable({
  providedIn: 'root',
})
export class DocumentoService {

  // URL base para entorno local de pruebas
  //private baseURL = `http://localhost:3000`;

  // URL base para entorno productivo o proxy Angular
  private baseURL = `/api`;

  constructor(private http: HttpClient) {}

  // =======================
  // Métodos GET
  // =======================

  /**
   * Obtiene todos los documentos registrados
   */
  getAllData(): Observable<IDocumento[]> {
    return this.http.get<IDocumento[]>(`${this.baseURL}/documento/all`);
  }

  /**
   * Obtiene un documento por su ID
   * @param id ID del documento
   */
  getDataById(id: string): Observable<IDocumento> {
    return this.http.get<IDocumento>(`${this.baseURL}/documento/find/${id}`);
  }

  /**
   * Busca un documento con filtros y relaciones opcionales
   * @param query Filtro de búsqueda
   * @param relations Relaciones adicionales a incluir (opcional)
   */
  getDataBy(query: string, relations?: string[]): Observable<IDocumento> {
    let url = `${this.baseURL}/documento/findOneBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IDocumento>(url);
  }

  /**
   * Busca múltiples documentos según filtros y relaciones opcionales
   * @param query Filtro de búsqueda
   * @param relations Relaciones adicionales a incluir (opcional)
   */
  getAllDataBy(query: string, relations?: string[]): Observable<IDocumento[]> {
    let url = `${this.baseURL}/documento/findAllBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IDocumento[]>(url);
  }

  // =======================
  // Métodos POST
  // =======================

  /**
   * Guarda un documento
   * @param data Objeto de tipo IDocumento
   */
  saveData(data: IDocumento): Observable<IDocumento> {
    return this.http.post<IDocumento>(`${this.baseURL}/documento/save`, data);
  }

  /**
   * Elimina un documento mediante POST (lógica del backend)
   * @param id ID del documento
   */
  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/documento/delete/${id}`, {});
  }

  /**
   * Sube un archivo PDF al servidor
   * @param archivo Archivo tipo File
   */
  subirDocumento(archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', archivo);
    return this.http.post(`${this.baseURL}/documento/subir`, formData);
  }

  /**
   * Elimina físicamente un archivo subido al servidor
   * @param id ID del documento a eliminar
   */
  eliminarDocumento(id: number): Observable<any> {
    return this.http.delete(`${this.baseURL}/documento/eliminar/${id}`);
  }
}
