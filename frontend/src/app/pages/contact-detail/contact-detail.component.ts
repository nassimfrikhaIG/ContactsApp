import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ContactService } from '../../services/contact.service';
import { ToastService } from '../../services/toast.service';
import { Contact } from '../../models/contact.model';
import { NavbarComponent } from '../../components/shared/navbar/navbar.component';
import { ContactFormComponent } from '../../components/contacts/contact-form/contact-form.component';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, ContactFormComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="detail-page" *ngIf="contact">
      <div class="detail-container">
        <!-- Back button -->
        <a routerLink="/contacts" class="back-btn">← Retour aux contacts</a>

        <!-- Header card -->
        <div class="detail-header">
          <div class="detail-avatar" [style.background]="getAvatarColor()">
            {{ getInitials() }}
          </div>
          <div class="detail-identity">
            <h1>{{ contact.firstName }} {{ contact.lastName }}</h1>
            <p *ngIf="contact.jobTitle || contact.company">
              {{ contact.jobTitle }}<span *ngIf="contact.jobTitle && contact.company"> · </span>{{ contact.company }}
            </p>
            <div class="detail-badges">
              <span *ngIf="contact.isFavorite" class="badge badge--star">⭐ Favori</span>
              <span class="badge badge--source">{{ contact.source }}</span>
              <span *ngFor="let tag of contact.tags" class="badge badge--tag">{{ tag }}</span>
            </div>
          </div>
          <div class="detail-actions">
            <button class="btn btn--outline" (click)="toggleFavorite()">
              {{ contact.isFavorite ? '⭐ Retirer' : '☆ Favori' }}
            </button>
            <button class="btn btn--primary" (click)="showForm=true">✏️ Modifier</button>
            <button class="btn btn--danger" (click)="confirmDelete=true">🗑 Supprimer</button>
          </div>
        </div>

        <!-- Info grid -->
        <div class="detail-grid">
          <!-- Contact info -->
          <div class="info-card">
            <h3>📞 Coordonnées</h3>
            <div class="info-list">
              <div class="info-item" *ngIf="contact.email">
                <span class="info-label">Email</span>
                <a [href]="'mailto:' + contact.email" class="info-value link">{{ contact.email }}</a>
              </div>
              <div class="info-item" *ngIf="contact.phone">
                <span class="info-label">Téléphone</span>
                <a [href]="'tel:' + contact.phone" class="info-value link">{{ contact.phone }}</a>
              </div>
              <div class="info-item" *ngIf="contact.mobile">
                <span class="info-label">Mobile</span>
                <a [href]="'tel:' + contact.mobile" class="info-value link">{{ contact.mobile }}</a>
              </div>
              <div class="info-item" *ngIf="!contact.email && !contact.phone && !contact.mobile">
                <span class="info-value muted">Aucune coordonnée renseignée</span>
              </div>
            </div>
          </div>

          <!-- Professional -->
          <div class="info-card">
            <h3>💼 Professionnel</h3>
            <div class="info-list">
              <div class="info-item" *ngIf="contact.company">
                <span class="info-label">Entreprise</span>
                <span class="info-value">{{ contact.company }}</span>
              </div>
              <div class="info-item" *ngIf="contact.jobTitle">
                <span class="info-label">Poste</span>
                <span class="info-value">{{ contact.jobTitle }}</span>
              </div>
              <div class="info-item" *ngIf="contact.department">
                <span class="info-label">Département</span>
                <span class="info-value">{{ contact.department }}</span>
              </div>
            </div>
          </div>

          <!-- Address -->
          <div class="info-card" *ngIf="hasAddress()">
            <h3>📍 Adresse</h3>
            <div class="info-list">
              <div class="info-item" *ngIf="contact.address?.street">
                <span class="info-label">Rue</span>
                <span class="info-value">{{ contact.address?.street }}</span>
              </div>
              <div class="info-item" *ngIf="contact.address?.city">
                <span class="info-label">Ville</span>
                <span class="info-value">{{ contact.address?.city }} {{ contact.address?.zipCode }}</span>
              </div>
              <div class="info-item" *ngIf="contact.address?.country">
                <span class="info-label">Pays</span>
                <span class="info-value">{{ contact.address?.country }}</span>
              </div>
            </div>
          </div>

          <!-- Social -->
          <div class="info-card" *ngIf="hasSocial()">
            <h3>🌐 Réseaux sociaux</h3>
            <div class="info-list">
              <div class="info-item" *ngIf="contact.social?.linkedin">
                <span class="info-label">LinkedIn</span>
                <a [href]="contact.social?.linkedin" target="_blank" class="info-value link">Voir le profil →</a>
              </div>
              <div class="info-item" *ngIf="contact.social?.twitter">
                <span class="info-label">Twitter</span>
                <span class="info-value">{{ contact.social?.twitter }}</span>
              </div>
              <div class="info-item" *ngIf="contact.social?.website">
                <span class="info-label">Site web</span>
                <a [href]="contact.social?.website" target="_blank" class="info-value link">{{ contact.social?.website }}</a>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="info-card info-card--full" *ngIf="contact.notes">
            <h3>📝 Notes</h3>
            <p class="notes-text">{{ contact.notes }}</p>
          </div>

          <!-- Groups -->
          <div class="info-card" *ngIf="contact.groups?.length">
            <h3>📁 Groupes</h3>
            <div class="groups-list">
              <span *ngFor="let g of contact.groups" class="group-badge">{{ g }}</span>
            </div>
          </div>

          <!-- Meta -->
          <div class="info-card">
            <h3>ℹ️ Métadonnées</h3>
            <div class="info-list">
              <div class="info-item" *ngIf="contact.birthday">
                <span class="info-label">Anniversaire</span>
                <span class="info-value">{{ contact.birthday | date:'dd MMMM yyyy' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Créé le</span>
                <span class="info-value">{{ contact.createdAt | date:'dd/MM/yyyy à HH:mm' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Source</span>
                <span class="info-value">{{ contact.source }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div class="loading" *ngIf="!contact && !error">
      <div class="spinner-large"></div>
    </div>

    <!-- Error -->
    <div class="error-state" *ngIf="error">
      <p>Contact introuvable.</p>
      <a routerLink="/contacts" class="btn btn--primary">Retour</a>
    </div>

    <!-- Edit form -->
    <app-contact-form *ngIf="showForm" [contact]="contact"
      (close)="showForm=false" (saved)="onSaved($event)" #formRef>
    </app-contact-form>

    <!-- Delete confirm -->
    <div class="modal-overlay" *ngIf="confirmDelete" (click)="confirmDelete=false">
      <div class="confirm-modal" (click)="$event.stopPropagation()">
        <h3>Supprimer le contact ?</h3>
        <p>Cette action est irréversible.</p>
        <div class="confirm-actions">
          <button class="btn btn--secondary" (click)="confirmDelete=false">Annuler</button>
          <button class="btn btn--danger" (click)="doDelete()">Supprimer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-page { padding-top: 64px; min-height: 100vh; background: #f8fafc; }
    .detail-container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
    .back-btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      color: #64748b; text-decoration: none; font-size: 0.875rem;
      margin-bottom: 1.5rem; transition: color 0.1s;
    }
    .back-btn:hover { color: #2d6a9f; }
    .detail-header {
      background: white; border-radius: 16px; padding: 2rem;
      display: flex; align-items: center; gap: 1.5rem;
      border: 1.5px solid #e2e8f0; margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .detail-avatar {
      width: 80px; height: 80px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 1.75rem; font-weight: 700;
    }
    .detail-identity { flex: 1; min-width: 200px; }
    .detail-identity h1 { margin: 0 0 0.375rem; font-size: 1.75rem; font-weight: 800; color: #1e293b; }
    .detail-identity p { margin: 0 0 0.75rem; color: #64748b; font-size: 1rem; }
    .detail-badges { display: flex; flex-wrap: wrap; gap: 0.375rem; }
    .badge {
      padding: 0.2rem 0.625rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;
    }
    .badge--star { background: #fef3c7; color: #92400e; }
    .badge--source { background: #e0f2fe; color: #0369a1; }
    .badge--tag { background: #f1f5f9; color: #475569; }
    .detail-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .btn {
      padding: 0.5rem 1rem; border-radius: 8px; border: none;
      font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.15s;
      display: inline-flex; align-items: center; gap: 0.375rem; text-decoration: none;
    }
    .btn--primary { background: #2d6a9f; color: white; }
    .btn--primary:hover { background: #1e3a5f; }
    .btn--outline { background: white; color: #374151; border: 1.5px solid #e2e8f0; }
    .btn--outline:hover { border-color: #2d6a9f; color: #2d6a9f; }
    .btn--secondary { background: #f1f5f9; color: #374151; }
    .btn--danger { background: #ef4444; color: white; }
    .btn--danger:hover { background: #dc2626; }
    .detail-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
    }
    .info-card {
      background: white; border-radius: 12px; padding: 1.5rem;
      border: 1.5px solid #e2e8f0;
    }
    .info-card--full { grid-column: span 2; }
    .info-card h3 { margin: 0 0 1rem; font-size: 0.9rem; font-weight: 700; color: #374151; }
    .info-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .info-item { display: flex; gap: 1rem; align-items: flex-start; }
    .info-label { font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; min-width: 80px; padding-top: 1px; }
    .info-value { font-size: 0.875rem; color: #1e293b; word-break: break-word; }
    .info-value.link { color: #2d6a9f; text-decoration: none; }
    .info-value.link:hover { text-decoration: underline; }
    .info-value.muted { color: #94a3b8; font-style: italic; }
    .notes-text { margin: 0; font-size: 0.875rem; color: #374151; line-height: 1.6; white-space: pre-wrap; }
    .groups-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .group-badge {
      padding: 0.375rem 0.875rem; background: #f1f5f9; border-radius: 20px;
      font-size: 0.8rem; font-weight: 500; color: #374151;
    }
    .loading { display: flex; justify-content: center; padding: 6rem; }
    .spinner-large { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #2d6a9f; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error-state { text-align: center; padding: 4rem; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; backdrop-filter: blur(4px); }
    .confirm-modal { background: white; border-radius: 16px; padding: 2rem; max-width: 400px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
    .confirm-modal h3 { margin: 0 0 0.75rem; }
    .confirm-modal p { color: #64748b; font-size: 0.875rem; margin: 0 0 1.5rem; }
    .confirm-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
    @media (max-width: 768px) {
      .detail-grid { grid-template-columns: 1fr; }
      .info-card--full { grid-column: span 1; }
      .detail-header { flex-direction: column; text-align: center; }
      .detail-badges { justify-content: center; }
      .detail-actions { justify-content: center; }
    }
  `]
})
export class ContactDetailComponent implements OnInit {
  @ViewChild('formRef') formRef?: ContactFormComponent;
  contact: Contact | null = null;
  error = false;
  showForm = false;
  confirmDelete = false;

  constructor(private route: ActivatedRoute, private router: Router,
              private contactService: ContactService, private toast: ToastService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.contactService.getContact(id).subscribe({
      next: (res) => this.contact = res.data.contact,
      error: () => this.error = true
    });
  }

  getInitials(): string {
    return `${this.contact?.firstName?.[0] || ''}${this.contact?.lastName?.[0] || ''}`.toUpperCase();
  }

  getAvatarColor(): string {
    const colors = ['#4f46e5','#7c3aed','#db2777','#dc2626','#d97706','#059669','#2563eb','#0891b2'];
    return colors[(this.contact?.firstName?.charCodeAt(0) || 0) % colors.length];
  }

  hasAddress(): boolean {
    const a = this.contact?.address;
    return !!(a?.street || a?.city || a?.country);
  }

  hasSocial(): boolean {
    const s = this.contact?.social;
    return !!(s?.linkedin || s?.twitter || s?.website || s?.facebook);
  }

  toggleFavorite(): void {
    if (!this.contact) return;
    this.contactService.toggleFavorite(this.contact._id!).subscribe({
      next: (res) => {
        this.contact!.isFavorite = res.data.isFavorite;
        this.toast.info(this.contact!.isFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris');
      }
    });
  }

  onSaved(payload: any): void {
    this.contactService.updateContact(this.contact!._id!, payload).subscribe({
      next: (res) => {
        this.contact = res.data.contact;
        this.showForm = false;
        this.toast.success('Contact modifié !');
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Erreur');
        this.formRef?.stopLoading();
      }
    });
  }

  doDelete(): void {
    this.contactService.deleteContact(this.contact!._id!).subscribe({
      next: () => {
        this.toast.success('Contact supprimé');
        this.router.navigate(['/contacts']);
      },
      error: () => this.toast.error('Erreur lors de la suppression')
    });
  }
}
