import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, forkJoin, map } from 'rxjs';
import { setToken } from './token.interceptor';

export interface User {
  id: string;
  email: string;
  nombre: string;
  role: 'ADMIN' | 'USER';
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface GeoJSONFeature {
  type: string;
  id: string;
  geometry: {
    type: string;
    coordinates: any;
  };
  properties: {
    id: string;
    nombre?: string;
    estado?: string;
    reservorio_id?: string;
    radio_cobertura?: number;
  };
}

export interface GeoJSONCollection {
  type: string;
  features: GeoJSONFeature[];
}

export interface Reservorio {
  id: string;
  nombre: string;
  capacidad_max: number;
  altura_max: number;
  radio_cobertura: number;
  tipo?: 'RESERVORIO_PUBLICO' | 'DOMICILIARIO';
  ubicacion: any;
  user?: User;
  sensores?: Sensor[];
  dispositivos?: DispositivoESP32[];
}

export interface Domiciliario {
  id: string;
  nombre: string;
  capacidad_max: number;
  altura_max: number;
  ubicacion: any;
  reservorioId: string;
  reservorio?: Reservorio;
  user?: User;
  sensores?: Sensor[];
  dispositivos?: DispositivoESP32[];
}

export interface Sensor {
  id: string;
  tipo: 'NIVEL' | 'PH' | 'TURBIDEZ' | 'TEMPERATURA' | 'FLUJO';
  unidad_medida: string;
  reservorio?: Reservorio;
  domiciliario?: Domiciliario;
  dispositivo?: DispositivoESP32;
  mediciones?: Medicion[];
}

export interface Medicion {
  id: number;
  valor: number;
  fecha_hora: Date;
  sensor?: Sensor;
}

export interface DispositivoESP32 {
  id: string;
  nombre: string;
  api_key: string;
  estado: 'ACTIVO' | 'INACTIVO';
  reservorio?: Reservorio;
  domiciliario?: Domiciliario;
  sensores?: Sensor[];
}

export interface Alerta {
  tanqueId: string;
  tankeNombre: string;
  tipo: 'NIVEL_ALTO' | 'NIVEL_BAJO' | 'PH_ALTO' | 'PH_BAJO';
  mensaje: string;
}

// Compatibilidad - Tanque es alias de Reservorio
export type Tanque = Reservorio;

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:3000';
  
  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  constructor(private http: HttpClient) {}

