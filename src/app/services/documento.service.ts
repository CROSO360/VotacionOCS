import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IDocumento } from '../interfaces/IDocumento';

@Injectable({
  providedIn: 'root',
})

export class DocumentoService {

  private baseURL = `http://localhost:3000`;

  constructor(private http: HttpClient) {}

  getAllData(): Observable<IDocumento[]> {
    return this.http.get<IDocumento[]>(`${this.baseURL}/documento/all`);
  }

  getDataById(id: string): Observable<IDocumento> {
    return this.http.get<IDocumento>(`${this.baseURL}/documento/find/${id}`);
  }

  getDataBy(query: string, relations?: string[]): Observable<IDocumento> {
    let url = `${this.baseURL}/documento/findOneBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IDocumento>(url);
  }

  getAllDataBy(query: string, relations?: string[]): Observable<IDocumento[]> {
    let url = `${this.baseURL}/documento/findAllBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IDocumento[]>(url);
  }

  saveData(data: IDocumento): Observable<IDocumento> {
    return this.http.post<IDocumento>(`${this.baseURL}/documento/save`, data);
  }

  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/documento/delete/${id}`, {});
  }

  subirDocumento(archivo: File):Observable<any>{
    const formData = new FormData();
    formData.append('file', archivo);
    return this.http.post(`${this.baseURL}/documento/subir`, formData);
  }

  eliminarDocumento(id: number): Observable<any> {
    return this.http.delete(`${this.baseURL}/documento/eliminar/${id}`);
  }

}