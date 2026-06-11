import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-shell">
      <!-- Sidebar -->
      <aside class="admin-sidebar">
        <div class="sidebar-brand">
          <span class="brand-icon">&#9672;</span>
          <div>
            <span class="brand-name">ContactHub</span>
            <span class="brand-badge">Admin</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <p class="nav-section">Tableau de bord</p>
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-item">
            <span class="nav-icon">&#9632;</span> Vue d'ensemble
          </a>

          <p class="nav-section">Gestion</p>
          <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">&#128101;</span> Utilisateurs
          </a>
          <a routerLink="/admin/contacts" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">&#128196;</span> Tous les contacts
          </a>

          <p class="nav-section">Compte</p>
          <a routerLink="/contacts" class="nav-item">
            <span class="nav-icon">&#8592;</span> Espace personnel
          </a>
          <a routerLink="/profile" class="nav-item">
            <span class="nav-icon">&#128100;</span> Mon profil
          </a>
          <button class="nav-item nav-item--danger" (click)="logout()">
            <span class="nav-icon">&#9211;</span> Déconnexion
          </button>
        </nav>

        <div class="sidebar-user">
          <div class="user-avatar">{{ getInitials() }}</div>
          <div class="user-info">
            <span class="user-name">{{ currentUser?.name }}</span>
            <span class="user-role">Administrateur</span>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <div class="admin-main">
        <!-- Top bar -->
        <header class="admin-topbar">
          <div class="topbar-breadcrumb">
            <span class="breadcrumb-app">Admin</span>
            <span class="breadcrumb-sep">›</span>
            <span class="breadcrumb-page">{{ getPageTitle() }}</span>
          </div>
          <div class="topbar-info">
            <span class="topbar-time">{{ now | date:'EEEE d MMMM yyyy, HH:mm' }}</span>
          </div>
        </header>

        <div class="admin-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-shell { display: flex; min-height: 100vh; background: #f0f4f8; }

    /* Sidebar */
    .admin-sidebar {
      width: 260px; background: #0f172a; color: white;
      display: flex; flex-direction: column;
      position: fixed; top: 0; left: 0; bottom: 0; z-index: 50;
      overflow-y: auto;
    }
    .sidebar-brand {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 1.5rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .brand-icon { font-size: 1.75rem; color: #60a5fa; }
    .brand-name { display: block; font-size: 1rem; font-weight: 700; color: white; }
    .brand-badge {
      display: inline-block; background: #1d4ed8; color: #93c5fd;
      font-size: 0.65rem; font-weight: 700; padding: 1px 6px; border-radius: 4px;
      text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px;
    }
    .sidebar-nav { flex: 1; padding: 1rem 0.75rem; display: flex; flex-direction: column; gap: 1px; }
    .nav-section {
      font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.1em; color: #475569; padding: 0.75rem 0.5rem 0.375rem;
      margin-top: 0.5rem;
    }
    .nav-item {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.625rem 0.875rem; border-radius: 8px;
      text-decoration: none; color: #94a3b8; font-size: 0.875rem; font-weight: 500;
      transition: all 0.15s; cursor: pointer; border: none; background: none; width: 100%; text-align: left;
    }
    .nav-item:hover { background: rgba(255,255,255,0.06); color: white; }
    .nav-item.active { background: #1d4ed8; color: white; }
    .nav-item--danger:hover { background: rgba(239,68,68,0.15); color: #f87171; }
    .nav-icon { font-size: 1rem; width: 20px; text-align: center; }
    .sidebar-user {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 1rem 1.25rem; border-top: 1px solid rgba(255,255,255,0.08);
    }
    .user-avatar {
      width: 36px; height: 36px; border-radius: 50%; background: #1d4ed8;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; font-weight: 700; color: white; flex-shrink: 0;
    }
    .user-name { display: block; font-size: 0.8rem; font-weight: 600; color: white; }
    .user-role { display: block; font-size: 0.7rem; color: #60a5fa; }

    /* Main */
    .admin-main { margin-left: 260px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; }
    .admin-topbar {
      background: white; border-bottom: 1px solid #e2e8f0;
      padding: 0 2rem; height: 56px; display: flex; align-items: center;
      justify-content: space-between; position: sticky; top: 0; z-index: 40;
    }
    .topbar-breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
    .breadcrumb-app { color: #94a3b8; font-weight: 500; }
    .breadcrumb-sep { color: #cbd5e1; }
    .breadcrumb-page { color: #1e293b; font-weight: 700; }
    .topbar-time { font-size: 0.8rem; color: #94a3b8; }
    .admin-content { flex: 1; padding: 2rem; }

    @media (max-width: 1024px) {
      .admin-sidebar { width: 220px; }
      .admin-main { margin-left: 220px; }
    }
  `]
})
export class AdminLayoutComponent implements OnInit {
  currentUser: any = null;
  now = new Date();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => this.currentUser = u);
    setInterval(() => this.now = new Date(), 60000);
  }

  getInitials(): string {
    return this.currentUser?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'A';
  }

  getPageTitle(): string {
    const url = this.router.url;
    if (url === '/admin') return 'Vue d\'ensemble';
    if (url.includes('/admin/users')) return 'Utilisateurs';
    if (url.includes('/admin/contacts')) return 'Contacts';
    return 'Admin';
  }

  logout(): void { this.authService.logout(); }
}
