import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/contact.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="navbar__brand">
        <span class="navbar__logo">&#9672;</span>
        <span class="navbar__name">ContactHub</span>
      </div>

      <div class="navbar__links">
        <a routerLink="/dashboard" routerLinkActive="active" class="navbar__link">
          <span>&#9643;</span> Dashboard
        </a>
        <a routerLink="/contacts" routerLinkActive="active" class="navbar__link">
          <span>&#128101;</span> Contacts
        </a>
        <a *ngIf="isAdmin" routerLink="/admin" routerLinkActive="active" class="navbar__link navbar__link--admin">
          <span>&#9881;</span> Admin
        </a>
      </div>

      <div class="navbar__user" (click)="toggleMenu()">
        <div class="avatar" [class.avatar--admin]="isAdmin">{{ getInitials() }}</div>
        <span class="navbar__username">{{ currentUser?.name }}</span>
        <span *ngIf="isAdmin" class="admin-pill">Admin</span>
        <span class="navbar__caret">&#9662;</span>

        <div class="navbar__dropdown" [class.open]="menuOpen">
          <a routerLink="/profile" class="dropdown__item" (click)="menuOpen=false">
            <span>&#128100;</span> Mon profil
          </a>
          <a *ngIf="isAdmin" routerLink="/admin" class="dropdown__item dropdown__item--admin" (click)="menuOpen=false">
            <span>&#9881;</span> Panneau Admin
          </a>
          <div class="dropdown__divider"></div>
          <button class="dropdown__item dropdown__item--danger" (click)="logout()">
            <span>&#9211;</span> Déconnexion
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      display: flex; align-items: center; gap: 2rem;
      padding: 0 2rem; height: 64px;
      background: var(--surface, white);
      border-bottom: 1px solid var(--border, #e2e8f0);
      box-shadow: 0 1px 8px rgba(0,0,0,0.06);
    }
    .navbar__brand { display: flex; align-items: center; gap: 0.5rem; }
    .navbar__logo { font-size: 1.5rem; color: #2d6a9f; }
    .navbar__name { font-size: 1.1rem; font-weight: 700; color: #1e293b; letter-spacing: -0.02em; }
    .navbar__links { display: flex; gap: 0.25rem; flex: 1; }
    .navbar__link {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.5rem 0.875rem; border-radius: 8px;
      text-decoration: none; color: #64748b;
      font-size: 0.875rem; font-weight: 500; transition: all 0.15s;
    }
    .navbar__link:hover, .navbar__link.active { background: #dbeafe; color: #2d6a9f; }
    .navbar__link--admin:hover, .navbar__link--admin.active { background: #ede9fe; color: #7c3aed; }
    .navbar__user {
      position: relative; display: flex; align-items: center;
      gap: 0.625rem; cursor: pointer; padding: 0.375rem 0.75rem;
      border-radius: 8px; transition: background 0.15s;
    }
    .navbar__user:hover { background: #f1f5f9; }
    .avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: #2d6a9f; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; font-weight: 700;
    }
    .avatar--admin { background: #7c3aed; }
    .navbar__username { font-size: 0.875rem; font-weight: 500; color: #1e293b; }
    .admin-pill { background: #ede9fe; color: #7c3aed; font-size: 0.65rem; font-weight: 700; padding: 1px 6px; border-radius: 4px; text-transform: uppercase; }
    .navbar__caret { color: #94a3b8; font-size: 0.7rem; }
    .navbar__dropdown {
      position: absolute; top: calc(100% + 8px); right: 0;
      background: white; border: 1px solid #e2e8f0;
      border-radius: 12px; padding: 0.5rem;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      min-width: 200px; display: none; z-index: 200;
    }
    .navbar__dropdown.open { display: block; }
    .dropdown__item {
      display: flex; align-items: center; gap: 0.625rem;
      padding: 0.625rem 0.75rem; border-radius: 7px;
      text-decoration: none; color: #374151;
      font-size: 0.875rem; cursor: pointer; width: 100%;
      background: none; border: none; text-align: left; transition: background 0.1s;
    }
    .dropdown__item:hover { background: #f1f5f9; }
    .dropdown__item--admin { color: #7c3aed; }
    .dropdown__item--admin:hover { background: #ede9fe; }
    .dropdown__item--danger { color: #ef4444; }
    .dropdown__item--danger:hover { background: #fee2e2; }
    .dropdown__divider { height: 1px; background: #e2e8f0; margin: 0.375rem 0; }
    @media (max-width: 768px) {
      .navbar__username, .admin-pill { display: none; }
      .navbar__links { gap: 0; }
    }
  `]
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  menuOpen = false;
  isAdmin = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => {
      this.currentUser = u;
      this.isAdmin = u?.role === 'admin';
    });
    document.addEventListener('click', (e: Event) => {
      if (!(e.target as HTMLElement).closest('.navbar__user')) this.menuOpen = false;
    });
  }

  getInitials(): string {
    if (!this.currentUser?.name) return '?';
    return this.currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  logout(): void { this.authService.logout(); }
}
