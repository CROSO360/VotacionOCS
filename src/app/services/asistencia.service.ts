import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IAsistencia } from '../interfaces/IAsistencia';

@Injectable({
  providedIn: 'root',
})

export class AsistenciaService {

  private baseURL = `http://localhost:3000`;

  constructor(private http: HttpClient) {}

  getAllData(): Observable<IAsistencia[]> {
    return this.http.get<IAsistencia[]>(`${this.baseURL}/asistencia/all`);
  }

  getDataById(id: string): Observable<IAsistencia> {
    return this.http.get<IAsistencia>(`${this.baseURL}/asistencia/find/${id}`);
  }

  getDataBy(query: string, relations?: string[]): Observable<IAsistencia> {
    let url = `${this.baseURL}/asistencia/findOneBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IAsistencia>(url);
  }

  getAllDataBy(query: string, relations?: string[]): Observable<IAsistencia[]> {
    let url = `${this.baseURL}/asistencia/findAllBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IAsistencia[]>(url);
  }

  saveData(data: IAsistencia): Observable<IAsistencia> {
    return this.http.post<IAsistencia>(`${this.baseURL}/asistencia/save`, data);
  }

  saveManyData(data: IAsistencia[]): Observable<IAsistencia[]> {
    return this.http.post<IAsistencia[]>(`${this.baseURL}/asistencia/save/many`, data);
  }

  /*deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/asistencia/delete/${id}`, {});
  }*/

  eliminarAsistencia(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/asistencia/eliminar/${id}`, {});
}

  generarAsistencia(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/asistencia/generar/${id}`, {});
  }

  sincronizarAsistencia(idSesion: number, usuariosSeleccionados: number[]): Observable<any> {
    return this.http.post(`${this.baseURL}/asistencia/sincronizar/${idSesion}`, {
      usuariosSeleccionados,
    });
  }
  

}