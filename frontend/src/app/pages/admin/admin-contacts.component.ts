import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Tous les contacts</h1>
          <p>{{ pagination?.total || 0 }} contacts sur la plateforme</p>
        </div>
        <button class="btn btn--outline" (click)="exportAll()">&#128196; Exporter</button>
      </div>

      <!-- Filters -->
      <div class="filters">
        <div class="search-box">
          <span>&#128269;</span>
          <input type="text" [(ngModel)]="search" (ngModelChange)="onSearch($event)"
            placeholder="Rechercher un contact..." class="search-input">
          <button *ngIf="search" (click)="search=''; load()" class="clear-btn">&#10005;</button>
        </div>
        <select [(ngModel)]="filterUser" (ngModelChange)="load()" class="select">
          <option value="">Tous les utilisateurs</option>
          <option *ngFor="let u of userList" [value]="u._id">{{ u.name }}</option>
        </select>
      </div>

      <!-- Table -->
      <div class="table-card" *ngIf="!loading; else loadingTpl">
        <table class="table">
          <thead>
            <tr>
              <th>Contact</th>
              <th>Propriétaire</th>
              <th>Email</th>
              <th>Entreprise</th>
              <th>Tags</th>
              <th>Source</th>
              <th>Favori</th>
              <th>Créé le</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of contacts">
              <td>
                <div class="contact-cell">
                  <div class="contact-avatar" [style.background]="avatarColor(c)">
                    {{ c.firstName[0] }}{{ c.lastName[0] }}
                  </div>
                  <div>
                    <strong>{{ c.firstName }} {{ c.lastName }}</strong>
                    <span class="sub">{{ c.phone || c.mobile || '' }}</span>
                  </div>
                </div>
              </td>
              <td>
                <div class="owner-cell">
                  <div class="owner-avatar">{{ c.owner?.name?.[0]?.toUpperCase() || '?' }}</div>
                  <div>
                    <span class="owner-name">{{ c.owner?.name || '—' }}</span>
                    <span class="sub">{{ c.owner?.email || '' }}</span>
                  </div>
                </div>
              </td>
              <td class="small-text">{{ c.email || '—' }}</td>
              <td class="small-text">{{ c.company || '—' }}</td>
              <td>
                <div class="tags-wrap">
                  <span *ngFor="let t of (c.tags||[]).slice(0,2)" class="tag">{{ t }}</span>
                  <span *ngIf="(c.tags||[]).length > 2" class="tag tag--more">+{{ c.tags.length - 2 }}</span>
                </div>
              </td>
              <td>
                <span class="source-badge source-badge--{{ c.source }}">{{ c.source }}</span>
              </td>
              <td class="center">{{ c.isFavorite ? '&#11088;' : '—' }}</td>
              <td class="small-text">{{ c.createdAt | date:'dd/MM/yyyy' }}</td>
            </tr>
            <tr *ngIf="contacts.length === 0">
              <td colspan="8" class="empty-row">Aucun contact trouvé</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pagination" *ngIf="pagination && pagination.pages > 1">
          <button class="page-btn" [disabled]="pagination.page===1" (click)="changePage(pagination.page-1)">&#8249;</button>
          <button *ngFor="let p of pages()" class="page-btn" [class.active]="p===pagination.page" (click)="changePage(p)">{{ p }}</button>
          <button class="page-btn" [disabled]="pagination.page===pagination.pages" (click)="changePage(pagination.page+1)">&#8250;</button>
        </div>
      </div>

      <ng-template #loadingTpl>
        <div class="loading"><div class="spinner"></div></div>
      </ng-template>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0 0 0.25rem; }
    .page-header p { color: #64748b; margin: 0; font-size: 0.875rem; }

    .filters { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 220px; display: flex; align-items: center; gap: 0.5rem; background: white; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 0 0.875rem; }
    .search-box span { color: #94a3b8; }
    .search-input { flex: 1; border: none; outline: none; font-size: 0.875rem; padding: 0.625rem 0; background: transparent; }
    .clear-btn { background: none; border: none; cursor: pointer; color: #94a3b8; }
    .select { padding: 0.625rem 0.875rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.875rem; background: white; outline: none; cursor: pointer; color: #374151; }

    .table-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 6px rgba(0,0,0,0.06); }
    .table { width: 100%; border-collapse: collapse; }
    .table th { padding: 0.875rem 1rem; background: #f8fafc; text-align: left; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
    .table td { padding: 0.75rem 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.875rem; vertical-align: middle; }
    .table tr:last-child td { border-bottom: none; }
    .table tr:hover td { background: #f8fafc; }
    .center { text-align: center; }

    .contact-cell { display: flex; align-items: center; gap: 0.75rem; }
    .contact-avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.72rem; font-weight: 700; flex-shrink: 0; }
    .contact-cell strong { display: block; font-size: 0.85rem; color: #0f172a; }
    .sub { font-size: 0.72rem; color: #94a3b8; display: block; }

    .owner-cell { display: flex; align-items: center; gap: 0.5rem; }
    .owner-avatar { width: 26px; height: 26px; border-radius: 50%; background: #7c3aed; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; flex-shrink: 0; }
    .owner-name { display: block; font-size: 0.8rem; font-weight: 600; color: #374151; white-space: nowrap; }
    .small-text { font-size: 0.8rem; color: #64748b; }

    .tags-wrap { display: flex; gap: 0.25rem; flex-wrap: wrap; }
    .tag { font-size: 0.68rem; background: #f1f5f9; color: #64748b; padding: 1px 6px; border-radius: 4px; font-weight: 500; }
    .tag--more { background: #e2e8f0; color: #94a3b8; }

    .source-badge { font-size: 0.68rem; font-weight: 700; padding: 2px 7px; border-radius: 4px; text-transform: uppercase; }
    .source-badge--manual { background: #dbeafe; color: #1d4ed8; }
    .source-badge--import { background: #dcfce7; color: #15803d; }
    .source-badge--api { background: #ede9fe; color: #6d28d9; }

    .empty-row { text-align: center; color: #94a3b8; padding: 3rem !important; font-style: italic; }
    .pagination { display: flex; justify-content: center; gap: 0.375rem; padding: 1rem; border-top: 1px solid #f1f5f9; }
    .page-btn { width: 34px; height: 34px; border-radius: 7px; border: 1.5px solid #e2e8f0; background: white; cursor: pointer; font-size: 0.85rem; transition: all 0.1s; }
    .page-btn:hover:not(:disabled) { border-color: #1d4ed8; color: #1d4ed8; }
    .page-btn.active { background: #1d4ed8; color: white; border-color: #1d4ed8; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .btn { padding: 0.6rem 1.1rem; border-radius: 8px; border: none; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 0.5rem; }
    .btn--outline { background: white; color: #374151; border: 1.5px solid #e2e8f0; }
    .btn--outline:hover { border-color: #1d4ed8; color: #1d4ed8; }

    .loading { display: flex; justify-content: center; padding: 4rem; }
    .spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #1d4ed8; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AdminContactsComponent implements OnInit {
  contacts: any[] = [];
  pagination: any = null;
  loading = false;
  search = '';
  filterUser = '';
  currentPage = 1;
  userList: any[] = [];

  private searchSubject = new Subject<string>();

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit(): void {
    this.load();
    this.loadUsers();
    this.searchSubject.pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => { this.currentPage = 1; this.load(); });
  }

  load(): void {
    this.loading = true;
    this.adminService.getAllContacts({ search: this.search, page: this.currentPage, limit: 20, userId: this.filterUser }).subscribe({
      next: (r) => { this.contacts = r.data.contacts; this.pagination = r.data.pagination; this.loading = false; },
      error: () => { this.loading = false; this.toast.error('Erreur de chargement'); }
    });
  }

  loadUsers(): void {
    this.adminService.getUsers({ limit: 100 }).subscribe({
      next: (r) => this.userList = r.data.users
    });
  }

  onSearch(v: string): void { this.searchSubject.next(v); }
  changePage(p: number): void { this.currentPage = p; this.load(); }
  pages(): number[] { return Array.from({ length: this.pagination?.pages || 0 }, (_, i) => i + 1); }

  exportAll(): void {
    // Build CSV client-side from loaded data
    const headers = ['Prénom','Nom','Email','Téléphone','Entreprise','Poste','Tags','Propriétaire'];
    const rows = this.contacts.map(c => [
      c.firstName, c.lastName, c.email||'', c.phone||c.mobile||'',
      c.company||'', c.jobTitle||'', (c.tags||[]).join(';'), c.owner?.name||''
    ]);
    const csv = [headers, ...rows].map(r => r.map((v: string) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'all_contacts_admin.csv'; a.click();
    URL.revokeObjectURL(url);
    this.toast.success('Export téléchargé !');
  }

  avatarColor(c: any): string {
    const colors = ['#4f46e5','#7c3aed','#db2777','#dc2626','#d97706','#059669','#2563eb','#0891b2'];
    return colors[(c.firstName?.charCodeAt(0) || 0) % colors.length];
  }
}
