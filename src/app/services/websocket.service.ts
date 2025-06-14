// ============================
// Servicio: WebSocketService
// Administra la conexión WebSocket usando Socket.IO
// ============================

import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {

  private webSocket: Socket;

  constructor() {
    this.webSocket = new Socket({
      // URL para entorno local (comentada por pruebas)
       //url: "http://localhost:3000",

      // URL para entorno productivo o proxificado
      url: "/",
      options: {
        path: '/api/socket.io', // Ruta donde escucha el backend
        transports: ['websocket'], // Se fuerza uso de WebSocket
        withCredentials: true,    // Habilita envío de cookies (auth)
      },
    });
  }

  /**
   * Escucha el evento 'change' emitido por el servidor
   * @returns Observable del evento
   */
  onChange() {
    return this.webSocket.fromEvent('change');
  }
}
