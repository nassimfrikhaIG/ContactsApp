import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ContactService } from '../../services/contact.service';
import { ToastService } from '../../services/toast.service';
import { Contact, Pagination } from '../../models/contact.model';
import { NavbarComponent } from '../../components/shared/navbar/navbar.component';
import { ContactFormComponent } from '../../components/contacts/contact-form/contact-form.component';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, ContactFormComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="page">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar__section">
          <p class="sidebar__label">Vues</p>
          <button class="sidebar__item" [class.active]="!filterGroup && !filterTag && !showFavorites"
            (click)="clearFilters()">
            <span>👥</span> Tous les contacts
            <span class="badge">{{ pagination?.total || 0 }}</span>
          </button>
          <button class="sidebar__item" [class.active]="showFavorites" (click)="toggleFavorites()">
            <span>⭐</span> Favoris
          </button>
          <button class="sidebar__item" [class.active]="recentImports" (click)="toggleRecentImports()">
            <span>📥</span> Imports récents
          </button>
        </div>

        <div class="sidebar__section" *ngIf="groups.length">
          <p class="sidebar__label">Groupes</p>
          <button *ngFor="let g of groups" class="sidebar__item"
            [class.active]="filterGroup === g._id"
            (click)="selectGroup(g._id)">
            <span>📁</span> {{ g._id }}
            <span class="badge">{{ g.count }}</span>
          </button>
        </div>

        <div class="sidebar__section" *ngIf="tags.length">
          <p class="sidebar__label">Tags</p>
          <div class="tags-list">
            <button *ngFor="let t of tags" class="tag-btn"
              [class.active]="filterTag === t._id"
              (click)="selectTag(t._id)">
              {{ t._id }} ({{ t.count }})
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main">
        <!-- Toolbar -->
        <div class="toolbar">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearch($event)"
              placeholder="Rechercher par nom, email, entreprise..." class="search-input">
            <button *ngIf="searchQuery" class="search-clear" (click)="searchQuery=''; onSearch('')">✕</button>
          </div>

          <div class="toolbar__actions">
            <select [(ngModel)]="sortBy" (ngModelChange)="loadContacts()" class="select-input">
              <option value="-createdAt">Plus récents</option>
              <option value="firstName">Prénom A-Z</option>
              <option value="-firstName">Prénom Z-A</option>
              <option value="company">Entreprise</option>
            </select>

            <div class="view-toggle">
              <button [class.active]="viewMode==='grid'" (click)="viewMode='grid'" title="Grille">⊞</button>
              <button [class.active]="viewMode==='list'" (click)="viewMode='list'" title="Liste">☰</button>
            </div>

            <button class="btn btn--outline" (click)="openImport()">📥 Importer</button>
            <button class="btn btn--outline" (click)="exportCSV()">📤 Exporter</button>
            <button class="btn btn--primary" (click)="openCreate()">+ Nouveau</button>
          </div>
        </div>

        <!-- Bulk actions bar -->
        <div class="bulk-bar" *ngIf="selected.size > 0">
          <span>{{ selected.size }} sélectionné(s)</span>
          <button class="btn btn--danger btn--sm" (click)="bulkDelete()">🗑 Supprimer</button>
          <button class="btn btn--secondary btn--sm" (click)="clearSelection()">Annuler</button>
        </div>

        <!-- Loading -->
        <div class="loading" *ngIf="loading">
          <div class="spinner-large"></div>
        </div>

        <!-- Empty state -->
        <div class="empty" *ngIf="!loading && contacts.length === 0">
          <div class="empty__icon">👤</div>
          <h3>Aucun contact trouvé</h3>
          <p>{{ searchQuery ? 'Essayez une autre recherche.' : 'Ajoutez votre premier contact.' }}</p>
          <button class="btn btn--primary" (click)="openCreate()" *ngIf="!searchQuery">+ Nouveau contact</button>
        </div>

        <!-- Grid view -->
        <div class="contacts-grid" *ngIf="!loading && contacts.length > 0 && viewMode==='grid'">
          <div *ngFor="let contact of contacts" class="contact-card"
            [class.selected]="selected.has(contact._id!)">
            <div class="card__select">
              <input type="checkbox" [checked]="selected.has(contact._id!)"
                (change)="toggleSelect(contact._id!)">
            </div>
            <div class="card__avatar" [style.background]="getAvatarColor(contact)">
              {{ getInitials(contact) }}
            </div>
            <div class="card__info" [routerLink]="['/contacts', contact._id]">
              <h3>{{ contact.firstName }} {{ contact.lastName }}</h3>
              <p class="card__title" *ngIf="contact.jobTitle || contact.company">
                {{ contact.jobTitle }}{{ contact.jobTitle && contact.company ? ' · ' : '' }}{{ contact.company }}
              </p>
              <p class="card__email" *ngIf="contact.email">{{ contact.email }}</p>
              <div class="card__tags">
                <span *ngFor="let tag of (contact.tags || []).slice(0,3)" class="tag">{{ tag }}</span>
              </div>
            </div>
            <div class="card__actions">
              <button class="action-btn" (click)="toggleFavorite(contact)" [title]="contact.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'">
                {{ contact.isFavorite ? '⭐' : '☆' }}
              </button>
              <button class="action-btn" (click)="openEdit(contact)" title="Modifier">✏️</button>
              <button class="action-btn action-btn--danger" (click)="confirmDelete(contact)" title="Supprimer">🗑</button>
            </div>
          </div>
        </div>

        <!-- List view -->
        <div class="contacts-list" *ngIf="!loading && contacts.length > 0 && viewMode==='list'">
          <table class="table">
            <thead>
              <tr>
                <th><input type="checkbox" (change)="toggleSelectAll($event)"></th>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Entreprise</th>
                <th>Tags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let contact of contacts" [class.selected]="selected.has(contact._id!)">
                <td><input type="checkbox" [checked]="selected.has(contact._id!)" (change)="toggleSelect(contact._id!)"></td>
                <td>
                  <div class="table-name" [routerLink]="['/contacts', contact._id]">
                    <div class="mini-avatar" [style.background]="getAvatarColor(contact)">{{ getInitials(contact) }}</div>
                    <div>
                      <strong>{{ contact.firstName }} {{ contact.lastName }}</strong>
                      <span *ngIf="contact.isFavorite"> ⭐</span>
                    </div>
                  </div>
                </td>
                <td>{{ contact.email || '—' }}</td>
                <td>{{ contact.phone || contact.mobile || '—' }}</td>
                <td>{{ contact.company || '—' }}</td>
                <td>
                  <span *ngFor="let t of (contact.tags||[]).slice(0,2)" class="tag">{{ t }}</span>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="action-btn" (click)="toggleFavorite(contact)">{{ contact.isFavorite ? '⭐' : '☆' }}</button>
                    <button class="action-btn" (click)="openEdit(contact)">✏️</button>
                    <button class="action-btn action-btn--danger" (click)="confirmDelete(contact)">🗑</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="pagination && pagination.pages > 1">
          <button class="page-btn" [disabled]="pagination.page === 1" (click)="changePage(pagination.page - 1)">‹</button>
          <button *ngFor="let p of getPages()" class="page-btn" [class.active]="p === pagination.page"
            (click)="changePage(p)">{{ p }}</button>
          <button class="page-btn" [disabled]="pagination.page === pagination.pages" (click)="changePage(pagination.page + 1)">›</button>
        </div>
      </main>
    </div>

    <!-- Import modal -->
    <div class="modal-overlay" *ngIf="showImport" (click)="showImport=false">
      <div class="import-modal" (click)="$event.stopPropagation()">
        <h3>Importer des contacts (CSV)</h3>
        <div class="dropzone" (dragover)="$event.preventDefault()" (drop)="onFileDrop($event)"
          (click)="fileInput.click()">
          <span>📁</span>
          <p>Glissez votre fichier CSV ici ou cliquez pour parcourir</p>
          <small>Colonnes: First Name, Last Name, Email, Phone, Company, Job Title, Tags, Groups</small>
        </div>
        <input #fileInput type="file" accept=".csv" style="display:none" (change)="onFileSelect($event)">
        <div *ngIf="importFile" class="import-file">
          <span>📄 {{ importFile.name }}</span>
          <button class="btn btn--primary btn--sm" (click)="doImport()" [disabled]="importing">
            {{ importing ? 'Import...' : 'Importer' }}
          </button>
        </div>
        <a class="download-template" (click)="downloadTemplate()">📥 Télécharger le modèle CSV</a>
      </div>
    </div>

    <!-- Contact form modal -->
    <app-contact-form *ngIf="showForm" [contact]="editingContact"
      (close)="closeForm()" (saved)="onSaved($event)" #formRef>
    </app-contact-form>

    <!-- Delete confirm modal -->
    <div class="modal-overlay" *ngIf="deletingContact" (click)="deletingContact=null">
      <div class="confirm-modal" (click)="$event.stopPropagation()">
        <h3>Supprimer le contact ?</h3>
        <p>Cette action est irréversible. Le contact <strong>{{ deletingContact!.firstName }} {{ deletingContact!.lastName }}</strong> sera définitivement supprimé.</p>
        <div class="confirm-actions">
          <button class="btn btn--secondary" (click)="deletingContact=null">Annuler</button>
          <button class="btn btn--danger" (click)="deleteContact()">Supprimer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .page {
      display: flex; padding-top: 64px; min-height: 100vh;
      background: var(--bg, #f8fafc);
    }

    /* Sidebar */
    .sidebar {
      width: 240px; min-height: calc(100vh - 64px); background: var(--surface, white);
      border-right: 1px solid var(--border, #e2e8f0); padding: 1.5rem 1rem;
      position: sticky; top: 64px; height: calc(100vh - 64px); overflow-y: auto;
      flex-shrink: 0;
    }
    .sidebar__section { margin-bottom: 1.5rem; }
    .sidebar__label {
      font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: #94a3b8; margin: 0 0 0.5rem 0.5rem;
    }
    .sidebar__item {
      display: flex; align-items: center; gap: 0.625rem; width: 100%;
      padding: 0.5rem 0.75rem; border-radius: 8px; border: none;
      background: none; font-size: 0.875rem; cursor: pointer;
      color: #374151; text-align: left; transition: all 0.1s;
    }
    .sidebar__item:hover { background: #f1f5f9; }
    .sidebar__item.active { background: #dbeafe; color: #1d4ed8; font-weight: 600; }
    .badge {
      margin-left: auto; background: #e2e8f0; color: #64748b;
      font-size: 0.7rem; padding: 1px 6px; border-radius: 10px; font-weight: 600;
    }
    .sidebar__item.active .badge { background: #bfdbfe; color: #1d4ed8; }
    .tags-list { display: flex; flex-wrap: wrap; gap: 0.375rem; }
    .tag-btn {
      padding: 0.25rem 0.625rem; border-radius: 20px; border: 1.5px solid #e2e8f0;
      background: none; font-size: 0.75rem; cursor: pointer; color: #64748b; transition: all 0.1s;
    }
    .tag-btn:hover { border-color: #2d6a9f; color: #2d6a9f; }
    .tag-btn.active { background: #2d6a9f; color: white; border-color: #2d6a9f; }

    /* Main */
    .main { flex: 1; padding: 1.5rem; min-width: 0; }

    /* Toolbar */
    .toolbar {
      display: flex; gap: 1rem; align-items: center; margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }
    .search-box {
      flex: 1; min-width: 200px; position: relative;
      display: flex; align-items: center;
    }
    .search-icon { position: absolute; left: 0.875rem; color: #94a3b8; font-size: 0.9rem; }
    .search-input {
      width: 100%; padding: 0.625rem 2.5rem; border: 1.5px solid #e2e8f0;
      border-radius: 10px; font-size: 0.875rem; outline: none; background: white;
      transition: border-color 0.15s; box-sizing: border-box;
    }
    .search-input:focus { border-color: #2d6a9f; box-shadow: 0 0 0 3px rgba(45,106,159,0.1); }
    .search-clear {
      position: absolute; right: 0.75rem; background: none; border: none;
      cursor: pointer; color: #94a3b8; font-size: 0.875rem;
    }
    .toolbar__actions { display: flex; gap: 0.625rem; align-items: center; flex-wrap: wrap; }
    .select-input {
      padding: 0.5rem 0.75rem; border: 1.5px solid #e2e8f0; border-radius: 8px;
      font-size: 0.8rem; background: white; cursor: pointer; outline: none;
    }
    .view-toggle {
      display: flex; border: 1.5px solid #e2e8f0; border-radius: 8px; overflow: hidden;
    }
    .view-toggle button {
      padding: 0.4rem 0.625rem; border: none; background: white;
      cursor: pointer; color: #94a3b8; font-size: 1rem; transition: all 0.1s;
    }
    .view-toggle button.active { background: #2d6a9f; color: white; }
    .btn {
      padding: 0.5rem 1rem; border-radius: 8px; border: none;
      font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.15s;
      display: inline-flex; align-items: center; gap: 0.375rem; white-space: nowrap;
    }
    .btn--primary { background: #2d6a9f; color: white; }
    .btn--primary:hover { background: #1e3a5f; }
    .btn--outline { background: white; color: #374151; border: 1.5px solid #e2e8f0; }
    .btn--outline:hover { border-color: #2d6a9f; color: #2d6a9f; }
    .btn--secondary { background: #f1f5f9; color: #374151; }
    .btn--danger { background: #ef4444; color: white; }
    .btn--danger:hover { background: #dc2626; }
    .btn--sm { padding: 0.375rem 0.75rem; font-size: 0.8rem; }

    /* Bulk bar */
    .bulk-bar {
      display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem;
      background: #dbeafe; border-radius: 10px; margin-bottom: 1rem;
      font-size: 0.875rem; font-weight: 500; color: #1d4ed8;
    }

    /* Loading */
    .loading { display: flex; justify-content: center; padding: 4rem; }
    .spinner-large {
      width: 40px; height: 40px; border: 3px solid #e2e8f0;
      border-top-color: #2d6a9f; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Empty state */
    .empty {
      text-align: center; padding: 5rem 2rem; color: #94a3b8;
    }
    .empty__icon { font-size: 4rem; margin-bottom: 1rem; }
    .empty h3 { font-size: 1.25rem; color: #374151; margin: 0 0 0.5rem; }
    .empty p { margin: 0 0 1.5rem; }

    /* Grid */
    .contacts-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }
    .contact-card {
      background: white; border-radius: 12px; padding: 1.25rem;
      border: 1.5px solid #e2e8f0; transition: all 0.15s; position: relative;
      cursor: default;
    }
    .contact-card:hover { border-color: #93c5fd; box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-2px); }
    .contact-card.selected { border-color: #2d6a9f; background: #eff6ff; }
    .card__select { position: absolute; top: 1rem; left: 1rem; }
    .card__avatar {
      width: 52px; height: 52px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; color: white;
      font-size: 1.1rem; font-weight: 700; margin: 0 auto 1rem;
    }
    .card__info { text-align: center; cursor: pointer; }
    .card__info h3 { margin: 0 0 0.25rem; font-size: 1rem; color: #1e293b; }
    .card__info h3:hover { color: #2d6a9f; }
    .card__title { font-size: 0.8rem; color: #64748b; margin: 0 0 0.375rem; }
    .card__email { font-size: 0.8rem; color: #2d6a9f; margin: 0 0 0.75rem; }
    .card__tags { display: flex; flex-wrap: wrap; gap: 0.25rem; justify-content: center; }
    .tag {
      padding: 0.2rem 0.5rem; background: #f1f5f9; border-radius: 4px;
      font-size: 0.7rem; color: #64748b; font-weight: 500;
    }
    .card__actions {
      display: flex; justify-content: center; gap: 0.5rem;
      margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f1f5f9;
    }
    .action-btn {
      padding: 0.375rem; background: none; border: none; cursor: pointer;
      border-radius: 6px; font-size: 1rem; transition: background 0.1s;
    }
    .action-btn:hover { background: #f1f5f9; }
    .action-btn--danger:hover { background: #fee2e2; }

    /* Table */
    .contacts-list { background: white; border-radius: 12px; border: 1.5px solid #e2e8f0; overflow: hidden; }
    .table { width: 100%; border-collapse: collapse; }
    .table th {
      padding: 0.875rem 1rem; background: #f8fafc; text-align: left;
      font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.04em; color: #64748b; border-bottom: 1px solid #e2e8f0;
    }
    .table td { padding: 0.875rem 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.875rem; color: #374151; }
    .table tr:last-child td { border-bottom: none; }
    .table tr:hover td { background: #f8fafc; }
    .table tr.selected td { background: #eff6ff; }
    .table-name { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; }
    .table-name:hover strong { color: #2d6a9f; }
    .mini-avatar {
      width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 0.75rem; font-weight: 700;
    }
    .row-actions { display: flex; gap: 0.25rem; }

    /* Pagination */
    .pagination { display: flex; justify-content: center; gap: 0.375rem; margin-top: 1.5rem; }
    .page-btn {
      width: 36px; height: 36px; border-radius: 8px; border: 1.5px solid #e2e8f0;
      background: white; cursor: pointer; font-size: 0.875rem; transition: all 0.1s;
    }
    .page-btn:hover:not(:disabled) { border-color: #2d6a9f; color: #2d6a9f; }
    .page-btn.active { background: #2d6a9f; color: white; border-color: #2d6a9f; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Import modal */
    .import-modal {
      background: white; border-radius: 16px; padding: 2rem; max-width: 480px;
      width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .import-modal h3 { margin: 0 0 1.5rem; font-size: 1.25rem; }
    .dropzone {
      border: 2px dashed #e2e8f0; border-radius: 12px; padding: 2.5rem;
      text-align: center; cursor: pointer; transition: border-color 0.15s;
    }
    .dropzone:hover { border-color: #2d6a9f; }
    .dropzone span { font-size: 2rem; display: block; margin-bottom: 0.75rem; }
    .dropzone p { margin: 0 0 0.5rem; font-size: 0.875rem; color: #374151; }
    .dropzone small { color: #94a3b8; font-size: 0.75rem; }
    .import-file {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.75rem; background: #f0f9ff; border-radius: 8px; margin-top: 1rem;
      font-size: 0.875rem;
    }
    .download-template {
      display: block; text-align: center; margin-top: 1rem;
      font-size: 0.875rem; color: #2d6a9f; cursor: pointer; text-decoration: underline;
    }

    /* Confirm modal */
    .confirm-modal {
      background: white; border-radius: 16px; padding: 2rem; max-width: 400px;
      width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .confirm-modal h3 { margin: 0 0 0.75rem; font-size: 1.1rem; }
    .confirm-modal p { color: #64748b; font-size: 0.875rem; margin: 0 0 1.5rem; line-height: 1.5; }
    .confirm-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }

    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 1rem; backdrop-filter: blur(4px);
    }

    @media (max-width: 768px) {
      .sidebar { display: none; }
      .toolbar { flex-direction: column; align-items: stretch; }
      .toolbar__actions { justify-content: flex-end; }
      .contacts-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ContactsComponent implements OnInit {
  @ViewChild('formRef') formRef?: ContactFormComponent;

  contacts: Contact[] = [];
  pagination: Pagination | null = null;
  loading = false;
  searchQuery = '';
  sortBy = '-createdAt';
  viewMode: 'grid' | 'list' = 'grid';
  currentPage = 1;

  tags: any[] = [];
  groups: any[] = [];
  filterGroup = '';
  filterTag = '';
  showFavorites = false;
  recentImports = false;

  selected = new Set<string>();
  showForm = false;
  editingContact: Contact | null = null;
  deletingContact: Contact | null = null;
  showImport = false;
  importFile: File | null = null;
  importing = false;

  private searchSubject = new Subject<string>();

  constructor(private contactService: ContactService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadContacts();
    this.loadSidebarData();
    this.searchSubject.pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => { this.currentPage = 1; this.loadContacts(); });
  }

  loadContacts(): void {
    this.loading = true;
    const filter: any = {
      page: this.currentPage, limit: 20, sort: this.sortBy
    };
    if (this.searchQuery) filter.search = this.searchQuery;
    if (this.filterGroup) filter.group = this.filterGroup;
    if (this.filterTag) filter.tag = this.filterTag;
    if (this.showFavorites) filter.isFavorite = true;
    if (this.recentImports) filter.sort = '-createdAt';

    this.contactService.getContacts(filter).subscribe({
      next: (res) => {
        this.contacts = res.data.contacts;
        this.pagination = res.data.pagination;
        this.loading = false;
      },
      error: () => { this.loading = false; this.toast.error('Erreur de chargement'); }
    });
  }

  loadSidebarData(): void {
    this.contactService.getGroups().subscribe(r => this.groups = r.data.groups);
    this.contactService.getTags().subscribe(r => this.tags = r.data.tags);
  }

  onSearch(v: string): void { this.searchSubject.next(v); }

  selectGroup(g: string): void {
    this.filterGroup = this.filterGroup === g ? '' : g;
    this.filterTag = ''; this.showFavorites = false; this.recentImports = false;
    this.currentPage = 1; this.loadContacts();
  }

  selectTag(t: string): void {
    this.filterTag = this.filterTag === t ? '' : t;
    this.filterGroup = ''; this.showFavorites = false; this.recentImports = false;
    this.currentPage = 1; this.loadContacts();
  }

  toggleFavorites(): void {
    this.showFavorites = !this.showFavorites;
    this.filterGroup = ''; this.filterTag = ''; this.recentImports = false;
    this.currentPage = 1; this.loadContacts();
  }

  toggleRecentImports(): void {
    this.recentImports = !this.recentImports;
    this.filterGroup = ''; this.filterTag = ''; this.showFavorites = false;
    this.currentPage = 1; this.loadContacts();
  }

  clearFilters(): void {
    this.filterGroup = ''; this.filterTag = '';
    this.showFavorites = false; this.recentImports = false;
    this.currentPage = 1; this.loadContacts();
  }

  changePage(p: number): void { this.currentPage = p; this.loadContacts(); }

  getPages(): number[] {
    if (!this.pagination) return [];
    const pages: number[] = [];
    for (let i = 1; i <= this.pagination.pages; i++) pages.push(i);
    return pages;
  }

  toggleSelect(id: string): void {
    if (this.selected.has(id)) this.selected.delete(id);
    else this.selected.add(id);
    this.selected = new Set(this.selected);
  }

  toggleSelectAll(e: Event): void {
    if ((e.target as HTMLInputElement).checked) {
      this.contacts.forEach(c => this.selected.add(c._id!));
    } else { this.selected.clear(); }
    this.selected = new Set(this.selected);
  }

  clearSelection(): void { this.selected.clear(); this.selected = new Set(); }

  openCreate(): void { this.editingContact = null; this.showForm = true; }
  openEdit(c: Contact): void { this.editingContact = c; this.showForm = true; }
  closeForm(): void { this.showForm = false; this.editingContact = null; }

  onSaved(payload: any): void {
    const obs = this.editingContact
      ? this.contactService.updateContact(this.editingContact._id!, payload)
      : this.contactService.createContact(payload);

    obs.subscribe({
      next: () => {
        this.toast.success(this.editingContact ? 'Contact modifié !' : 'Contact créé !');
        this.closeForm();
        this.loadContacts();
        this.loadSidebarData();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Erreur');
        this.formRef?.stopLoading();
      }
    });
  }

  confirmDelete(c: Contact): void { this.deletingContact = c; }

  deleteContact(): void {
    if (!this.deletingContact) return;
    this.contactService.deleteContact(this.deletingContact._id!).subscribe({
      next: () => {
        this.toast.success('Contact supprimé');
        this.deletingContact = null;
        this.loadContacts();
        this.loadSidebarData();
      },
      error: () => this.toast.error('Erreur lors de la suppression')
    });
  }

  bulkDelete(): void {
    if (!this.selected.size) return;
    this.contactService.bulkDelete([...this.selected]).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.clearSelection();
        this.loadContacts();
        this.loadSidebarData();
      },
      error: () => this.toast.error('Erreur lors de la suppression')
    });
  }

  toggleFavorite(c: Contact): void {
    this.contactService.toggleFavorite(c._id!).subscribe({
      next: (res) => {
        c.isFavorite = res.data.isFavorite;
        this.toast.info(c.isFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris');
      }
    });
  }

  exportCSV(): void {
    this.contactService.exportCSV().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'contacts.csv'; a.click();
        URL.revokeObjectURL(url);
        this.toast.success('Export CSV téléchargé !');
      },
      error: () => this.toast.error('Erreur lors de l\'export')
    });
  }

  openImport(): void { this.showImport = true; this.importFile = null; }

  onFileSelect(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.importFile = file;
  }

  onFileDrop(e: DragEvent): void {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (file) this.importFile = file;
  }

  doImport(): void {
    if (!this.importFile) return;
    this.importing = true;
    this.contactService.importCSV(this.importFile).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.showImport = false; this.importFile = null; this.importing = false;
        this.loadContacts(); this.loadSidebarData();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Erreur d\'import');
        this.importing = false;
      }
    });
  }

  downloadTemplate(): void {
    const csv = 'First Name,Last Name,Email,Phone,Mobile,Company,Job Title,Department,Tags,Groups,Notes\nJean,Dupont,jean@exemple.com,+33 1 23 45 67,+33 6 12 34 56,ACME Corp,Directeur,Ingénierie,"vip;client","Travail;Partenaires",Note exemple';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = 'modele_contacts.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  getInitials(c: Contact): string {
    return `${c.firstName?.[0] || ''}${c.lastName?.[0] || ''}`.toUpperCase();
  }

  getAvatarColor(c: Contact): string {
    const colors = ['#4f46e5','#7c3aed','#db2777','#dc2626','#d97706','#059669','#2563eb','#0891b2'];
    const index = (c.firstName?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  }
}
