import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Gestion des utilisateurs</h1>
          <p>{{ pagination?.total || 0 }} utilisateurs enregistrés</p>
        </div>
        <button class="btn btn--primary" (click)="openCreate()">&#43; Nouvel utilisateur</button>
      </div>

      <!-- Filters -->
      <div class="filters">
        <div class="search-box">
          <span>&#128269;</span>
          <input type="text" [(ngModel)]="search" (ngModelChange)="onSearch($event)"
            placeholder="Rechercher par nom ou email..." class="search-input">
          <button *ngIf="search" (click)="search='';load()" class="clear-btn">&#10005;</button>
        </div>
        <select [(ngModel)]="filterRole" (ngModelChange)="load()" class="select">
          <option value="">Tous les rôles</option>
          <option value="user">Utilisateurs</option>
          <option value="admin">Admins</option>
        </select>
        <select [(ngModel)]="filterActive" (ngModelChange)="load()" class="select">
          <option value="">Tous les statuts</option>
          <option value="true">Actifs</option>
          <option value="false">Inactifs</option>
        </select>
      </div>

      <!-- Table -->
      <div class="table-card" *ngIf="!loading; else loadingTpl">
        <table class="table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Rôle</th>
              <th>Contacts</th>
              <th>Statut</th>
              <th>Inscription</th>
              <th>Dernière connexion</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users">
              <td>
                <div class="user-cell">
                  <div class="user-avatar" [class.user-avatar--admin]="u.role==='admin'">{{ u.name[0].toUpperCase() }}</div>
                  <div>
                    <strong>{{ u.name }}</strong>
                    <span class="email">{{ u.email }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge" [class.badge--admin]="u.role==='admin'" [class.badge--user]="u.role==='user'">
                  {{ u.role === 'admin' ? '&#9881; Admin' : '&#128100; User' }}
                </span>
              </td>
              <td>
                <span class="count-badge">{{ u.contactCount }}</span>
              </td>
              <td>
                <span class="status-dot" [class.status-dot--active]="u.isActive" [class.status-dot--inactive]="!u.isActive">
                  {{ u.isActive ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="date">{{ u.createdAt | date:'dd/MM/yyyy' }}</td>
              <td class="date">{{ u.lastLogin ? (u.lastLogin | date:'dd/MM/yyyy') : '—' }}</td>
              <td>
                <div class="row-actions">
                  <a [routerLink]="['/admin/users', u._id]" class="action-btn" title="Détail">&#128065;</a>
                  <button class="action-btn" (click)="openEdit(u)" title="Modifier">&#9998;</button>
                  <button class="action-btn" (click)="toggle(u)" [title]="u.isActive ? 'Désactiver' : 'Activer'">
                    {{ u.isActive ? '&#128274;' : '&#128275;' }}
                  </button>
                  <button class="action-btn action-btn--danger" (click)="confirmDel(u)" title="Supprimer">&#128465;</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="users.length === 0">
              <td colspan="7" class="empty-row">Aucun utilisateur trouvé</td>
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

    <!-- Create/Edit Modal -->
    <div class="modal-overlay" *ngIf="showForm" (click)="closeForm()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}</h2>
          <button class="modal-close" (click)="closeForm()">&#10005;</button>
        </div>
        <form [formGroup]="userForm" (ngSubmit)="saveUser()" class="modal-body">
          <div class="form-group">
            <label>Nom complet</label>
            <input type="text" formControlName="name" class="input" placeholder="Jean Dupont">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" formControlName="email" class="input" placeholder="jean&#64;exemple.com">
          </div>
          <div class="form-group" *ngIf="!editingUser">
            <label>Mot de passe</label>
            <input type="password" formControlName="password" class="input" placeholder="Min. 6 caractères">
          </div>
          <div class="form-group">
            <label>Rôle</label>
            <select formControlName="role" class="input">
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <div class="form-group" *ngIf="editingUser">
            <label>Statut</label>
            <select formControlName="isActive" class="input">
              <option [ngValue]="true">Actif</option>
              <option [ngValue]="false">Inactif</option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn--secondary" (click)="closeForm()">Annuler</button>
            <button type="submit" class="btn btn--primary" [disabled]="saving">
              <span *ngIf="saving" class="spinner-sm"></span>
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete confirm -->
    <div class="modal-overlay" *ngIf="deletingUser" (click)="deletingUser=null">
      <div class="confirm-modal" (click)="$event.stopPropagation()">
        <div class="confirm-icon">&#9888;</div>
        <h3>Supprimer cet utilisateur ?</h3>
        <p>L'utilisateur <strong>{{ deletingUser.name }}</strong> et tous ses contacts seront définitivement supprimés. Cette action est irréversible.</p>
        <div class="confirm-actions">
          <button class="btn btn--secondary" (click)="deletingUser=null">Annuler</button>
          <button class="btn btn--danger" (click)="deleteUser()">Supprimer définitivement</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0 0 0.25rem; }
    .page-header p { color: #64748b; margin: 0; font-size: 0.875rem; }

    .filters { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
    .search-box {
      flex: 1; min-width: 220px; display: flex; align-items: center; gap: 0.5rem;
      background: white; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 0 0.875rem;
    }
    .search-box span { color: #94a3b8; }
    .search-input { flex: 1; border: none; outline: none; font-size: 0.875rem; padding: 0.625rem 0; background: transparent; }
    .clear-btn { background: none; border: none; cursor: pointer; color: #94a3b8; font-size: 0.875rem; }
    .select {
      padding: 0.625rem 0.875rem; border: 1.5px solid #e2e8f0; border-radius: 10px;
      font-size: 0.875rem; background: white; outline: none; cursor: pointer; color: #374151;
    }

    .table-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 6px rgba(0,0,0,0.06); }
    .table { width: 100%; border-collapse: collapse; }
    .table th {
      padding: 0.875rem 1rem; background: #f8fafc; text-align: left;
      font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.05em; color: #64748b; border-bottom: 1px solid #e2e8f0;
    }
    .table td { padding: 0.875rem 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.875rem; vertical-align: middle; }
    .table tr:last-child td { border-bottom: none; }
    .table tr:hover td { background: #f8fafc; }

    .user-cell { display: flex; align-items: center; gap: 0.75rem; }
    .user-avatar {
      width: 36px; height: 36px; border-radius: 50%; background: #1d4ed8;
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; font-weight: 700; flex-shrink: 0;
    }
    .user-avatar--admin { background: #7c3aed; }
    .user-cell strong { display: block; color: #0f172a; font-size: 0.875rem; }
    .email { font-size: 0.775rem; color: #94a3b8; }

    .badge { padding: 0.2rem 0.625rem; border-radius: 20px; font-size: 0.72rem; font-weight: 700; }
    .badge--admin { background: #ede9fe; color: #6d28d9; }
    .badge--user { background: #dbeafe; color: #1d4ed8; }

    .count-badge { background: #f1f5f9; color: #374151; font-size: 0.8rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; }

    .status-dot { display: inline-flex; align-items: center; gap: 0.375rem; font-size: 0.8rem; font-weight: 600; }
    .status-dot::before { content: ''; width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
    .status-dot--active { color: #059669; }
    .status-dot--active::before { background: #10b981; }
    .status-dot--inactive { color: #9ca3af; }
    .status-dot--inactive::before { background: #d1d5db; }

    .date { font-size: 0.8rem; color: #64748b; }
    .row-actions { display: flex; gap: 0.25rem; }
    .action-btn {
      padding: 0.375rem 0.5rem; background: none; border: none; cursor: pointer;
      border-radius: 6px; font-size: 0.9rem; transition: background 0.1s; text-decoration: none; color: inherit;
    }
    .action-btn:hover { background: #f1f5f9; }
    .action-btn--danger:hover { background: #fee2e2; }
    .empty-row { text-align: center; color: #94a3b8; padding: 3rem !important; font-style: italic; }

    .pagination { display: flex; justify-content: center; gap: 0.375rem; padding: 1rem; border-top: 1px solid #f1f5f9; }
    .page-btn { width: 34px; height: 34px; border-radius: 7px; border: 1.5px solid #e2e8f0; background: white; cursor: pointer; font-size: 0.85rem; transition: all 0.1s; }
    .page-btn:hover:not(:disabled) { border-color: #1d4ed8; color: #1d4ed8; }
    .page-btn.active { background: #1d4ed8; color: white; border-color: #1d4ed8; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .btn { padding: 0.6rem 1.25rem; border-radius: 8px; border: none; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 0.5rem; }
    .btn--primary { background: #1d4ed8; color: white; }
    .btn--primary:hover:not(:disabled) { background: #1e40af; }
    .btn--primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn--secondary { background: #f1f5f9; color: #374151; }
    .btn--secondary:hover { background: #e2e8f0; }
    .btn--danger { background: #ef4444; color: white; }
    .btn--danger:hover { background: #dc2626; }

    .loading { display: flex; justify-content: center; padding: 4rem; }
    .spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #1d4ed8; border-radius: 50%; animation: spin 0.8s linear infinite; }
    .spinner-sm { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; backdrop-filter: blur(4px); }
    .modal { background: white; border-radius: 16px; width: 100%; max-width: 460px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: fadeUp 0.2s ease; }
    @keyframes fadeUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem 1.5rem 1rem; border-bottom: 1px solid #f1f5f9; }
    .modal-header h2 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #0f172a; }
    .modal-close { background: none; border: none; cursor: pointer; color: #94a3b8; font-size: 1rem; width: 30px; height: 30px; border-radius: 6px; }
    .modal-close:hover { background: #f1f5f9; color: #374151; }
    .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 0.5rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; }
    label { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; color: #374151; }
    .input { padding: 0.625rem 0.875rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; outline: none; transition: border-color 0.15s; width: 100%; box-sizing: border-box; }
    .input:focus { border-color: #1d4ed8; box-shadow: 0 0 0 3px rgba(29,78,216,0.1); }

    .confirm-modal { background: white; border-radius: 16px; padding: 2rem; max-width: 440px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.2); text-align: center; }
    .confirm-icon { font-size: 2.5rem; margin-bottom: 1rem; }
    .confirm-modal h3 { margin: 0 0 0.75rem; font-size: 1.1rem; color: #0f172a; }
    .confirm-modal p { color: #64748b; font-size: 0.875rem; margin: 0 0 1.5rem; line-height: 1.6; }
    .confirm-actions { display: flex; justify-content: center; gap: 0.75rem; }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  pagination: any = null;
  loading = false;
  search = '';
  filterRole = '';
  filterActive = '';
  currentPage = 1;

  showForm = false;
  editingUser: any = null;
  deletingUser: any = null;
  saving = false;
  userForm!: FormGroup;

  private searchSubject = new Subject<string>();

  constructor(private adminService: AdminService, private toast: ToastService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.load();
    this.buildForm();
    this.searchSubject.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => { this.currentPage = 1; this.load(); });
  }

  buildForm(u?: any): void {
    this.userForm = this.fb.group({
      name: [u?.name || '', Validators.required],
      email: [u?.email || '', [Validators.required, Validators.email]],
      password: [u ? '' : '', u ? [] : [Validators.required, Validators.minLength(6)]],
      role: [u?.role || 'user'],
      isActive: [u?.isActive !== undefined ? u.isActive : true]
    });
  }

  load(): void {
    this.loading = true;
    this.adminService.getUsers({ search: this.search, page: this.currentPage, limit: 15, role: this.filterRole, isActive: this.filterActive }).subscribe({
      next: (r) => { this.users = r.data.users; this.pagination = r.data.pagination; this.loading = false; },
      error: () => { this.loading = false; this.toast.error('Erreur de chargement'); }
    });
  }

  onSearch(v: string): void { this.searchSubject.next(v); }
  changePage(p: number): void { this.currentPage = p; this.load(); }
  pages(): number[] { return Array.from({ length: this.pagination?.pages || 0 }, (_, i) => i + 1); }

  openCreate(): void { this.editingUser = null; this.buildForm(); this.showForm = true; }
  openEdit(u: any): void { this.editingUser = u; this.buildForm(u); this.showForm = true; }
  closeForm(): void { this.showForm = false; this.editingUser = null; }

  saveUser(): void {
    if (this.userForm.invalid) { this.userForm.markAllAsTouched(); return; }
    this.saving = true;
    const val = this.userForm.value;
    const payload = this.editingUser ? { name: val.name, email: val.email, role: val.role, isActive: val.isActive } : val;

    const obs = this.editingUser
      ? this.adminService.updateUser(this.editingUser._id, payload)
      : this.adminService.createUser(payload);

    obs.subscribe({
      next: () => { this.toast.success(this.editingUser ? 'Utilisateur modifié !' : 'Utilisateur créé !'); this.closeForm(); this.load(); this.saving = false; },
      error: (err) => { this.toast.error(err.error?.message || 'Erreur'); this.saving = false; }
    });
  }

  toggle(u: any): void {
    this.adminService.toggleUserStatus(u._id).subscribe({
      next: (r) => { u.isActive = r.data.isActive; this.toast.info(u.isActive ? 'Utilisateur activé' : 'Utilisateur désactivé'); },
      error: (err) => this.toast.error(err.error?.message || 'Erreur')
    });
  }

  confirmDel(u: any): void { this.deletingUser = u; }
  deleteUser(): void {
    this.adminService.deleteUser(this.deletingUser._id).subscribe({
      next: () => { this.toast.success('Utilisateur supprimé'); this.deletingUser = null; this.load(); },
      error: (err) => this.toast.error(err.error?.message || 'Erreur')
    });
  }
}
