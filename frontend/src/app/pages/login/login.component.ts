import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-base-200">
      <div class="card w-full max-w-md bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title justify-center text-2xl font-bold text-center mb-6">
            Sistema de Tanques de Agua
          </h2>
          
          <form (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
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
          </form>

          <div class="divider">Ó</div>
          
          <div class="text-center text-sm">
            <p class="text-base-content/60">Credenciales de prueba:</p>
            <p class="text-xs text-base-content/50">Admin: admin@test.com / admin123</p>
            <p class="text-xs text-base-content/50">Usuario: user1@test.com / user123</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private apiService = inject(ApiService);
  private router = inject(Router);

  email = '';
  password = '';
  
  loading = signal(false);
  error = signal<string | null>(null);

  onSubmit() {
    if (!this.email || !this.password) {
      this.error.set('Por favor completa todos los campos');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.apiService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Error al iniciar sesión');
      },
    });
  }
}