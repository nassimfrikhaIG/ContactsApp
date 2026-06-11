import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Contact } from '../../../models/contact.model';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="modal">
        <div class="modal__header">
          <h2>{{ contact ? 'Modifier le contact' : 'Nouveau contact' }}</h2>
          <button class="modal__close" (click)="close.emit()">✕</button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="modal__body">
          <div class="tabs">
            <button type="button" class="tab" [class.active]="tab==='info'" (click)="tab='info'">Informations</button>
            <button type="button" class="tab" [class.active]="tab==='address'" (click)="tab='address'">Adresse</button>
            <button type="button" class="tab" [class.active]="tab==='social'" (click)="tab='social'">Réseaux</button>
            <button type="button" class="tab" [class.active]="tab==='extra'" (click)="tab='extra'">Extra</button>
          </div>

          <!-- Tab: Info -->
          <div *ngIf="tab==='info'" class="tab-content">
            <div class="form-row">
              <div class="form-group">
                <label>Prénom *</label>
                <input type="text" formControlName="firstName" class="input"
                  [class.input--error]="f['firstName'].invalid && f['firstName'].touched" placeholder="Jean">
              </div>
              <div class="form-group">
                <label>Nom *</label>
                <input type="text" formControlName="lastName" class="input"
                  [class.input--error]="f['lastName'].invalid && f['lastName'].touched" placeholder="Dupont">
              </div>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" formControlName="email" class="input" placeholder="jean.dupont&#64;exemple.com">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Téléphone</label>
                <input type="tel" formControlName="phone" class="input" placeholder="+33 1 23 45 67 89">
              </div>
              <div class="form-group">
                <label>Mobile</label>
                <input type="tel" formControlName="mobile" class="input" placeholder="+33 6 12 34 56 78">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Entreprise</label>
                <input type="text" formControlName="company" class="input" placeholder="ACME Corp">
              </div>
              <div class="form-group">
                <label>Poste</label>
                <input type="text" formControlName="jobTitle" class="input" placeholder="Directeur Technique">
              </div>
            </div>
            <div class="form-group">
              <label>Département</label>
              <input type="text" formControlName="department" class="input" placeholder="Ingénierie">
            </div>
          </div>

          <!-- Tab: Address -->
          <div *ngIf="tab==='address'" class="tab-content" formGroupName="address">
            <div class="form-group">
              <label>Rue</label>
              <input type="text" formControlName="street" class="input" placeholder="123 Rue de la Paix">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Ville</label>
                <input type="text" formControlName="city" class="input" placeholder="Paris">
              </div>
              <div class="form-group">
                <label>Code postal</label>
                <input type="text" formControlName="zipCode" class="input" placeholder="75001">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Région</label>
                <input type="text" formControlName="state" class="input" placeholder="Île-de-France">
              </div>
              <div class="form-group">
                <label>Pays</label>
                <input type="text" formControlName="country" class="input" placeholder="France">
              </div>
            </div>
          </div>

          <!-- Tab: Social -->
          <div *ngIf="tab==='social'" class="tab-content" formGroupName="social">
            <div class="form-group">
              <label>🔗 LinkedIn</label>
              <input type="url" formControlName="linkedin" class="input" placeholder="https://linkedin.com/in/...">
            </div>
            <div class="form-group">
              <label>🐦 Twitter / X</label>
              <input type="text" formControlName="twitter" class="input" placeholder="&#64;username">
            </div>
            <div class="form-group">
              <label>🌐 Site web</label>
              <input type="url" formControlName="website" class="input" placeholder="https://...">
            </div>
            <div class="form-group">
              <label>📘 Facebook</label>
              <input type="url" formControlName="facebook" class="input" placeholder="https://facebook.com/...">
            </div>
          </div>

          <!-- Tab: Extra -->
          <div *ngIf="tab==='extra'" class="tab-content">
            <div class="form-group">
              <label>Date d'anniversaire</label>
              <input type="date" formControlName="birthday" class="input">
            </div>
            <div class="form-group">
              <label>Tags (séparés par des virgules)</label>
              <input type="text" formControlName="tagsInput" class="input" placeholder="vip, client, partenaire">
            </div>
            <div class="form-group">
              <label>Groupes (séparés par des virgules)</label>
              <input type="text" formControlName="groupsInput" class="input" placeholder="Travail, Amis">
            </div>
            <div class="form-group">
              <label>Notes</label>
              <textarea formControlName="notes" class="input textarea" rows="4" placeholder="Notes privées..."></textarea>
            </div>
          </div>

          <div class="modal__footer">
            <button type="button" class="btn btn--secondary" (click)="close.emit()">Annuler</button>
            <button type="submit" class="btn btn--primary" [disabled]="loading">
              <span *ngIf="loading" class="spinner"></span>
              {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 1rem; backdrop-filter: blur(4px);
    }
    .modal {
      background: white; border-radius: 16px; width: 100%; max-width: 600px;
      max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: fadeUp 0.2s ease;
    }
    @keyframes fadeUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal__header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.5rem 1.5rem 1rem; border-bottom: 1px solid #f1f5f9;
    }
    .modal__header h2 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #1e293b; }
    .modal__close {
      background: none; border: none; cursor: pointer; font-size: 1rem;
      color: #94a3b8; width: 32px; height: 32px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
    }
    .modal__close:hover { background: #f1f5f9; color: #1e293b; }
    .modal__body { overflow-y: auto; flex: 1; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
    .tabs { display: flex; gap: 0.25rem; background: #f8fafc; padding: 0.25rem; border-radius: 10px; }
    .tab {
      flex: 1; padding: 0.5rem; border: none; background: none; border-radius: 7px;
      font-size: 0.8rem; font-weight: 500; cursor: pointer; color: #64748b; transition: all 0.15s;
    }
    .tab.active { background: white; color: #1e3a5f; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .tab-content { display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; }
    label { font-size: 0.8rem; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.03em; }
    .input {
      padding: 0.625rem 0.875rem; border: 1.5px solid #e2e8f0; border-radius: 8px;
      font-size: 0.875rem; outline: none; transition: all 0.15s; color: #1e293b; width: 100%; box-sizing: border-box;
    }
    .input:focus { border-color: #2d6a9f; box-shadow: 0 0 0 3px rgba(45,106,159,0.1); }
    .input--error { border-color: #ef4444; }
    .textarea { resize: vertical; min-height: 80px; font-family: inherit; }
    .modal__footer {
      display: flex; justify-content: flex-end; gap: 0.75rem;
      padding: 1rem 1.5rem; border-top: 1px solid #f1f5f9;
    }
    .btn {
      padding: 0.625rem 1.25rem; border-radius: 8px; border: none;
      font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.15s;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .btn--primary { background: #2d6a9f; color: white; }
    .btn--primary:hover:not(:disabled) { background: #1e3a5f; }
    .btn--primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn--secondary { background: #f1f5f9; color: #374151; }
    .btn--secondary:hover { background: #e2e8f0; }
    .spinner {
      width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }
  `]
})
export class ContactFormComponent implements OnInit, OnChanges {
  @Input() contact: Contact | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();

  form!: FormGroup;
  tab = 'info';
  loading = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void { this.buildForm(); }
  ngOnChanges(): void { if (this.form) this.buildForm(); }

  get f() { return this.form.controls; }

  buildForm(): void {
    const c = this.contact;
    this.form = this.fb.group({
      firstName: [c?.firstName || '', Validators.required],
      lastName: [c?.lastName || '', Validators.required],
      email: [c?.email || '', Validators.email],
      phone: [c?.phone || ''],
      mobile: [c?.mobile || ''],
      company: [c?.company || ''],
      jobTitle: [c?.jobTitle || ''],
      department: [c?.department || ''],
      birthday: [c?.birthday ? c.birthday.split('T')[0] : ''],
      notes: [c?.notes || ''],
      tagsInput: [c?.tags?.join(', ') || ''],
      groupsInput: [c?.groups?.join(', ') || ''],
      address: this.fb.group({
        street: [c?.address?.street || ''],
        city: [c?.address?.city || ''],
        state: [c?.address?.state || ''],
        zipCode: [c?.address?.zipCode || ''],
        country: [c?.address?.country || '']
      }),
      social: this.fb.group({
        linkedin: [c?.social?.linkedin || ''],
        twitter: [c?.social?.twitter || ''],
        facebook: [c?.social?.facebook || ''],
        website: [c?.social?.website || '']
      })
    });
  }

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.close.emit();
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const val = this.form.value;
    const payload: any = {
      firstName: val.firstName, lastName: val.lastName,
      email: val.email || null, phone: val.phone || null,
      mobile: val.mobile || null, company: val.company || null,
      jobTitle: val.jobTitle || null, department: val.department || null,
      birthday: val.birthday || null, notes: val.notes || null,
      tags: val.tagsInput ? val.tagsInput.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      groups: val.groupsInput ? val.groupsInput.split(',').map((g: string) => g.trim()).filter(Boolean) : [],
      address: val.address,
      social: val.social
    };

    this.loading = true;
    this.saved.emit(payload);
  }

  stopLoading(): void { this.loading = false; }
}
