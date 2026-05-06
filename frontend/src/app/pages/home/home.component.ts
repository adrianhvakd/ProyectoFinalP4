import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-base-100 p-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-bold text-center mb-8 text-primary">
          Sistema de Gestión de Tanques de Agua
        </h1>

        @if (!loginMode()) {
          <div class="card bg-base-200 shadow-xl max-w-md mx-auto">
            <div class="card-body">
              <h2 class="card-title justify-center text-2xl mb-4">Menú Principal</h2>
              
              <div class="flex flex-col gap-4">
                <a routerLink="/mapa" class="btn btn-primary btn-lg">
                  Ver Mapa de Cañerías
                </a>
                
                <div class="divider">O selecciona un sensor</div>
                
                @if (sensores().length > 0) {
                  <select 
                    class="select select-bordered w-full" 
                    (change)="onSensorChange($event)"
                  >
                    <option disabled selected>Seleccionar sensor...</option>
                    @for (sensor of sensores(); track sensor.id) {
                      <option [value]="sensor.id">
                        {{ sensor.tipo }} - {{ sensor.tanque?.nombre }}
                      </option>
                    }
                  </select>
                } @else {
                  <p class="text-sm text-base-content/60">Cargando sensores...</p>
                }
              </div>
            </div>
          </div>
        } @else {
          <div class="card bg-base-200 shadow-xl max-w-md mx-auto">
            <div class="card-body">
              <h2 class="card-title text-2xl mb-4">Iniciar Sesión</h2>
              
              <form (ngSubmit)="onLoginSubmit()" class="flex flex-col gap-4">
                <label class="form-control w-full">
                  <span class="label">Email</span>
                  <input 
                    type="email" 
                    [(ngModel)]="email" 
                    name="email"
                    class="input input-bordered w-full" 
                    placeholder="email@ejemplo.com"
                    required
                  />
                </label>
                
                <label class="form-control w-full">
                  <span class="label">Contraseña</span>
                  <input 
                    type="password" 
                    [(ngModel)]="password" 
                    name="password"
                    class="input input-bordered w-full" 
                    placeholder="••••••••"
                    required
                  />
                </label>
                
                @if (error()) {
                  <p class="text-error text-sm">{{ error() }}</p>
                }
                
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  [class.loading]="loading()"
                >
                  @if (!loading()) {
                    Iniciar Sesión
                  }
                </button>
                
                <button 
                  type="button" 
                  class="btn btn-ghost"
                  (click)="loginMode.set(false)"
                >
                  Cancelar
                </button>
              </form>
            </div>
          </div>
        }

        @if (sensorId()) {
          <div class="mt-8">
            <a [routerLink]="['/graficos', sensorId()]" class="btn btn-secondary btn-block btn-lg">
              Ver Gráficos del Sensor
            </a>
          </div>
        }

        <div class="mt-8 text-center text-sm text-base-content/60">
          <p>Backend: NestJS | Frontend: Angular 21</p>
          <p>Mapas: Leaflet | Gráficos: ng2-charts | Tiempo Real: Socket.io</p>
        </div>
      </div>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  private apiService = inject(ApiService);
  
  loginMode = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  sensorId = signal<string | null>(null);
  
  email = '';
  password = '';
  
  sensores = signal<any[]>([]);

  ngOnInit() {
    this.loadSensores();
  }

  loadSensores() {
    try {
      this.apiService.getTanques().subscribe({
        next: (tanques) => {
          const sensores: any[] = [];
          tanques.forEach((tanque: any) => {
            if (tanque.sensores) {
              tanque.sensores.forEach((sensor: any) => {
                sensor.tanque = tanque;
                sensores.push(sensor);
              });
            }
          });
          this.sensores.set(sensores);
        },
      });
    } catch (err) {
      console.error('Error cargando tanques:', err);
    }
  }

  onSensorChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.sensorId.set(select.value || null);
  }

  onLoginSubmit() {
    if (!this.email || !this.password) {
      this.error.set('Por favor completa todos los campos');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.apiService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.loginMode.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Error al iniciar sesión');
      },
    });
  }
}