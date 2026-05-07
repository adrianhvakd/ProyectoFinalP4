import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, User } from '../../../services/api.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
})
export class UsuariosComponent implements OnInit {
  private apiService = inject(ApiService);

  usuarios = signal<User[]>([]);
  showForm = signal(false);
  editando = signal(false);
  guardando = signal(false);
  usuarioActual = signal<User | null>(null);
  currentUserId = signal<string | null>(null);

  form: {
    nombre: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'USER';
  } = {
    nombre: '',
    email: '',
    password: '',
    role: 'USER',
  };

  ngOnInit() {
    this.apiService.currentUser()?.id && this.currentUserId.set(this.apiService.currentUser()!.id);
    this.loadUsuarios();
  }

  loadUsuarios() {
    this.apiService.getUsers().subscribe({
      next: (users) => {
        const filtered = users.filter(u => u.id !== this.currentUserId());
        this.usuarios.set(filtered);
      },
    });
  }

  mostrarFormulario() {
    this.form = { nombre: '', email: '', password: '', role: 'USER' };
    this.editando.set(false);
    this.showForm.set(true);
  }

  editarUsuario(usuario: User) {
    this.usuarioActual.set(usuario);
    this.form = {
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      role: usuario.role,
    };
    this.editando.set(true);
    this.showForm.set(true);
  }

  cancelar() {
    this.showForm.set(false);
    this.usuarioActual.set(null);
  }

  guardar() {
    this.guardando.set(true);

    if (this.editando() && this.usuarioActual()) {
      const payload: any = {
        nombre: this.form.nombre,
        role: this.form.role,
      };
      if (this.form.password) {
        payload.password = this.form.password;
      }

      this.apiService.updateUser(this.usuarioActual()!.id, payload).subscribe({
        next: () => {
          this.guardando.set(false);
          this.loadUsuarios();
          this.cancelar();
        },
        error: () => this.guardando.set(false),
      });
    } else {
      this.apiService.createUser({
        nombre: this.form.nombre,
        email: this.form.email,
        password: this.form.password,
        role: this.form.role,
      }).subscribe({
        next: () => {
          this.guardando.set(false);
          this.loadUsuarios();
          this.cancelar();
        },
        error: () => this.guardando.set(false),
      });
    }
  }

  eliminarUsuario(usuario: User) {
    if (confirm(`¿Eliminar el usuario "${usuario.nombre}"? Esta acción no se puede deshacer.`)) {
      this.apiService.deleteUser(usuario.id).subscribe({
        next: () => this.loadUsuarios(),
      });
    }
  }
}