  validateSession(): Observable<User | null> {
    return this.http
      .get<User>(`${this.baseUrl}/auth/validate`, { withCredentials: true })
      .pipe(
        tap((user) => {
          this.currentUser.set(user);
        }),
        catchError(() => {
          this.currentUser.set(null);
          return of(null);
        })
      );
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        `${this.baseUrl}/auth/login`,
        { email, password },
        { withCredentials: true },
      )
      .pipe(
        tap((response) => {
          if (response.accessToken) {
            setToken(response.accessToken);
          }
          this.currentUser.set(response.user);
        }),
      );
  }

  logout(): Observable<any> {
    return this.http
      .post(
        `${this.baseUrl}/auth/logout`,
        {},
        { withCredentials: true },
      )
      .pipe(
        tap(() => {
          setToken(null);
          this.currentUser.set(null);
        }),
      );
  }

  // Reservorios
  getReservorios(): Observable<Reservorio[]> {
    return this.http.get<Reservorio[]>(`${this.baseUrl}/reservorio`);
  }

  getReservorioById(id: string): Observable<Reservorio> {
    return this.http.get<Reservorio>(`${this.baseUrl}/reservorio/${id}`);
  }

  createReservorio(data: any): Observable<Reservorio> {
    return this.http.post<Reservorio>(`${this.baseUrl}/reservorio`, data, { withCredentials: true });
  }

  updateReservorio(id: string, data: any): Observable<Reservorio> {
    return this.http.patch<Reservorio>(`${this.baseUrl}/reservorio/${id}`, data, { withCredentials: true });
  }

  deleteReservorio(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/reservorio/${id}`, { withCredentials: true });
  }

  getRadioMinimo(id: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/reservorio/${id}/radio-minimo`);
  }

  // Domiciliarios
  getDomiciliarios(): Observable<Domiciliario[]> {
    return this.http.get<Domiciliario[]>(`${this.baseUrl}/domiciliario`);
  }

 getDomiciliarioById(id: string): Observable<Domiciliario> {
    return this.http.get<Domiciliario>(`${this.baseUrl}/domiciliario/${id}`);
  }

  getDomiciliariosByReservorio(reservorioId: string): Observable<Domiciliario[]> {
    return this.http.get<Domiciliario[]>(`${this.baseUrl}/domiciliario/by-reservorio/${reservorioId}`);
  }

  // Compatibilidad
  getTanques(): Observable<Reservorio[]> {
    return forkJoin([
      this.getReservorios(),
      this.getDomiciliarios()
    ]).pipe(
      map(([reservorios, domiciliarios]) => {
        const todos = [...reservorios, ...domiciliarios] as any[];
        return todos.map(t => ({
          ...t,
          tipo: t.reservorio?.id ? 'DOMICILIARIO' : 'RESERVORIO_PUBLICO'
        }));
      })
    );
  }

  getTanqueById(id: string): Observable<Reservorio> {
    return this.getReservorioById(id);
  }

  createTanque(data: any): Observable<any> {
    if (data.tipo === 'DOMICILIARIO') {
      return this.createDomiciliario(data);
    }
    return this.createReservorio(data);
  }

  updateTanque(id: string, data: any): Observable<any> {
    if (data.tipo === 'DOMICILIARIO') {
      return this.updateDomiciliario(id, data);
    }
    return this.updateReservorio(id, data);
  }

  deleteTanque(id: string, tipo?: string): Observable<any> {
    if (tipo === 'DOMICILIARIO') {
      return this.http.delete<any>(`${this.baseUrl}/domiciliario/${id}`, { withCredentials: true });
    }
    return this.deleteReservorio(id);
  }

  createDomiciliario(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/domiciliario`, data, { withCredentials: true });
  }

  updateDomiciliario(id: string, data: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/domiciliario/${id}`, data, { withCredentials: true });
  }

  // Sensores
  getSensores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/sensor`);
  }

  getSensoresByReservorio(reservorioId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/sensor/by-reservorio/${reservorioId}`);
  }

  getSensoresByDomiciliario(domiciliarioId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/sensor/by-domiciliario/${domiciliarioId}`);
  }

  getSensoresByTanque(tanqueId: string): Observable<any[]> {
    return this.getSensoresByReservorio(tanqueId);
  }

  createSensor(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/sensor`, data, { withCredentials: true });
  }

  updateSensor(id: string, data: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/sensor/${id}`, data, { withCredentials: true });
  }

  deleteSensor(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/sensor/${id}`, { withCredentials: true });
  }

  // Dispositivos ESP32
  getDispositivosByReservorio(reservorioId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dispositivo-esp32/by-reservorio/${reservorioId}`);
  }

  getDispositivosByDomiciliario(domiciliarioId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dispositivo-esp32/by-domiciliario/${domiciliarioId}`);
  }

  getDispositivosByTanque(tanqueId: string): Observable<any[]> {
    return this.getDispositivosByReservorio(tanqueId);
  }

  createDispositivo(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/dispositivo-esp32`, data, { withCredentials: true });
  }

  updateDispositivo(id: string, data: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/dispositivo-esp32/${id}`, data, { withCredentials: true });
  }

  deleteDispositivo(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/dispositivo-esp32/${id}`, { withCredentials: true });
  }

  // Zonas y Cañerías
  getZonasGeoJSON(): Observable<GeoJSONCollection> {
    return this.http.get<GeoJSONCollection>(`${this.baseUrl}/zona/geojson`);
  }

  getCaneriasGeoJSON(): Observable<GeoJSONCollection> {
    return this.http.get<GeoJSONCollection>(`${this.baseUrl}/caneria/geojson`);
  }

  getCaneriasByReservorio(reservorioId: string): Observable<GeoJSONCollection> {
    return this.http.get<GeoJSONCollection>(`${this.baseUrl}/caneria/by-reservorio/${reservorioId}`);
  }

  getCaneriasByTanque(tanqueId: string): Observable<GeoJSONCollection> {
    return this.getCaneriasByReservorio(tanqueId);
  }

  getZonaByReservorio(reservorioId: string): Observable<GeoJSONFeature | null> {
    return this.http.get<GeoJSONFeature | null>(`${this.baseUrl}/zona/by-reservorio/${reservorioId}`);
  }

  getZonaByTanque(tanqueId: string): Observable<GeoJSONFeature | null> {
    return this.getZonaByReservorio(tanqueId);
  }

  // Mediciones
  getMediciones(sensorId: string): Observable<Medicion[]> {
    return this.http.get<Medicion[]>(`${this.baseUrl}/medicion/sensor/${sensorId}`);
  }

  getMedicionReciente(sensorId: string): Observable<Medicion[]> {
    return this.http.get<Medicion[]>(`${this.baseUrl}/medicion/sensor/${sensorId}`);
  }

  createMedicion(sensorId: string, valor: number, apiKey?: string): Observable<Medicion> {
    return this.http.post<Medicion>(
      `${this.baseUrl}/medicion`,
      { sensorId, valor, apiKey },
      { withCredentials: true },
    );
  }

  seed(): Observable<any> {
    return this.http.post(`${this.baseUrl}/seed`, {}, {
      withCredentials: true,
    });
  }

  // Usuarios
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/user`, { withCredentials: true });
  }

  createUser(data: { email: string; password: string; nombre: string; role: 'ADMIN' | 'USER' }): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/user`, data, { withCredentials: true });
  }

  updateUser(id: string, data: { email?: string; password?: string; nombre?: string; role?: 'ADMIN' | 'USER' }): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/user/${id}`, data, { withCredentials: true });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/user/${id}`, { withCredentials: true });
  }
}