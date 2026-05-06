import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
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
    tanque_id?: string;
  };
}

export interface GeoJSONCollection {
  type: string;
  features: GeoJSONFeature[];
}

export interface Tanque {
  id: string;
  nombre: string;
  tipo: 'RESERVORIO_PUBLICO' | 'DOMICILIARIO';
  capacidad_max: number;
  altura_max: number;
  ubicacion: any;
  user?: User;
  sensores?: Sensor[];
}

export interface Sensor {
  id: string;
  tipo: 'NIVEL' | 'PH' | 'TURBIDEZ' | 'TEMPERATURA' | 'FLUJO';
  unidad_medida: string;
  tanque?: Tanque;
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
  ip_address: string;
  puerto: number;
  estado: 'ACTIVO' | 'INACTIVO';
  tanque?: Tanque;
}

export interface Alerta {
  tanqueId: string;
  tanqueNombre: string;
  tipo: 'NIVEL_ALTO' | 'NIVEL_BAJO' | 'PH_ALTO' | 'PH_BAJO';
  mensaje: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:3000';
  
  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  constructor(private http: HttpClient) {}

  checkAuth(): Observable<User | null> {
    // Just return current user if available, no need to call profile
    return of(this.currentUser());
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

  getTanques(): Observable<Tanque[]> {
    return this.http.get<Tanque[]>(`${this.baseUrl}/tanque`);
  }

  getTanqueById(id: string): Observable<Tanque> {
    return this.http.get<Tanque>(`${this.baseUrl}/tanque/${id}`);
  }

createTanque(data: any): Observable<Tanque> {
    return this.http.post<Tanque>(`${this.baseUrl}/tanque`, data, { withCredentials: true });
  }

  updateTanque(id: string, data: any): Observable<Tanque> {
    return this.http.patch<Tanque>(`${this.baseUrl}/tanque/${id}`, data, { withCredentials: true });
  }

  deleteTanque(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/tanque/${id}`, { withCredentials: true });
  }

  // Sensores
  getSensores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/sensor`);
  }

  getSensoresByTanque(tanqueId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/sensor/tanque/${tanqueId}`);
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
  getDispositivosByTanque(tanqueId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dispositivo-esp32/tanque/${tanqueId}`);
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

  getCaneriasByTanque(tanqueId: string): Observable<GeoJSONCollection> {
    return this.http.get<GeoJSONCollection>(`${this.baseUrl}/caneria/by-tanque/${tanqueId}`);
  }

  getZonaByTanque(tanqueId: string): Observable<GeoJSONFeature | null> {
    return this.http.get<GeoJSONFeature | null>(`${this.baseUrl}/zona/by-tanque/${tanqueId}`);
  }

  // Mediciones
  getMediciones(sensorId: string): Observable<Medicion[]> {
    return this.http.get<Medicion[]>(`${this.baseUrl}/medicion/sensor/${sensorId}`);
  }

  getMedicionReciente(sensorId: string): Observable<Medicion[]> {
    return this.http.get<Medicion[]>(`${this.baseUrl}/medicion/sensor/${sensorId}`);
  }

  createMedicion(sensorId: string, valor: number): Observable<Medicion> {
    return this.http.post<Medicion>(
      `${this.baseUrl}/medicion`,
      { sensorId, valor },
      { withCredentials: true },
    );
  }

  seed(): Observable<any> {
    return this.http.post(`${this.baseUrl}/seed`, {}, {
      withCredentials: true,
    });
  }
}