import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IAuditoria } from '../interfaces/IAuditoria';
import { IMiembro } from '../interfaces/IMiembro';
import { IResolucion } from '../interfaces/IResolucion';

@Injectable({
  providedIn: 'root',
})

export class ResolucionService {

  private baseURL = `http://localhost:3000`;

  constructor(private http: HttpClient) {}

  getAllData(): Observable<IResolucion[]> {
    return this.http.get<IResolucion[]>(`${this.baseURL}/resolucion/all`);
  }

  getDataById(id: string): Observable<IResolucion> {
    return this.http.get<IResolucion>(`${this.baseURL}/resolucion/find/${id}`);
  }

  getDataBy(query: string, relations?: string[]): Observable<IResolucion> {
    let url = `${this.baseURL}/resolucion/findOneBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IResolucion>(url);
  }

  getAllDataBy(query: string, relations?: string[]): Observable<IResolucion[]> {
    let url = `${this.baseURL}/resolucion/findAllBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IResolucion[]>(url);
  }

  saveData(data: IResolucion): Observable<IResolucion> {
    return this.http.post<IResolucion>(`${this.baseURL}/resolucion/save`, data);
  }

  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/resolucion/delete/${id}`, {});
  }

  updateData(data: any): Observable<IResolucion> {
    return this.http.patch<IResolucion>(`${this.baseURL}/resolucion/actualizar`, data);
  }

}