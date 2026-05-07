import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.component.html',
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