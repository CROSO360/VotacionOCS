import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IAuditoria } from '../interfaces/IAuditoria';
import { IMiembro } from '../interfaces/IMiembro';

@Injectable({
  providedIn: 'root',
})

export class MiembroService {

  private baseURL = `http://localhost:3000`;

  constructor(private http: HttpClient) {}

  getAllData(): Observable<IMiembro[]> {
    return this.http.get<IMiembro[]>(`${this.baseURL}/miembro/all`);
  }

  getDataById(id: string): Observable<IMiembro> {
    return this.http.get<IMiembro>(`${this.baseURL}/miembro/find/${id}`);
  }

  getDataBy(query: string, relations?: string[]): Observable<IMiembro> {
    let url = `${this.baseURL}/miembro/findOneBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IMiembro>(url);
  }

  getAllDataBy(query: string, relations?: string[]): Observable<IMiembro[]> {
    let url = `${this.baseURL}/miembro/findAllBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IMiembro[]>(url);
  }

  saveData(data: IMiembro): Observable<IMiembro> {
    return this.http.post<IMiembro>(`${this.baseURL}/miembro/save`, data);
  }

  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/miembro/delete/${id}`, {});
  }

}