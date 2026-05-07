import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Tanque, Sensor, Medicion, Reservorio } from '../../services/api.service';
import { MapaComponent } from '../../components/mapa/mapa.component';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-mis-tanques',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MapaComponent, BaseChartDirective],
  templateUrl: './mis-tanques.component.html',
})
export class MisTanquesComponent implements OnInit {
  private apiService = inject(ApiService);

  todosTanques = signal<Tanque[]>([]);
  reservorioConectado = signal<Reservorio | null>(null);
  mostrarCanerias = signal(true);
  mostrarZonas = signal(true);
  
  tanqueSeleccionado = signal<Tanque | null>(null);
  sensorSeleccionado: string = '';
  
  mediciones = signal<Medicion[]>([]);

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
    },
    elements: {
      line: { tension: 0.4 },
      point: { radius: 2 },
    },
  };

  tanquesFiltrados = computed(() => {
    const todos = this.todosTanques();
    const reservorio = this.reservorioConectado();
    const userId = this.apiService.currentUser()?.id;
    const esAdmin = this.apiService.isAdmin();
    
    if (esAdmin) {
      return todos;
    }
    
    if (!userId) {
      return [];
    }
    
    const tanquesUser = todos.filter(t => 
      t.tipo === 'DOMICILIARIO' && (t as any).user?.id === userId
    );
    
    const result: Tanque[] = [...tanquesUser];
    
    if (reservorio) {
      result.push({
        ...reservorio,
        tipo: 'RESERVORIO_PUBLICO'
      } as Tanque);
    }
    
    return result;
  });

  idsTanquesFiltrados = computed(() => {
    const ids: string[] = [];
    const reservorio = this.reservorioConectado();
    
    if (reservorio) {
      ids.push(reservorio.id);
      console.log('Agregando reservorio ID a ids:', reservorio.id);
    }
    
    const domiciliarios = this.todosTanques().filter(t => 
      t.tipo === 'DOMICILIARIO' && (t as any).user?.id === this.apiService.currentUser()?.id
    );
    domiciliarios.forEach(d => {
      if (!ids.includes(d.id)) {
        ids.push(d.id);
      }
    });
    
    console.log('idsTanquesFiltrados final:', ids);
    return ids;
  });

  sensoresDelTanque = computed(() => {
    const tanque = this.tanqueSeleccionado();
    if (!tanque) return [];
    return (tanque.sensores as Sensor[]) || [];
  });

  chartData = computed(() => {
    const meds = this.mediciones();
    if (!meds.length || !this.sensorSeleccionado) return null;

    const ultimoSensor = this.sensoresDelTanque().find(s => s.id === this.sensorSeleccionado);
    if (!ultimoSensor) return null;

    const filtered = meds
      .filter(m => m.sensor?.id === this.sensorSeleccionado)
      .slice(-20);

    if (!filtered.length) return null;

    return {
      labels: filtered.map(m => 
        new Date(m.fecha_hora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
      ),
      datasets: [{
        data: filtered.map(m => m.valor),
        borderColor: this.getSensorColor(ultimoSensor.tipo),
        backgroundColor: this.getSensorColor(ultimoSensor.tipo) + '20',
        fill: true,
      }],
    };
  });

  ultimaMedicion = computed(() => {
    const meds = this.mediciones();
    if (!meds.length || !this.sensorSeleccionado) return null;
    return meds
      .filter(m => m.sensor?.id === this.sensorSeleccionado)
      .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())[0];
  });

  ngOnInit() {
    this.loadTanques();
  }

  loadTanques() {
    this.apiService.getTanques().subscribe({
      next: (data) => {
        this.todosTanques.set(data);
        
        if (!this.isAdmin()) {
          this.loadReservorioConectado(data);
        }
      },
    });
  }

  private loadReservorioConectado(tanques: Tanque[]) {
    const userId = this.apiService.currentUser()?.id;
    if (!userId) return;

    const misDomiciliarios = tanques.filter(t => 
      t.tipo === 'DOMICILIARIO' && (t as any).user?.id === userId
    );

    if (misDomiciliarios.length > 0) {
      const reservorioId = (misDomiciliarios[0] as any).reservorio?.id;
      if (reservorioId) {
        this.apiService.getReservorioById(reservorioId).subscribe({
          next: (reservorio) => {
            this.reservorioConectado.set(reservorio);
          },
        });
      }
    }
  }

  isAdmin(): boolean {
    return this.apiService.isAdmin();
  }

  esSoloLectura(): boolean {
    return !this.apiService.isAdmin();
  }

  onTanqueSeleccionado(tanque: Tanque) {
    this.tanqueSeleccionado.set(tanque);
    const sensores = (tanque.sensores as Sensor[]) || [];
    if (sensores.length > 0) {
      this.sensorSeleccionado = sensores[0].id;
      this.loadMediciones();
    } else {
      this.sensorSeleccionado = '';
      this.mediciones.set([]);
    }
  }

  onSensorChange(sensorId: string) {
    this.sensorSeleccionado = sensorId;
    this.loadMediciones();
  }

  private loadMediciones() {
    if (!this.sensorSeleccionado) return;
    
    this.apiService.getMediciones(this.sensorSeleccionado).subscribe({
      next: (data) => {
        this.mediciones.set(data);
      },
    });
  }

  getSensorLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'NIVEL': 'Nivel de Agua',
      'PH': 'pH',
      'TURBIDEZ': 'Turbidez',
      'TEMPERATURA': 'Temperatura',
      'FLUJO': 'Flujo',
    };
    return labels[tipo] || tipo;
  }

  getUnidad(sensorId: string): string {
    const sensor = this.sensoresDelTanque().find(s => s.id === sensorId);
    return sensor?.unidad_medida || '%';
  }

  getSensorColor(tipo: string): string {
    const colors: Record<string, string> = {
      'NIVEL': '#3b82f6',
      'PH': '#22c55e',
      'TURBIDEZ': '#f59e0b',
      'TEMPERATURA': '#ef4444',
      'FLUJO': '#8b5cf6',
    };
    return colors[tipo] || '#6b7280';
  }

  getUltimaLectura(sensorId: string): { valor: number } | null {
    const tanque = this.tanqueSeleccionado();
    if (!tanque?.sensores) return null;
    const sensor = (tanque.sensores as Sensor[]).find(s => s.id === sensorId);
    if (!sensor?.mediciones?.length) return null;
    return { valor: sensor.mediciones[0].valor };
  }

  getValorClass(tipo: string, valor: number): string {
    if (tipo === 'NIVEL') {
      if (valor < 30) return 'text-error font-bold';
      if (valor > 90) return 'text-warning font-bold';
    }
    if (tipo === 'PH') {
      if (valor < 6 || valor > 8) return 'text-error font-bold';
    }
    return '';
  }
}