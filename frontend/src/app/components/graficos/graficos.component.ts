import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ApiService, Medicion } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-graficos',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './graficos.component.html',
})
export class GraficosComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private socketService = inject(SocketService);

  loading = signal(false);
  ultimaActualizacion = signal<Date>(new Date());

  mediciones = signal<Medicion[]>([]);

  nivelChartData = computed(() => {
    const meds = this.mediciones();
    const nivelData = meds
      .filter((m) => m.sensor?.tipo === 'NIVEL')
      .slice(-20)
      .map((m) => m.valor);
    const labels = meds
      .filter((m) => m.sensor?.tipo === 'NIVEL')
      .slice(-20)
      .map((m) =>
        new Date(m.fecha_hora).toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      );

    return {
      labels,
      datasets: [
        {
          data: nivelData,
          label: 'Nivel (%)',
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  });

  phChartData = computed(() => {
    const meds = this.mediciones();
    const phData = meds
      .filter((m) => m.sensor?.tipo === 'PH')
      .slice(-20)
      .map((m) => m.valor);
    const labels = meds
      .filter((m) => m.sensor?.tipo === 'PH')
      .slice(-20)
      .map((m) =>
        new Date(m.fecha_hora).toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      );

    return {
      labels,
      datasets: [
        {
          data: phData,
          label: 'pH',
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  });

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 14,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
  };

  ngOnInit() {
    const sensorId = this.route.snapshot.paramMap.get('sensorId');
    if (sensorId) {
      this.loadData(sensorId);
      this.subscribeToSensor(sensorId);
    }
  }

  ngOnDestroy() {
    const sensorId = this.route.snapshot.paramMap.get('sensorId');
    if (sensorId) {
      this.socketService.emit('unsubscribe_mediciones', { sensorId });
    }
  }

  private async loadData(sensorId: string) {
    this.loading.set(true);

    try {
      const mediciones = await this.apiService
        .getMediciones(sensorId)
        .toPromise();
      this.mediciones.set(mediciones || []);
    } catch (error) {
      console.error('Error cargando mediciones:', error);
    } finally {
      this.loading.set(false);
    }
  }

  private subscribeToSensor(sensorId: string) {
    this.socketService.emit('subscribe_mediciones', { sensorId });

    this.socketService.onMedicionNew().subscribe((data: any) => {
      if (data.sensorId === sensorId && data.medicion) {
        this.mediciones.update((current) => [data.medicion, ...current].slice(0, 100));
        this.ultimaActualizacion.set(new Date());
      }
    });
  }
}