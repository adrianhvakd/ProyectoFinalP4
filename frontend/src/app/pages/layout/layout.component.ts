import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, RouterOutlet } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  sidebarOpen = signal(false);

  ngOnInit() {}

  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  closeSidebar() {
    const checkbox = document.getElementById('my-drawer') as HTMLInputElement;
    if (checkbox) checkbox.checked = false;
  }

  user = () => this.apiService.currentUser();
  isAdmin = () => this.apiService.isAdmin();

  logout() {
    this.closeSidebar();
    this.apiService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}