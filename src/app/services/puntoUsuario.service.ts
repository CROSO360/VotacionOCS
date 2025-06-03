import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPuntoUsuario } from '../interfaces/IPuntoUsuario';

@Injectable({
  providedIn: 'root',
})

export class PuntoUsuarioService {

  private baseURL = `http://localhost:3000`;

  constructor(private http: HttpClient) {}

  getAllData(): Observable<IPuntoUsuario[]> {
    return this.http.get<IPuntoUsuario[]>(`${this.baseURL}/punto-usuario/all`);
  }

  getDataById(id: string): Observable<IPuntoUsuario> {
    return this.http.get<IPuntoUsuario>(`${this.baseURL}/punto-usuario/find/${id}`);
  }

  getDataBy(query: string, relations?: string[]): Observable<IPuntoUsuario> {
    let url = `${this.baseURL}/punto-usuario/findOneBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IPuntoUsuario>(url);
  }

  getAllDataBy(query: string, relations?: string[]): Observable<IPuntoUsuario[]> {
    let url = `${this.baseURL}/punto-usuario/findAllBy?${query}`;

    if (relations && relations.length > 0) {
      const relationsString = relations.join(',');
      url += `&relations=${relationsString}`;
    }

    return this.http.get<IPuntoUsuario[]>(url);
  }

  saveData(data: IPuntoUsuario): Observable<IPuntoUsuario> {
    return this.http.post<IPuntoUsuario>(`${this.baseURL}/punto-usuario/save`, data);
  }

  saveManyData(data: IPuntoUsuario[]): Observable<IPuntoUsuario[]> {
    return this.http.post<IPuntoUsuario[]>(`${this.baseURL}/punto-usuario/save/many`, data);
  }

  deleteData(id: number): Observable<any> {
    return this.http.post(`${this.baseURL}/punto-usuario/delete/${id}`, {});
  }

  saveVote(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/punto-usuario/voto`, data)
  }

  generarPuntosUsuario(idSesion: number): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/punto-usuario/generar-puntovoto/${idSesion}`, {})
  } 

  eliminarPuntosUsuario(idSesion: number): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/punto-usuario/eliminar-puntovoto/${idSesion}`, {})
  }

  cambiarPrincipalAlterno(idSesion: number, idUsuario: number): Observable<any> {
  return this.http.post<any>(`${this.baseURL}/punto-usuario/cambiar-principal-alterno`, {
    id_sesion: idSesion,
    id_usuario: idUsuario
  });
}


}