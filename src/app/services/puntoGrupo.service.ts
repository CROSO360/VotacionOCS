import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IGrupo } from '../interfaces/IGrupo';
import { IPuntoGrupo } from '../interfaces/IPuntoGrupo';

@Injectable({
  providedIn: 'root',
})
export class PuntoGrupoService {

  private baseURL = environment.baseURL; // URL base del backend, definida en environment.ts

  constructor(private http: HttpClient) {}

  getAllData(): Observable<IPuntoGrupo[]> {
    return this.http.get<IPuntoGrupo[]>(`${this.baseURL}/punto-grupo/all`);
  }

  getDataById(id: string): Observable<IPuntoGrupo> {
    return this.http.get<IPuntoGrupo>(`${this.baseURL}/punto-grupo/find/${id}`);
  }

  getDataBy(query: string, relations?: string[]): Observable<IPuntoGrupo> {
    let url = `${this.baseURL}/punto-grupo/findOneBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IPuntoGrupo>(url);
  }

  getAllDataBy(query: string, relations?: string[]): Observable<IPuntoGrupo[]> {
    let url = `${this.baseURL}/punto-grupo/findAllBy?${query}`;

    if (relations?.length) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IPuntoGrupo[]>(url);
  }


  saveData(data: IPuntoGrupo): Observable<IPuntoGrupo> {
    return this.http.post<IPuntoGrupo>(`${this.baseURL}/punto-grupo/save`, data);
  }

  saveManyData(data: IPuntoGrupo[]): Observable<IPuntoGrupo[]> {
    return this.http.post<IPuntoGrupo[]>(`${this.baseURL}/punto-grupo/save/many`, data);
    }


  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/punto-grupo/delete/${id}`, {});
  }
}
