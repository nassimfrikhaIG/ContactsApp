import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page" *ngIf="data; else loading">
      <div class="page-header">
        <h1>Vue d'ensemble</h1>
        <p>Statistiques globales de la plateforme ContactHub</p>
      </div>

      <!-- KPI Row -->
      <div class="kpi-row">
        <div class="kpi kpi--blue">
          <div class="kpi-left">
            <span class="kpi-label">Utilisateurs total</span>
            <span class="kpi-value">{{ data.overview.totalUsers }}</span>
            <span class="kpi-sub">+{{ data.overview.newUsersThisMonth }} ce mois</span>
          </div>
          <span class="kpi-icon">&#128101;</span>
        </div>
        <div class="kpi kpi--green">
          <div class="kpi-left">
            <span class="kpi-label">Utilisateurs actifs</span>
            <span class="kpi-value">{{ data.overview.activeUsers }}</span>
            <span class="kpi-sub">{{ data.overview.inactiveUsers }} inactifs</span>
          </div>
          <span class="kpi-icon">&#9989;</span>
        </div>
        <div class="kpi kpi--purple">
          <div class="kpi-left">
            <span class="kpi-label">Contacts total</span>
            <span class="kpi-value">{{ data.overview.totalContacts }}</span>
            <span class="kpi-sub">+{{ data.overview.newContactsThisMonth }} ce mois</span>
          </div>
          <span class="kpi-icon">&#128196;</span>
        </div>
        <div class="kpi kpi--orange">
          <div class="kpi-left">
            <span class="kpi-label">Administrateurs</span>
            <span class="kpi-value">{{ data.overview.adminUsers }}</span>
            <span class="kpi-sub">Comptes privilégiés</span>
          </div>
          <span class="kpi-icon">&#9881;</span>
        </div>
      </div>

      <!-- Charts row -->
      <div class="charts-row">
        <!-- Contacts by source -->
        <div class="card">
          <h3 class="card-title">Contacts par source</h3>
          <div class="source-list">
            <div *ngFor="let s of data.contactsBySource" class="source-row">
              <div class="source-dot" [style.background]="sourceColor(s._id)"></div>
              <span class="source-name">{{ sourceLabel(s._id) }}</span>
              <div class="source-bar-wrap">
                <div class="source-bar" [style.width.%]="sourcePct(s.count)" [style.background]="sourceColor(s._id)"></div>
              </div>
              <span class="source-count">{{ s.count }}</span>
            </div>
          </div>
        </div>

        <!-- Top users -->
        <div class="card">
          <h3 class="card-title">Top utilisateurs <span class="card-sub">(par nb de contacts)</span></h3>
          <div class="top-users">
            <div *ngFor="let u of data.topUsers; let i=index" class="top-user">
              <span class="rank rank--{{ i+1 }}">{{ i+1 }}</span>
              <div class="top-user-avatar">{{ u.user.name[0].toUpperCase() }}</div>
              <div class="top-user-info">
                <strong>{{ u.user.name }}</strong>
                <span>{{ u.user.email }}</span>
              </div>
              <div class="top-user-bar-wrap">
                <div class="top-user-bar" [style.width.%]="(u.count / data.topUsers[0].count)*100"></div>
              </div>
              <span class="top-user-count">{{ u.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Growth + Activity -->
      <div class="bottom-row">
        <!-- User growth -->
        <div class="card">
          <h3 class="card-title">Croissance — 6 derniers mois</h3>
          <div class="growth-chart">
            <div class="growth-bars">
              <div *ngFor="let m of mergeGrowth()" class="growth-col">
                <div class="growth-bar-wrap">
                  <div class="growth-bar growth-bar--users" [style.height.%]="barPct(m.users, maxGrowth())"
                    [title]="m.users + ' nouveaux utilisateurs'"></div>
                  <div class="growth-bar growth-bar--contacts" [style.height.%]="barPct(m.contacts, maxGrowth())"
                    [title]="m.contacts + ' nouveaux contacts'"></div>
                </div>
                <span class="growth-label">{{ m.month }}</span>
              </div>
            </div>
            <div class="growth-legend">
              <span class="legend-item"><span class="legend-dot" style="background:#1d4ed8"></span> Utilisateurs</span>
              <span class="legend-item"><span class="legend-dot" style="background:#10b981"></span> Contacts</span>
            </div>
          </div>
        </div>

        <!-- Recent activity -->
        <div class="card card--wide">
          <div class="card-header-row">
            <h3 class="card-title">Activité récente</h3>
            <a routerLink="/admin/users" class="card-link">Voir tout →</a>
          </div>
          <div class="activity-list">
            <div *ngFor="let a of data.recentActivity" class="activity-row">
              <span class="activity-icon">{{ actionIcon(a.action) }}</span>
              <div class="activity-body">
                <span class="activity-user">{{ a.user?.name || 'Utilisateur inconnu' }}</span>
                <span class="activity-desc">{{ a.description }}</span>
              </div>
              <span class="activity-time">{{ a.createdAt | date:'dd/MM HH:mm' }}</span>
            </div>
            <p *ngIf="!data.recentActivity.length" class="empty">Aucune activité récente</p>
          </div>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="quick-actions">
        <a routerLink="/admin/users" class="quick-btn quick-btn--blue">
          <span>&#128101;</span> Gérer les utilisateurs
        </a>
        <a routerLink="/admin/users" [queryParams]="{action:'new'}" class="quick-btn quick-btn--green">
          <span>&#43;</span> Créer un utilisateur
        </a>
        <a routerLink="/admin/contacts" class="quick-btn quick-btn--purple">
          <span>&#128196;</span> Voir tous les contacts
        </a>
        <a routerLink="/contacts" class="quick-btn quick-btn--gray">
          <span>&#8592;</span> Mon espace contacts
        </a>
      </div>
    </div>

    <ng-template #loading>
      <div class="loading"><div class="spinner"></div></div>
    </ng-template>
  `,
  styles: [`
    .page-header { margin-bottom: 1.75rem; }
    .page-header h1 { font-size: 1.6rem; font-weight: 800; color: #0f172a; margin: 0 0 0.25rem; }
    .page-header p { color: #64748b; margin: 0; font-size: 0.9rem; }

    .kpi-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .kpi {
      background: white; border-radius: 12px; padding: 1.25rem 1.5rem;
      display: flex; align-items: center; justify-content: space-between;
      border-left: 4px solid; box-shadow: 0 1px 6px rgba(0,0,0,0.06);
    }
    .kpi--blue { border-left-color: #1d4ed8; }
    .kpi--green { border-left-color: #10b981; }
    .kpi--purple { border-left-color: #7c3aed; }
    .kpi--orange { border-left-color: #f59e0b; }
    .kpi-left { display: flex; flex-direction: column; gap: 0.2rem; }
    .kpi-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; }
    .kpi-value { font-size: 2rem; font-weight: 900; color: #0f172a; line-height: 1; }
    .kpi-sub { font-size: 0.75rem; color: #94a3b8; }
    .kpi-icon { font-size: 2rem; opacity: 0.3; }

    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
    .bottom-row { display: grid; grid-template-columns: 1fr 1.4fr; gap: 1rem; margin-bottom: 1.5rem; }
    .card {
      background: white; border-radius: 12px; padding: 1.5rem;
      box-shadow: 0 1px 6px rgba(0,0,0,0.06);
    }
    .card-title { margin: 0 0 1.25rem; font-size: 0.9rem; font-weight: 700; color: #0f172a; }
    .card-sub { font-size: 0.75rem; color: #94a3b8; font-weight: 400; }
    .card-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
    .card-link { font-size: 0.8rem; color: #1d4ed8; text-decoration: none; font-weight: 600; }

    /* Source bars */
    .source-list { display: flex; flex-direction: column; gap: 1rem; }
    .source-row { display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; }
    .source-dot { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
    .source-name { min-width: 130px; color: #374151; font-weight: 500; }
    .source-bar-wrap { flex: 1; background: #f1f5f9; border-radius: 4px; height: 8px; }
    .source-bar { height: 100%; border-radius: 4px; transition: width 0.6s; }
    .source-count { font-weight: 700; color: #0f172a; min-width: 30px; text-align: right; }

    /* Top users */
    .top-users { display: flex; flex-direction: column; gap: 0.875rem; }
    .top-user { display: flex; align-items: center; gap: 0.75rem; }
    .rank {
      width: 22px; height: 22px; border-radius: 6px; background: #f1f5f9;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 800; flex-shrink: 0; color: #64748b;
    }
    .rank--1 { background: #fef3c7; color: #92400e; }
    .rank--2 { background: #f1f5f9; color: #475569; }
    .rank--3 { background: #fdf2f8; color: #831843; }
    .top-user-avatar {
      width: 30px; height: 30px; border-radius: 50%; background: #1d4ed8;
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
    }
    .top-user-info { flex: 0 0 140px; min-width: 0; }
    .top-user-info strong { display: block; font-size: 0.82rem; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .top-user-info span { font-size: 0.72rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
    .top-user-bar-wrap { flex: 1; background: #f1f5f9; border-radius: 4px; height: 6px; }
    .top-user-bar { height: 100%; background: #1d4ed8; border-radius: 4px; transition: width 0.6s; }
    .top-user-count { font-weight: 700; color: #0f172a; min-width: 25px; text-align: right; font-size: 0.85rem; }

    /* Growth chart */
    .growth-chart { }
    .growth-bars { display: flex; align-items: flex-end; gap: 0.5rem; height: 120px; margin-bottom: 0.5rem; }
    .growth-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.25rem; height: 100%; justify-content: flex-end; }
    .growth-bar-wrap { display: flex; gap: 2px; align-items: flex-end; width: 100%; justify-content: center; }
    .growth-bar { width: 10px; border-radius: 3px 3px 0 0; min-height: 2px; transition: height 0.6s; }
    .growth-bar--users { background: #1d4ed8; }
    .growth-bar--contacts { background: #10b981; }
    .growth-label { font-size: 0.65rem; color: #94a3b8; white-space: nowrap; }
    .growth-legend { display: flex; gap: 1rem; margin-top: 0.75rem; }
    .legend-item { display: flex; align-items: center; gap: 0.375rem; font-size: 0.78rem; color: #374151; }
    .legend-dot { width: 10px; height: 10px; border-radius: 2px; }

    /* Activity */
    .activity-list { display: flex; flex-direction: column; gap: 0.75rem; max-height: 250px; overflow-y: auto; }
    .activity-row { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.625rem; background: #f8fafc; border-radius: 8px; }
    .activity-icon { font-size: 1rem; flex-shrink: 0; }
    .activity-body { flex: 1; min-width: 0; }
    .activity-user { display: block; font-size: 0.82rem; font-weight: 700; color: #0f172a; }
    .activity-desc { display: block; font-size: 0.78rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .activity-time { font-size: 0.72rem; color: #94a3b8; white-space: nowrap; flex-shrink: 0; }
    .empty { color: #94a3b8; font-size: 0.85rem; font-style: italic; margin: 0; }

    /* Quick actions */
    .quick-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .quick-btn {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.75rem 1.25rem; border-radius: 10px; text-decoration: none;
      font-size: 0.875rem; font-weight: 600; transition: all 0.15s;
    }
    .quick-btn--blue { background: #1d4ed8; color: white; }
    .quick-btn--blue:hover { background: #1e40af; transform: translateY(-1px); }
    .quick-btn--green { background: #10b981; color: white; }
    .quick-btn--green:hover { background: #059669; transform: translateY(-1px); }
    .quick-btn--purple { background: #7c3aed; color: white; }
    .quick-btn--purple:hover { background: #6d28d9; transform: translateY(-1px); }
    .quick-btn--gray { background: white; color: #374151; border: 1.5px solid #e2e8f0; }
    .quick-btn--gray:hover { border-color: #94a3b8; transform: translateY(-1px); }

    .loading { display: flex; justify-content: center; padding: 5rem; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #1d4ed8; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 1200px) { .kpi-row { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 900px) { .charts-row, .bottom-row { grid-template-columns: 1fr; } }
  `]
})
export class AdminDashboardComponent implements OnInit {
  data: any = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getStats().subscribe({ next: (r) => this.data = r.data });
  }

  sourceLabel(s: string): string {
    return { manual: 'Saisi manuellement', import: 'Importé CSV', api: 'Via API' }[s] || s;
  }
  sourceColor(s: string): string {
    return { manual: '#1d4ed8', import: '#10b981', api: '#7c3aed' }[s] || '#94a3b8';
  }
  sourcePct(count: number): number {
    const max = Math.max(...(this.data?.contactsBySource || []).map((s: any) => s.count), 1);
    return (count / max) * 100;
  }
  actionIcon(a: string): string {
    return { created: '➕', updated: '✏️', deleted: '🗑', imported: '📥', exported: '📤', favorited: '⭐', unfavorited: '☆' }[a] || '•';
  }
  mergeGrowth(): any[] {
    const months = new Set([
      ...(this.data?.userGrowth || []).map((m: any) => m._id),
      ...(this.data?.contactGrowth || []).map((m: any) => m._id)
    ]);
    return [...months].sort().map(m => ({
      month: m.slice(5), // MM
      users: (this.data?.userGrowth || []).find((x: any) => x._id === m)?.count || 0,
      contacts: (this.data?.contactGrowth || []).find((x: any) => x._id === m)?.count || 0
    }));
  }
  maxGrowth(): number {
    return Math.max(...this.mergeGrowth().flatMap(m => [m.users, m.contacts]), 1);
  }
  barPct(val: number, max: number): number { return (val / max) * 100; }
}
