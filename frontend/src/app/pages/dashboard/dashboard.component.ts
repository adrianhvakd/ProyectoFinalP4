import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService, Reservorio, Domiciliario, Tanque } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiService);

  reservorios = signal<Reservorio[]>([]);
  domiciliarios = signal<Domiciliario[]>([]);
  alertas = signal<any[]>([]);
  esAdmin = signal(false);
  ultimasMediciones = signal<any[]>([]);

  ngOnInit() {
    this.loadTanques();
    this.esAdmin.set(this.apiService.isAdmin());
  }

  loadTanques() {
    this.apiService.getReservorios().subscribe({
      next: (data) => {
        this.reservorios.set(data);
        this.checkAlertas(data);
        this.actualizarMediciones(data);
      },
    });
    this.apiService.getDomiciliarios().subscribe({
      next: (data) => {
        this.domiciliarios.set(data);
      },
    });
  }

  getNivel(r: Reservorio): number | null {
    const sensores = r.sensores;
    if (!sensores) return null;
    const nivel = sensores.find((s: any) => s.tipo === 'NIVEL');
    if (!nivel?.mediciones?.length) return null;
    return nivel.mediciones[0].valor;
  }

  private actualizarMediciones(reservorios: Reservorio[]) {
    const meds = reservorios.map(r => {
      const sensores = r.sensores || [];
      const nivel = sensores.find((s: any) => s.tipo === 'NIVEL')?.mediciones?.[0]?.valor ?? null;
      const ph = sensores.find((s: any) => s.tipo === 'PH')?.mediciones?.[0]?.valor ?? null;
      const turbidez = sensores.find((s: any) => s.tipo === 'TURBIDEZ')?.mediciones?.[0]?.valor ?? null;
      return { id: r.id, nombre: r.nombre, nivel, ph, turbidez };
    }).slice(0, 5);
    this.ultimasMediciones.set(meds);
  }

  private checkAlertas(reservorios: Reservorio[]) {
    const alertas: any[] = [];
    
    for (const r of reservorios) {
      const sensores = r.sensores;
      if (sensores && sensores.length > 0) {
        const nivel = sensores.find((s: any) => s.tipo === 'NIVEL');
        if (nivel && nivel.mediciones && nivel.mediciones.length > 0) {
          const ultimo = nivel.mediciones[0];
          if (ultimo && (ultimo.valor < 20 || ultimo.valor > 95)) {
            alertas.push({
              tanqueId: r.id,
              tanqueNombre: r.nombre,
              tipo: ultimo.valor < 20 ? 'NIVEL_BAJO' : 'NIVEL_ALTO',
              mensaje: ultimo.valor < 20 
                ? `Nivel bajo: ${ultimo.valor}%`
                : `Nivel alto: ${ultimo.valor}%`,
            });
          }
        }
      }
    }
    
    this.alertas.set(alertas);
  }
}