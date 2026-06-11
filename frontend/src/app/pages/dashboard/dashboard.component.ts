import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContactService } from '../../services/contact.service';
import { NavbarComponent } from '../../components/shared/navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="dashboard">
      <div class="dashboard__header">
        <h1>Tableau de bord</h1>
        <p>Vue d'ensemble de votre carnet de contacts</p>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid" *ngIf="stats">
        <div class="kpi-card kpi-card--blue">
          <div class="kpi-icon">👥</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ stats.total }}</span>
            <span class="kpi-label">Total contacts</span>
          </div>
        </div>
        <div class="kpi-card kpi-card--yellow">
          <div class="kpi-icon">⭐</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ stats.favorites }}</span>
            <span class="kpi-label">Favoris</span>
          </div>
        </div>
        <div class="kpi-card kpi-card--green">
          <div class="kpi-icon">📧</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ stats.withEmail }}</span>
            <span class="kpi-label">Avec email</span>
          </div>
        </div>
        <div class="kpi-card kpi-card--purple">
          <div class="kpi-icon">📞</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ stats.withPhone }}</span>
            <span class="kpi-label">Avec téléphone</span>
          </div>
        </div>
      </div>

      <div class="dashboard__grid" *ngIf="stats">
        <!-- Source chart -->
        <div class="chart-card">
          <h3>Sources des contacts</h3>
          <div class="source-bars">
            <div *ngFor="let s of bySource" class="source-bar">
              <div class="source-bar__label">
                <span>{{ getSourceLabel(s._id) }}</span>
                <span>{{ s.count }}</span>
              </div>
              <div class="source-bar__track">
                <div class="source-bar__fill"
                  [style.width.%]="(s.count / stats.total) * 100"
                  [style.background]="getSourceColor(s._id)">
                </div>
              </div>
            </div>
          </div>

          <!-- Donut chart (CSS) -->
          <div class="donut-wrapper">
            <div class="donut" [style]="getDonutGradient()">
              <div class="donut__hole">
                <strong>{{ stats.total }}</strong>
                <span>contacts</span>
              </div>
            </div>
            <div class="donut-legend">
              <div *ngFor="let s of bySource" class="legend-item">
                <span class="legend-dot" [style.background]="getSourceColor(s._id)"></span>
                <span>{{ getSourceLabel(s._id) }}</span>
                <span class="legend-pct">{{ ((s.count/stats.total)*100).toFixed(0) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Top companies -->
        <div class="chart-card">
          <h3>Principales entreprises</h3>
          <div class="companies-list" *ngIf="topCompanies.length; else noCompanies">
            <div *ngFor="let c of topCompanies; let i = index" class="company-row">
              <span class="company-rank">{{ i + 1 }}</span>
              <span class="company-name">{{ c._id }}</span>
              <div class="company-bar-wrapper">
                <div class="company-bar"
                  [style.width.%]="(c.count / topCompanies[0].count) * 100">
                </div>
              </div>
              <span class="company-count">{{ c.count }}</span>
            </div>
          </div>
          <ng-template #noCompanies>
            <p class="empty-msg">Aucune entreprise renseignée</p>
          </ng-template>
        </div>

        <!-- Completeness -->
        <div class="chart-card">
          <h3>Complétude des données</h3>
          <div class="completeness-items">
            <div class="comp-item">
              <div class="comp-header">
                <span>Email</span>
                <span>{{ getCompleteness(stats.withEmail) }}%</span>
              </div>
              <div class="comp-track">
                <div class="comp-fill comp-fill--green" [style.width]="getCompleteness(stats.withEmail) + '%'"></div>
              </div>
            </div>
            <div class="comp-item">
              <div class="comp-header">
                <span>Téléphone</span>
                <span>{{ getCompleteness(stats.withPhone) }}%</span>
              </div>
              <div class="comp-track">
                <div class="comp-fill comp-fill--blue" [style.width]="getCompleteness(stats.withPhone) + '%'"></div>
              </div>
            </div>
            <div class="comp-item">
              <div class="comp-header">
                <span>Favoris</span>
                <span>{{ getCompleteness(stats.favorites) }}%</span>
              </div>
              <div class="comp-track">
                <div class="comp-fill comp-fill--yellow" [style.width]="getCompleteness(stats.favorites) + '%'"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent activity -->
        <div class="chart-card activity-card">
          <h3>Activité récente</h3>
          <div class="activity-list" *ngIf="recentActivity.length; else noActivity">
            <div *ngFor="let a of recentActivity" class="activity-item">
              <span class="activity-icon">{{ getActivityIcon(a.action) }}</span>
              <div class="activity-info">
                <p>{{ a.description }}</p>
                <span>{{ a.createdAt | date:'dd/MM/yyyy à HH:mm' }}</span>
              </div>
            </div>
          </div>
          <ng-template #noActivity>
            <p class="empty-msg">Aucune activité récente</p>
          </ng-template>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="quick-actions">
        <h3>Actions rapides</h3>
        <div class="actions-grid">
          <a routerLink="/contacts" class="action-card">
            <span>👥</span>
            <strong>Voir les contacts</strong>
            <p>Gérer tous vos contacts</p>
          </a>
          <a routerLink="/contacts" [queryParams]="{action:'new'}" class="action-card">
            <span>➕</span>
            <strong>Nouveau contact</strong>
            <p>Ajouter manuellement</p>
          </a>
          <a routerLink="/contacts" [queryParams]="{view:'favorites'}" class="action-card">
            <span>⭐</span>
            <strong>Mes favoris</strong>
            <p>Contacts prioritaires</p>
          </a>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="!stats">
        <div class="spinner"></div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding-top: 64px; min-height: 100vh; background: #f8fafc; }
    .dashboard__header {
      padding: 2rem 2rem 1rem; background: linear-gradient(135deg, #1e3a5f, #2d6a9f);
      color: white;
    }
    .dashboard__header h1 { margin: 0 0 0.375rem; font-size: 1.75rem; font-weight: 800; }
    .dashboard__header p { margin: 0; opacity: 0.8; }

    .kpi-grid {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 1rem; padding: 1.5rem 2rem;
    }
    .kpi-card {
      background: white; border-radius: 12px; padding: 1.5rem;
      display: flex; align-items: center; gap: 1rem;
      border: 1.5px solid #e2e8f0; border-left-width: 4px;
    }
    .kpi-card--blue { border-left-color: #2563eb; }
    .kpi-card--yellow { border-left-color: #d97706; }
    .kpi-card--green { border-left-color: #059669; }
    .kpi-card--purple { border-left-color: #7c3aed; }
    .kpi-icon { font-size: 1.75rem; }
    .kpi-info { display: flex; flex-direction: column; }
    .kpi-value { font-size: 2rem; font-weight: 800; color: #1e293b; line-height: 1; }
    .kpi-label { font-size: 0.8rem; color: #64748b; margin-top: 0.25rem; }

    .dashboard__grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 1rem; padding: 0 2rem 1.5rem;
    }
    .chart-card {
      background: white; border-radius: 12px; padding: 1.5rem;
      border: 1.5px solid #e2e8f0;
    }
    .chart-card h3 { margin: 0 0 1.25rem; font-size: 0.9rem; font-weight: 700; color: #1e293b; }

    /* Source bars */
    .source-bars { display: flex; flex-direction: column; gap: 0.875rem; margin-bottom: 1.5rem; }
    .source-bar__label { display: flex; justify-content: space-between; font-size: 0.8rem; color: #374151; margin-bottom: 0.375rem; font-weight: 500; }
    .source-bar__track { background: #f1f5f9; border-radius: 4px; height: 8px; }
    .source-bar__fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }

    /* Donut */
    .donut-wrapper { display: flex; align-items: center; gap: 1.5rem; }
    .donut {
      width: 100px; height: 100px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; position: relative;
    }
    .donut__hole {
      width: 64px; height: 64px; background: white; border-radius: 50%;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .donut__hole strong { font-size: 1.1rem; font-weight: 800; color: #1e293b; line-height: 1; }
    .donut__hole span { font-size: 0.6rem; color: #94a3b8; }
    .donut-legend { display: flex; flex-direction: column; gap: 0.5rem; }
    .legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; }
    .legend-dot { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
    .legend-pct { margin-left: auto; font-weight: 600; color: #64748b; }

    /* Companies */
    .companies-list { display: flex; flex-direction: column; gap: 0.875rem; }
    .company-row { display: flex; align-items: center; gap: 0.75rem; font-size: 0.8rem; }
    .company-rank {
      width: 20px; height: 20px; background: #f1f5f9; border-radius: 4px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 700; color: #64748b; flex-shrink: 0;
    }
    .company-name { flex: 1; font-weight: 500; color: #374151; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .company-bar-wrapper { width: 80px; background: #f1f5f9; border-radius: 4px; height: 6px; flex-shrink: 0; }
    .company-bar { height: 100%; background: #2d6a9f; border-radius: 4px; transition: width 0.6s; }
    .company-count { font-weight: 700; color: #1e293b; flex-shrink: 0; }

    /* Completeness */
    .completeness-items { display: flex; flex-direction: column; gap: 1rem; }
    .comp-header { display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 500; margin-bottom: 0.375rem; color: #374151; }
    .comp-track { background: #f1f5f9; border-radius: 8px; height: 10px; }
    .comp-fill { height: 100%; border-radius: 8px; transition: width 0.8s ease; }
    .comp-fill--green { background: #10b981; }
    .comp-fill--blue { background: #2563eb; }
    .comp-fill--yellow { background: #f59e0b; }

    /* Activity */
    .activity-card { grid-column: span 2; }
    .activity-list { display: flex; flex-direction: column; gap: 0.75rem; max-height: 280px; overflow-y: auto; }
    .activity-item { display: flex; align-items: flex-start; gap: 0.875rem; padding: 0.75rem; background: #f8fafc; border-radius: 8px; }
    .activity-icon { font-size: 1.1rem; flex-shrink: 0; }
    .activity-info p { margin: 0 0 0.2rem; font-size: 0.85rem; color: #374151; font-weight: 500; }
    .activity-info span { font-size: 0.75rem; color: #94a3b8; }
    .empty-msg { color: #94a3b8; font-size: 0.875rem; font-style: italic; margin: 0; }

    /* Quick actions */
    .quick-actions { padding: 0 2rem 2rem; }
    .quick-actions h3 { font-size: 0.9rem; font-weight: 700; color: #1e293b; margin: 0 0 1rem; }
    .actions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .action-card {
      background: white; border-radius: 12px; padding: 1.5rem;
      border: 1.5px solid #e2e8f0; text-decoration: none; color: inherit;
      transition: all 0.15s; cursor: pointer; display: block;
    }
    .action-card:hover { border-color: #2d6a9f; transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .action-card span { font-size: 2rem; display: block; margin-bottom: 0.75rem; }
    .action-card strong { display: block; font-size: 0.9rem; color: #1e293b; margin-bottom: 0.25rem; }
    .action-card p { margin: 0; font-size: 0.8rem; color: #64748b; }

    .loading { display: flex; justify-content: center; padding: 4rem; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #2d6a9f; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 1024px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .dashboard__grid { grid-template-columns: 1fr; }
      .activity-card { grid-column: span 1; }
      .actions-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 600px) {
      .kpi-grid { grid-template-columns: 1fr 1fr; gap: 0.75rem; padding: 1rem; }
      .dashboard__grid, .quick-actions { padding: 0 1rem 1rem; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  bySource: any[] = [];
  topCompanies: any[] = [];
  recentActivity: any[] = [];

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.contactService.getStats().subscribe({
      next: (res) => {
        this.stats = res.data.stats;
        this.bySource = res.data.bySource;
        this.topCompanies = res.data.topCompanies;
        this.recentActivity = res.data.recentActivity;
      }
    });
  }

  getCompleteness(value: number): number {
    if (!this.stats?.total) return 0;
    return Math.round((value / this.stats.total) * 100);
  }

  getSourceLabel(s: string): string {
    const labels: Record<string, string> = { manual: 'Saisi manuellement', import: 'Importé CSV', api: 'Via API' };
    return labels[s] || s;
  }

  getSourceColor(s: string): string {
    const colors: Record<string, string> = { manual: '#2d6a9f', import: '#10b981', api: '#7c3aed' };
    return colors[s] || '#94a3b8';
  }

  getActivityIcon(action: string): string {
    const icons: Record<string, string> = {
      created: '➕', updated: '✏️', deleted: '🗑', imported: '📥',
      exported: '📤', favorited: '⭐', unfavorited: '☆'
    };
    return icons[action] || '•';
  }

  getDonutGradient(): string {
    if (!this.stats || !this.bySource.length) return '';
    const total = this.stats.total;
    const colors = ['#2d6a9f', '#10b981', '#7c3aed'];
    let parts: string[] = [];
    let angle = 0;
    this.bySource.forEach((s, i) => {
      const pct = (s.count / total) * 360;
      parts.push(`${colors[i % colors.length]} ${angle}deg ${angle + pct}deg`);
      angle += pct;
    });
    return `background: conic-gradient(${parts.join(', ')})`;
  }
}
