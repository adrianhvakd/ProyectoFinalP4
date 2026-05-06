import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, Tanque, User } from '../../../services/api.service';

@Component({
  selector: 'app-registrar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Gestión de Tanques</h1>
        <button class="btn btn-primary" (click)="mostrarFormulario()">
          + Nuevo Tanque
        </button>
      </div>

      <!-- Tabla de tanques -->
      <div class="overflow-x-auto bg-base-100 rounded-lg shadow">
        <table class="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Capacidad</th>
              <th>Usuario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (tanque of tanques(); track tanque.id) {
              <tr class="hover">
                <td class="font-bold">{{ tanque.nombre }}</td>
                <td>
                  <span [class]="tanque.tipo === 'RESERVORIO_PUBLICO' ? 'badge badge-primary' : 'badge badge-secondary'">
                    {{ tanque.tipo === 'RESERVORIO_PUBLICO' ? 'Reservorio' : 'Domiciliario' }}
                  </span>
                </td>
                <td>{{ tanque.capacidad_max }}L</td>
                <td>{{ tanque.user?.nombre || 'Sin asignar' }}</td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-xs btn-outline" (click)="editarTanque(tanque)">Editar</button>
                    <button class="btn btn-xs btn-outline btn-error" (click)="eliminarTanque(tanque)">Eliminar</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Modal formulario -->
      @if (showForm()) {
        <div class="modal modal-open">
          <div class="modal-box">
            <h3 class="font-bold text-lg">{{ editando() ? 'Editar' : 'Nuevo' }} Tanque</h3>
            
            <form (ngSubmit)="guardar()" class="space-y-4 mt-4">
              <label class="form-control w-full">
                <span class="label">Nombre</span>
                <input type="text" [(ngModel)]="form.nombre" name="nombre" class="input input-bordered w-full" required />
              </label>

              <label class="form-control w-full">
                <span class="label">Tipo</span>
                <select [(ngModel)]="form.tipo" name="tipo" class="select select-bordered w-full">
                  <option value="RESERVORIO_PUBLICO">Reservorio Público</option>
                  <option value="DOMICILIARIO">Domiciliario</option>
                </select>
              </label>

              <div class="grid grid-cols-2 gap-4">
                <label class="form-control w-full">
                  <span class="label">Capacidad (L)</span>
                  <input type="number" [(ngModel)]="form.capacidad_max" name="capacidad_max" class="input input-bordered w-full" required />
                </label>
                <label class="form-control w-full">
                  <span class="label">Altura máx (m)</span>
                  <input type="number" [(ngModel)]="form.altura_max" name="altura_max" class="input input-bordered w-full" required />
                </label>
              </div>

              <label class="form-control w-full">
                <span class="label">Usuario</span>
                <select [(ngModel)]="form.userId" name="userId" class="select select-bordered w-full">
                  <option value="">Sin asignar</option>
                  @for (u of usuarios(); track u.id) {
                    <option [value]="u.id">{{ u.nombre }} ({{ u.email }})</option>
                  }
                </select>
              </label>

              <div class="modal-action">
                <button type="button" class="btn" (click)="cancelar()">Cancelar</button>
                <button type="submit" class="btn btn-primary" [class.loading]="guardando()">Guardar</button>
              </div>
            </form>
          </div>
          <div class="modal-backdrop" (click)="cancelar()"></div>
        </div>
      }
    </div>
  `,
})
export class RegistrarComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  tanques = signal<Tanque[]>([]);
  usuarios = signal<User[]>([]);
  showForm = signal(false);
  editando = signal(false);
  guardando = signal(false);
  tanqueActual = signal<Tanque | null>(null);

  form = {
    nombre: '',
    tipo: 'DOMICILIARIO' as 'RESERVORIO_PUBLICO' | 'DOMICILIARIO',
    capacidad_max: 0,
    altura_max: 0,
    userId: '',
  };

  ngOnInit() {
    this.loadTanques();
    this.loadUsuarios();
  }

  loadTanques() {
    this.apiService.getTanques().subscribe({
      next: (data) => this.tanques.set(data),
    });
  }

  loadUsuarios() {
    // Get users from the same endpoint - just return basic list
    this.apiService.getTanques().subscribe({
      next: (tanques) => {
        const users: User[] = [];
        tanques.forEach((t) => {
          if (t.user && !users.find((u) => u.id === t.user!.id)) {
            users.push(t.user!);
          }
        });
        this.usuarios.set(users);
      },
    });
  }

  mostrarFormulario() {
    this.form = { nombre: '', tipo: 'DOMICILIARIO', capacidad_max: 0, altura_max: 0, userId: '' };
    this.editando.set(false);
    this.showForm.set(true);
  }

  editarTanque(tanque: Tanque) {
    this.tanqueActual.set(tanque);
    this.form = {
      nombre: tanque.nombre,
      tipo: tanque.tipo,
      capacidad_max: tanque.capacidad_max,
      altura_max: tanque.altura_max,
      userId: tanque.user?.id || '',
    };
    this.editando.set(true);
    this.showForm.set(true);
  }

  cancelar() {
    this.showForm.set(false);
    this.tanqueActual.set(null);
  }

  guardar() {
    this.guardando.set(true);
    const payload = {
      nombre: this.form.nombre,
      tipo: this.form.tipo,
      capacidad_max: this.form.capacidad_max,
      altura_max: this.form.altura_max,
      ubicacion: { type: 'Point', coordinates: [-65.75, -19.57] },
      userId: this.form.userId || undefined,
    };

    if (this.editando() && this.tanqueActual()) {
      // Update
      this.apiService.updateTanque(this.tanqueActual()!.id, payload).subscribe({
        next: () => {
          this.guardando.set(false);
          this.loadTanques();
          this.cancelar();
        },
        error: () => this.guardando.set(false),
      });
    } else {
      // Create
      this.apiService.createTanque(payload).subscribe({
        next: () => {
          this.guardando.set(false);
          this.loadTanques();
          this.cancelar();
        },
        error: () => this.guardando.set(false),
      });
    }
  }

  eliminarTanque(tanque: Tanque) {
    if (confirm(`¿Eliminar el tanque "${tanque.nombre}"?`)) {
      this.apiService.deleteTanque(tanque.id).subscribe({
        next: () => this.loadTanques(),
      });
    }
  }
}