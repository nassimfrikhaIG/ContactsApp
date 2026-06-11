import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin-user-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page" *ngIf="data; else loading">
      <a routerLink="/admin/users" class="back-btn">&#8592; Retour aux utilisateurs</a>

      <!-- User header -->
      <div class="user-header">
        <div class="user-avatar" [class.user-avatar--admin]="data.user.role==='admin'">
          {{ data.user.name[0].toUpperCase() }}
        </div>
        <div class="user-identity">
          <h1>{{ data.user.name }}</h1>
          <p>{{ data.user.email }}</p>
          <div class="user-badges">
            <span class="badge" [class.badge--admin]="data.user.role==='admin'" [class.badge--user]="data.user.role==='user'">
              {{ data.user.role === 'admin' ? '&#9881; Administrateur' : '&#128100; Utilisateur' }}
            </span>
            <span class="badge" [class.badge--active]="data.user.isActive" [class.badge--inactive]="!data.user.isActive">
              {{ data.user.isActive ? '&#9989; Actif' : '&#10060; Inactif' }}
            </span>
          </div>
        </div>
        <div class="user-actions">
          <button class="btn btn--outline" (click)="toggleStatus()">
            {{ data.user.isActive ? '&#128274; Désactiver' : '&#128275; Activer' }}
          </button>
          <a [routerLink]="['/admin/users']" [queryParams]="{edit: data.user._id}" class="btn btn--primary">
            &#9998; Modifier
          </a>
        </div>
      </div>

      <!-- Stats cards -->
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-value">{{ data.contactCount }}</span>
          <span class="stat-label">Contacts</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ data.user.createdAt | date:'dd/MM/yyyy' }}</span>
          <span class="stat-label">Inscrit le</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ data.user.lastLogin ? (data.user.lastLogin | date:'dd/MM/yyyy') : 'Jamais' }}</span>
          <span class="stat-label">Dernière connexion</span>
        </div>
        <div class="stat-card">
          <span class="stat-value monospace">{{ data.user._id.slice(-8) }}</span>
          <span class="stat-label">ID (partiel)</span>
        </div>
      </div>

      <div class="bottom-grid">
        <!-- Recent contacts -->
        <div class="card">
          <div class="card-header">
            <h3>Derniers contacts</h3>
            <span class="card-count">{{ data.contactCount }} au total</span>
          </div>
          <div class="contacts-list" *ngIf="data.contacts.length; else noContacts">
            <div *ngFor="let c of data.contacts" class="contact-row">
              <div class="contact-avatar" [style.background]="avatarColor(c)">
                {{ c.firstName[0] }}{{ c.lastName[0] }}
              </div>
              <div class="contact-info">
                <strong>{{ c.firstName }} {{ c.lastName }}</strong>
                <span>{{ c.company || c.email || '—' }}</span>
              </div>
              <div class="contact-meta">
                <span *ngIf="c.isFavorite" class="star">&#11088;</span>
                <span class="source-tag">{{ c.source }}</span>
              </div>
              <span class="contact-date">{{ c.createdAt | date:'dd/MM' }}</span>
            </div>
          </div>
          <ng-template #noContacts>
            <p class="empty">Aucun contact enregistré</p>
          </ng-template>
        </div>

        <!-- Activity log -->
        <div class="card">
          <h3 class="card-title-simple">Journal d'activité</h3>
          <div class="activity-list" *ngIf="data.activityLog.length; else noActivity">
            <div *ngFor="let a of data.activityLog" class="activity-row">
              <span class="activity-icon">{{ actionIcon(a.action) }}</span>
              <div class="activity-body">
                <span class="activity-desc">{{ a.description }}</span>
                <span class="activity-time">{{ a.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <span class="action-badge action-badge--{{ a.action }}">{{ a.action }}</span>
            </div>
          </div>
          <ng-template #noActivity>
            <p class="empty">Aucune activité enregistrée</p>
          </ng-template>
        </div>
      </div>
    </div>

    <ng-template #loading>
      <div class="loading"><div class="spinner"></div></div>
    </ng-template>
  `,
  styles: [`
    .back-btn { display: inline-flex; align-items: center; gap: 0.5rem; color: #64748b; text-decoration: none; font-size: 0.875rem; margin-bottom: 1.5rem; transition: color 0.1s; }
    .back-btn:hover { color: #1d4ed8; }

    .user-header { background: white; border-radius: 14px; padding: 2rem; display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 6px rgba(0,0,0,0.06); flex-wrap: wrap; }
    .user-avatar { width: 72px; height: 72px; border-radius: 50%; background: #1d4ed8; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; font-weight: 800; flex-shrink: 0; }
    .user-avatar--admin { background: #7c3aed; }
    .user-identity { flex: 1; min-width: 200px; }
    .user-identity h1 { margin: 0 0 0.25rem; font-size: 1.5rem; font-weight: 800; color: #0f172a; }
    .user-identity p { margin: 0 0 0.75rem; color: #64748b; }
    .user-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.78rem; font-weight: 700; }
    .badge--admin { background: #ede9fe; color: #6d28d9; }
    .badge--user { background: #dbeafe; color: #1d4ed8; }
    .badge--active { background: #dcfce7; color: #15803d; }
    .badge--inactive { background: #f1f5f9; color: #94a3b8; }
    .user-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }

    .stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { background: white; border-radius: 12px; padding: 1.25rem; text-align: center; box-shadow: 0 1px 6px rgba(0,0,0,0.06); }
    .stat-value { display: block; font-size: 1.5rem; font-weight: 800; color: #0f172a; }
    .stat-label { display: block; font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem; text-transform: uppercase; letter-spacing: 0.04em; }
    .monospace { font-family: monospace; font-size: 1rem !important; }

    .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 6px rgba(0,0,0,0.06); }
    .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
    .card-header h3 { margin: 0; font-size: 0.9rem; font-weight: 700; color: #0f172a; }
    .card-count { font-size: 0.78rem; color: #64748b; background: #f1f5f9; padding: 0.2rem 0.6rem; border-radius: 20px; }
    .card-title-simple { margin: 0 0 1rem; font-size: 0.9rem; font-weight: 700; color: #0f172a; }

    .contacts-list { display: flex; flex-direction: column; gap: 0.625rem; max-height: 340px; overflow-y: auto; }
    .contact-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem; border-radius: 8px; transition: background 0.1s; }
    .contact-row:hover { background: #f8fafc; }
    .contact-avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.72rem; font-weight: 700; flex-shrink: 0; }
    .contact-info { flex: 1; min-width: 0; }
    .contact-info strong { display: block; font-size: 0.85rem; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .contact-info span { font-size: 0.75rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
    .contact-meta { display: flex; align-items: center; gap: 0.375rem; }
    .star { font-size: 0.75rem; }
    .source-tag { font-size: 0.65rem; background: #f1f5f9; color: #64748b; padding: 1px 5px; border-radius: 4px; }
    .contact-date { font-size: 0.75rem; color: #94a3b8; flex-shrink: 0; }

    .activity-list { display: flex; flex-direction: column; gap: 0.5rem; max-height: 340px; overflow-y: auto; }
    .activity-row { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.625rem; border-radius: 8px; background: #f8fafc; }
    .activity-icon { font-size: 1rem; flex-shrink: 0; }
    .activity-body { flex: 1; min-width: 0; }
    .activity-desc { display: block; font-size: 0.82rem; color: #374151; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .activity-time { font-size: 0.72rem; color: #94a3b8; }
    .action-badge { font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; flex-shrink: 0; }
    .action-badge--created { background: #dcfce7; color: #15803d; }
    .action-badge--updated { background: #dbeafe; color: #1d4ed8; }
    .action-badge--deleted { background: #fee2e2; color: #dc2626; }
    .action-badge--imported { background: #fef3c7; color: #92400e; }
    .action-badge--exported { background: #ede9fe; color: #6d28d9; }
    .action-badge--favorited { background: #fef9c3; color: #a16207; }

    .empty { color: #94a3b8; font-size: 0.85rem; font-style: italic; margin: 1rem 0 0; }

    .btn { padding: 0.6rem 1.1rem; border-radius: 8px; border: none; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; }
    .btn--primary { background: #1d4ed8; color: white; }
    .btn--primary:hover { background: #1e40af; }
    .btn--outline { background: white; color: #374151; border: 1.5px solid #e2e8f0; }
    .btn--outline:hover { border-color: #1d4ed8; color: #1d4ed8; }

    .loading { display: flex; justify-content: center; padding: 5rem; }
    .spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #1d4ed8; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 900px) { .stats-row { grid-template-columns: repeat(2,1fr); } .bottom-grid { grid-template-columns: 1fr; } }
    @media (max-width: 600px) { .stats-row { grid-template-columns: 1fr 1fr; } .user-header { flex-direction: column; text-align: center; } .user-badges, .user-actions { justify-content: center; } }
  `]
})
export class AdminUserDetailComponent implements OnInit {
  data: any = null;

  constructor(private route: ActivatedRoute, private adminService: AdminService, private toast: ToastService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.adminService.getUser(id).subscribe({
      next: (r) => this.data = r.data,
      error: () => this.toast.error('Utilisateur introuvable')
    });
  }

  toggleStatus(): void {
    this.adminService.toggleUserStatus(this.data.user._id).subscribe({
      next: (r) => {
        this.data.user.isActive = r.data.isActive;
        this.toast.info(this.data.user.isActive ? 'Utilisateur activé' : 'Utilisateur désactivé');
      },
      error: (err) => this.toast.error(err.error?.message || 'Erreur')
    });
  }

  avatarColor(c: any): string {
    const colors = ['#4f46e5','#7c3aed','#db2777','#dc2626','#d97706','#059669','#2563eb','#0891b2'];
    return colors[(c.firstName?.charCodeAt(0) || 0) % colors.length];
  }

  actionIcon(a: string): string {
    return { created: '➕', updated: '✏️', deleted: '🗑', imported: '📥', exported: '📤', favorited: '⭐', unfavorited: '☆' }[a] || '•';
  }
}
