import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Tanque, Medicion } from '../../services/api.service';

@Component({
  selector: 'app-mis-tanques',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-4">
      <h1 class="text-2xl font-bold">
        {{ isAdmin() ? 'Todos los Tanques' : 'Mis Tanques' }}
      </h1>

      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Capacidad</th>
              <th>Último Nivel</th>
              <th>Último pH</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (tanque of tanques(); track tanque.id) {
              <tr class="hover">
                <td>
                  <div class="font-bold">{{ tanque.nombre }}</div>
                  <div class="text-xs text-base-content/60">{{ tanque.id.slice(0, 8) }}...</div>
                </td>
                <td>
                  <span [class]="tanque.tipo === 'RESERVORIO_PUBLICO' ? 'badge badge-primary' : 'badge badge-secondary'">
                    {{ tanque.tipo === 'RESERVORIO_PUBLICO' ? 'Reservorio' : 'Domiciliario' }}
                  </span>
                </td>
                <td>{{ tanque.capacidad_max }}L</td>
                <td>
                  @if (getNivel(tanque); as nivel) {
                    <span [class]="nivel.valor < 30 ? 'text-error font-bold' : ''">
                      {{ nivel.valor }}%
                    </span>
                  } @else {
                    <span class="text-base-content/50">-</span>
                  }
                </td>
                <td>
                  @if (getPh(tanque); as ph) {
                    <span [class]="ph.valor < 6 || ph.valor > 8 ? 'text-error font-bold' : ''">
                      {{ ph.valor }}
                    </span>
                  } @else {
                    <span class="text-base-content/50">-</span>
                  }
                </td>
                <td>
                  <div class="flex gap-2">
                    @for (sensor of getSensores(tanque); track sensor.id) {
                      <a [routerLink]="['/mediciones', sensor.id]" class="btn btn-xs btn-outline">
                        {{ sensor.tipo }}
                      </a>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (tanques().length === 0) {
        <div class="alert alert-info">
          <span>No tienes tanques registrados.</span>
        </div>
      }
    </div>
  `,
})
export class MisTanquesComponent implements OnInit {
  private apiService = inject(ApiService);

  tanques = signal<Tanque[]>([]);

  ngOnInit() {
    this.loadTanques();
  }

  loadTanques() {
    const user = this.apiService.currentUser();
    this.apiService.getTanques().subscribe({
      next: (tanques) => {
        const currentUser = this.apiService.currentUser();
        if (this.isAdmin()) {
          this.tanques.set(tanques);
        } else if (currentUser) {
          this.tanques.set(tanques.filter(t => t.user?.id === currentUser.id));
        }
      },
    });
  }

  isAdmin(): boolean {
    return this.apiService.isAdmin();
  }

  getSensores(tanque: Tanque) {
    return tanque.sensores || [];
  }

  getNivel(tanque: Tanque): { valor: number } | null {
    const sensores = tanque.sensores;
    if (!sensores) return null;
    const nivel = sensores.find(s => s?.tipo === 'NIVEL');
    if (!nivel?.mediciones?.length) return null;
    const ult = nivel.mediciones[0];
    if (!ult) return null;
    return { valor: ult.valor };
  }

  getPh(tanque: Tanque): { valor: number } | null {
    const sensores = tanque.sensores;
    if (!sensores) return null;
    const ph = sensores.find(s => s?.tipo === 'PH');
    if (!ph?.mediciones?.length) return null;
    return { valor: ph.mediciones[0].valor };
  }
}