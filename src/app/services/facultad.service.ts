import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IAuditoria } from '../interfaces/IAuditoria';
import { IFacultad } from '../interfaces/IFacultad';

@Injectable({
  providedIn: 'root',
})

export class FacultadService {

  private baseURL = `http://localhost:3000`;

  constructor(private http: HttpClient) {}

  getAllData(): Observable<IFacultad[]> {
    return this.http.get<IFacultad[]>(`${this.baseURL}/facultad/all`);
  }

  getDataById(id: string): Observable<IFacultad> {
    return this.http.get<IFacultad>(`${this.baseURL}/facultad/find/${id}`);
  }

  getDataBy(query: string, relations?: string[]): Observable<IFacultad> {
    let url = `${this.baseURL}/facultad/findOneBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IFacultad>(url);
  }

  getAllDataBy(query: string, relations?: string[]): Observable<IFacultad[]> {
    let url = `${this.baseURL}/facultad/findAllBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IFacultad[]>(url);
  }

  saveData(data: IFacultad): Observable<IFacultad> {
    return this.http.post<IFacultad>(`${this.baseURL}/facultad/save`, data);
  }

  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/facultad/delete/${id}`, {});
  }

}