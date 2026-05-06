import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Tanque } from '../../services/api.service';
import { MapaComponent } from '../../components/mapa/mapa.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MapaComponent],
  template: `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <div class="flex gap-2">
          <button class="btn btn-sm btn-outline" (click)="toggleCapas()">
            {{ mostrarCanerias() ? 'Ocultar' : 'Mostrar' }} Cañerías
          </button>
          <button class="btn btn-sm btn-outline" (click)="toggleZonas()">
            {{ mostrarZonas() ? 'Ocultar' : 'Mostrar' }} Zonas
          </button>
        </div>
      </div>

      <!-- Stats cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="stats bg-base-100 shadow">
          <div class="stat">
            <div class="stat-title">Total Tanques</div>
            <div class="stat-value text-primary">{{ numeroTanques() }}</div>
          </div>
        </div>
        <div class="stats bg-base-100 shadow">
          <div class="stat">
            <div class="stat-title">Reservorio</div>
            <div class="stat-value">{{ numeroReservorios() }}</div>
          </div>
        </div>
        <div class="stats bg-base-100 shadow">
          <div class="stat">
            <div class="stat-title">Domiciliarios</div>
            <div class="stat-value text-secondary">{{ numeroDomiciliarios() }}</div>
          </div>
        </div>
        <div class="stats bg-base-100 shadow">
          <div class="stat">
            <div class="stat-title">Con Alertas</div>
            <div class="stat-value text-error">{{ numeroAlertas() }}</div>
          </div>
        </div>
      </div>

      <!-- Mapa -->
      <div class="bg-base-100 rounded-lg shadow p-4">
        <app-mapa 
          [tanques]="tanques()" 
          [mostrarCanerias]="mostrarCanerias()"
          [mostrarZonas]="mostrarZonas()"
          [modoAdmin]="esAdmin()"
          (tanqueGuardado)="loadTanques()"
        ></app-mapa>
      </div>

      <!-- Recent alerts -->
      @if (alertas().length > 0) {
        <div class="bg-base-100 rounded-lg shadow p-4">
          <h2 class="font-bold text-lg mb-4">Alertas Recientes</h2>
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Tanque</th>
                  <th>Tipo</th>
                  <th>Mensaje</th>
                </tr>
              </thead>
              <tbody>
                @for (alerta of alertas(); track alerta.tanqueId) {
                  <tr class="hover">
                    <td>{{ alerta.tanqueNombre }}</td>
                    <td>
                      <span class="badge badge-error">{{ alerta.tipo }}</span>
                    </td>
                    <td>{{ alerta.mensaje }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiService);

  tanques = signal<Tanque[]>([]);
  alertas = signal<any[]>([]);
  mostrarCanerias = signal(true);
  mostrarZonas = signal(true);

  ngOnInit() {
    this.loadTanques();
  }

  loadTanques() {
    this.apiService.getTanques().subscribe({
      next: (tanques) => {
        this.tanques.set(tanques);
        this.checkAlertas(tanques);
      },
    });
  }

  private checkAlertas(tanques: Tanque[]) {
    const alertas: any[] = [];
    
    for (const tanque of tanques) {
      const sensores = tanque.sensores;
      if (sensores && sensores.length > 0) {
        const nivel = sensores.find((s: any) => s.tipo === 'NIVEL');
        if (nivel && nivel.mediciones && nivel.mediciones.length > 0) {
          const ultimo = nivel.mediciones[0];
          if (ultimo && (ultimo.valor < 20 || ultimo.valor > 95)) {
            alertas.push({
              tanqueId: tanque.id,
              tanqueNombre: tanque.nombre,
              tipo: ultimo.valor < 20 ? 'NIVEL_BAJO' : 'NIVEL_ALTO',
              mensaje: ultimo.valor < 20 
                ? 'Nivel bajo: ' + ultimo.valor + '%'
                : 'Nivel alto: ' + ultimo.valor + '%',
            });
          }
        }
      }
    }
    
    this.alertas.set(alertas);
  }

  numeroTanques = () => this.tanques().length;
  numeroReservorios = () => this.tanques().filter(t => t.tipo === 'RESERVORIO_PUBLICO').length;
  numeroDomiciliarios = () => this.tanques().filter(t => t.tipo === 'DOMICILIARIO').length;
  numeroAlertas = () => this.alertas().length;
  esAdmin = () => this.apiService.isAdmin();

  toggleCapas() {
    this.mostrarCanerias.update(v => !v);
  }

  toggleZonas() {
    this.mostrarZonas.update(v => !v);
  }
}