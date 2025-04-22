import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IAuditoria } from '../interfaces/IAuditoria';
import { IPuntoDocumento } from '../interfaces/IPuntoDocumento';

@Injectable({
  providedIn: 'root',
})

export class PuntoDocumentoService {

  private baseURL = `http://localhost:3000`;

  constructor(private http: HttpClient) {}

  getAllData(): Observable<IPuntoDocumento[]> {
    return this.http.get<IPuntoDocumento[]>(`${this.baseURL}/punto-documento/all`);
  }

  getDataById(id: string): Observable<IPuntoDocumento> {
    return this.http.get<IPuntoDocumento>(`${this.baseURL}/punto-documento/find/${id}`);
  }

  getDataBy(query: string, relations?: string[]): Observable<IPuntoDocumento> {
    let url = `${this.baseURL}/punto-documento/findOneBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IPuntoDocumento>(url);
  }

  getAllDataBy(query: string, relations?: string[]): Observable<IPuntoDocumento[]> {
    let url = `${this.baseURL}/punto-documento/findAllBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IPuntoDocumento[]>(url);
  }

  saveData(data: IPuntoDocumento): Observable<IPuntoDocumento> {
    return this.http.post<IPuntoDocumento>(`${this.baseURL}/punto-documento/save`, data);
  }

  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/punto-documento/delete/${id}`, {});
  }

}