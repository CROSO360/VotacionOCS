// ============================
// Servicio: WebSocketService
// Administra la conexión WebSocket usando Socket.IO
// ============================

import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {

  private webSocket: Socket;

  constructor() {
    this.webSocket = new Socket({
      url: environment.socketURL, // URL del servidor WebSocket, definida en environment.ts
      options: {
        path: environment.socketPath, // Ruta donde escucha el backend
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
