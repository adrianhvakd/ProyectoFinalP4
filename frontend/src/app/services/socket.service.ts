import { Injectable, signal } from '@angular/core';
import { io, Socket as SocketIOClient } from 'socket.io-client';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: SocketIOClient;
  private readonly serverUrl = 'http://localhost:3000';

  connected = signal(false);
  
  private medicionSubject = new Subject<any>();

  constructor() {
    this.socket = io(this.serverUrl, {
      withCredentials: true,
      autoConnect: false,
    });

    this.socket.on('connect', () => {
      this.connected.set(true);
    });

    this.socket.on('disconnect', () => {
      this.connected.set(false);
    });

    this.socket.on('medicion:new', (data: any) => {
      this.medicionSubject.next(data);
    });

    this.socket.connect();
  }

  emit(event: string, data?: any): void {
    this.socket.emit(event, data);
  }

  onMedicionNew(): Observable<any> {
    return this.medicionSubject.asObservable();
  }

  off(event: string): void {
    this.socket.off(event);
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}