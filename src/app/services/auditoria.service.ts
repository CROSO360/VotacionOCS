import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IAuditoria } from '../interfaces/IAuditoria';

@Injectable({
  providedIn: 'root',
})

export class AuditoriaService {

  private baseURL = `http://localhost:3000`;

  constructor(private http: HttpClient) {}

  getAllData(): Observable<IAuditoria[]> {
    return this.http.get<IAuditoria[]>(`${this.baseURL}/auditoria/all`);
  }

  getDataById(id: string): Observable<IAuditoria> {
    return this.http.get<IAuditoria>(`${this.baseURL}/auditoria/find/${id}`);
  }

  getDataBy(query: string, relations?: string[]): Observable<IAuditoria> {
    let url = `${this.baseURL}/auditoria/findOneBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IAuditoria>(url);
  }

  getAllDataBy(query: string, relations?: string[]): Observable<IAuditoria[]> {
    let url = `${this.baseURL}/auditoria/findAllBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IAuditoria[]>(url);
  }

  saveData(data: IAuditoria): Observable<IAuditoria> {
    return this.http.post<IAuditoria>(`${this.baseURL}/auditoria/save`, data);
  }

  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/auditoria/delete/${id}`, {});
  }

}