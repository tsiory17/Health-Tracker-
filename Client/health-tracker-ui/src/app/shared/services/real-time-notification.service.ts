import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RealTimeNotificationService {
  private hubConnection?: signalR.HubConnection;
  private token: string = '';
  private eventHandlers: Map<string, Function[]> = new Map();

  async connect(token: string): Promise<void> {
    this.token = token;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl.replace('/api', '')}/hubs/notifications`, {
        accessTokenFactory: () => this.token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveNotification', (data: { eventType: string; payload: any }) => {
      this.handleNotification(data.eventType, data.payload);
    });

    try {
      await this.hubConnection.start();
    } catch (error) {
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.hubConnection) {
      try {
        await this.hubConnection.stop();
      } catch {
        // Silently handle disconnection errors
      }
    }
  }

  on<T>(eventType: string, callback: (payload: T) => void): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(callback);
  }

  off(eventType: string, callback: Function): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(callback);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private handleNotification(eventType: string, payload: any): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => handler(payload));
    }
  }
}
