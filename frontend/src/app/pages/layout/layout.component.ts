import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, RouterOutlet } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="drawer lg:drawer-open">
      <input id="drawer" type="checkbox" class="drawer-toggle" [checked]="sidebarOpen()" (change)="sidebarOpen.set(!sidebarOpen())" />
      
      <div class="drawer-content flex flex-col" style="background-color: var(--b2);">
        <!-- Navbar when sidebar is hidden on mobile -->
        <div class="navbar bg-base-100 lg:hidden">
          <div class="flex-none">
            <label for="drawer" class="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </label>
          </div>
          <div class="flex-1">
            <a class="btn btn-ghost text-xl">Sistema de Tanques</a>
          </div>
          <div class="flex-none">
            <button class="btn btn-square btn-ghost" (click)="logout()">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Page content -->
        <div class="p-4">
          <router-outlet></router-outlet>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="drawer-side z-40">
        <label for="drawer" class="drawer-overlay"></label>
        <aside class="bg-base-100 w-64 min-h-full" style="width: 280px;">
          <div class="p-4 bg-base-200">
            <div class="flex items-center gap-3">
              <div class="avatar placeholder">
                <div class="bg-primary text-primary-content rounded-full w-12">
                  <span class="text-xl">{{ user()?.nombre?.charAt(0) }}</span>
                </div>
              </div>
              <div class="flex-1">
                <p class="font-bold">{{ user()?.nombre }}</p>
                <p class="text-xs text-base-content/60">{{ user()?.role === 'ADMIN' ? 'Administrador' : 'Usuario' }}</p>
              </div>
            </div>
          </div>

          <ul class="menu p-4 gap-2">
            @if (isAdmin()) {
              <!-- ADMIN menu -->
              <li><a routerLink="/dashboard" routerLinkActive="btn-active" class="btn btn-ghost justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentPath">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                </svg>
                Dashboard
              </a></li>
              <li><a routerLink="/mis-tanques" routerLinkActive="btn-active" class="btn btn-ghost justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentPath">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0l2-2m-2 2l-2-2m2 2l2 2"></path>
                </svg>
                Mis Tanques
              </a></li>
              <li><a routerLink="/registrar" routerLinkActive="btn-active" class="btn btn-ghost justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentPath">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Registrar Tanque
              </a></li>
              <li><a routerLink="/usuarios" routerLinkActive="btn-active" class="btn btn-ghost justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentPath">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m0 0a6 6 0 01-12 0v1z"></path>
                </svg>
                Usuarios
              </a></li>
            } @else {
              <!-- USER menu -->
              <li><a routerLink="/dashboard" routerLinkActive="btn-active" class="btn btn-ghost justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentPath">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                </svg>
                Mi Dashboard
              </a></li>
              <li><a routerLink="/mis-tanques" routerLinkActive="btn-active" class="btn btn-ghost justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentPath">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0l2-2m-2 2l-2-2m2 2l2 2"></path>
                </svg>
                Mis Tanques
              </a></li>
            }
          </ul>

          <div class="absolute bottom-0 w-full p-4 border-t border-base-300">
            <button class="btn btn-ghost btn-block" (click)="logout()">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentPath">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </aside>
      </div>
    </div>
  `,
})
export class LayoutComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  sidebarOpen = signal(true);

  ngOnInit() {
    // No need to check - user data is already in currentUser from login
    // If needed, could verify with profile later
  }

  user = () => this.apiService.currentUser();
  isAdmin = () => this.apiService.isAdmin();

  logout() {
    this.apiService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}