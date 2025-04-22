import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IAuditoria } from '../interfaces/IAuditoria';
import { IMiembro } from '../interfaces/IMiembro';
import { ISesionDocumento } from '../interfaces/ISesionDocumento';

@Injectable({
  providedIn: 'root',
})

export class SesionDocumentoService {

  private baseURL = `http://localhost:3000`;

  constructor(private http: HttpClient) {}

  getAllData(): Observable<ISesionDocumento[]> {
    return this.http.get<ISesionDocumento[]>(`${this.baseURL}/sesion-documento/all`);
  }

  getDataById(id: string): Observable<ISesionDocumento> {
    return this.http.get<ISesionDocumento>(`${this.baseURL}/sesion-documento/find/${id}`);
  }

  getDataBy(query: string, relations?: string[]): Observable<ISesionDocumento> {
    let url = `${this.baseURL}/sesion-documento/findOneBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<ISesionDocumento>(url);
  }

  getAllDataBy(query: string, relations?: string[]): Observable<ISesionDocumento[]> {
    let url = `${this.baseURL}/sesion-documento/findAllBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<ISesionDocumento[]>(url);
  }

  saveData(data: ISesionDocumento): Observable<ISesionDocumento> {
    return this.http.post<ISesionDocumento>(`${this.baseURL}/sesion-documento/save`, data);
  }

  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/sesion-documento/delete/${id}`, {});
  }

}