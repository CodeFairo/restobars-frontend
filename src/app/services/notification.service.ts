import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { appsettings } from '../settings/appsettings';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private hubConnection!: signalR.HubConnection;
  private baseUrl: string = appsettings.apiUrlBAse;
  constructor() { }

  public startConnection(): void {
    // Asegúrate de usar la URL correcta de tu API con el puerto en el que se sirve
    //console.log(localStorage.getItem('token'));
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}hubs/notifications`, {
        accessTokenFactory: () => localStorage.getItem('token') || ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => console.log('Conexión a SignalR establecida.'))
      .catch(err => console.error('Error al conectar con SignalR:', err));

    this.registerOnServerEvents();
  }

  private registerOnServerEvents(): void {
    this.hubConnection.on('ReceiveNotification', (message: string) => {
      // Puedes usar un modal, toast o cualquier mecanismo de notificación visual
      console.log('Notificación recibida:', message);
      // Ejemplo sencillo usando alert:
      alert(`Notificación: ${message}`);
    });
  }

  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}
