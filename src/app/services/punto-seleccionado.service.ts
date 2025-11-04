import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IPunto } from '../interfaces/IPunto';

@Injectable({
  providedIn: 'root'
})
export class PuntoSeleccionadoService {
  private puntoSeleccionadoSubject = new BehaviorSubject<IPunto | null>(null);
  public puntoSeleccionado$: Observable<IPunto | null> = this.puntoSeleccionadoSubject.asObservable();

  constructor() { }

  setPuntoSeleccionado(punto: IPunto | null): void {
    this.puntoSeleccionadoSubject.next(punto);
  }

  getPuntoSeleccionado(): IPunto | null {
    return this.puntoSeleccionadoSubject.value;
  }
}
