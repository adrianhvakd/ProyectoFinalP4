import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
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