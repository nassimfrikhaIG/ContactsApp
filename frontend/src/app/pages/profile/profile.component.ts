import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { NavbarComponent } from '../../components/shared/navbar/navbar.component';
import { User } from '../../models/contact.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="profile-page">
      <div class="profile-container">
        <h1 class="page-title">Mon profil</h1>

        <div class="profile-grid">
          <!-- Avatar card -->
          <div class="profile-card profile-card--avatar">
            <div class="big-avatar" [style.background]="getAvatarColor()">{{ getInitials() }}</div>
            <h2>{{ user?.name }}</h2>
            <p>{{ user?.email }}</p>
            <span class="role-badge" [class.role-badge--admin]="user?.role === 'admin'">
              {{ user?.role === 'admin' ? '⚙ Administrateur' : '👤 Utilisateur' }}
            </span>
            <p class="joined-date" *ngIf="user?.createdAt">
              Membre depuis {{ user?.createdAt | date:'MMMM yyyy' }}
            </p>
          </div>

          <!-- Edit profile -->
          <div class="profile-card">
            <h3>Informations personnelles</h3>
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="form">
              <div class="form-group">
                <label>Nom complet</label>
                <input type="text" formControlName="name" class="input" placeholder="Votre nom">
              </div>
              <div class="form-group">
                <label>Adresse email</label>
                <input type="email" formControlName="email" class="input" placeholder="votre&#64;email.com">
              </div>
              <button type="submit" class="btn btn--primary" [disabled]="savingProfile">
                <span *ngIf="savingProfile" class="spinner"></span>
                {{ savingProfile ? 'Enregistrement...' : 'Sauvegarder' }}
              </button>
            </form>
          </div>

          <!-- Change password -->
          <div class="profile-card">
            <h3>Changer le mot de passe</h3>
            <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="form">
              <div class="form-group">
                <label>Mot de passe actuel</label>
                <input type="password" formControlName="currentPassword" class="input">
              </div>
              <div class="form-group">
                <label>Nouveau mot de passe</label>
                <input type="password" formControlName="newPassword" class="input">
                <span class="hint">Minimum 6 caractères</span>
              </div>
              <div class="form-group">
                <label>Confirmer le nouveau mot de passe</label>
                <input type="password" formControlName="confirmPassword" class="input"
                  [class.input--error]="passwordForm.hasError('mismatch') && passwordForm.get('confirmPassword')?.touched">
              </div>
              <button type="submit" class="btn btn--primary" [disabled]="savingPassword">
                <span *ngIf="savingPassword" class="spinner"></span>
                {{ savingPassword ? 'Changement...' : 'Changer le mot de passe' }}
              </button>
            </form>
          </div>

          <!-- Account info -->
          <div class="profile-card">
            <h3>Informations du compte</h3>
            <div class="info-list">
              <div class="info-row">
                <span class="info-key">Identifiant</span>
                <span class="info-val monospace">{{ user?._id }}</span>
              </div>
              <div class="info-row">
                <span class="info-key">Rôle</span>
                <span class="info-val">{{ user?.role }}</span>
              </div>
              <div class="info-row">
                <span class="info-key">Dernière connexion</span>
                <span class="info-val">{{ user?.lastLogin ? (user?.lastLogin | date:'dd/MM/yyyy HH:mm') : 'N/A' }}</span>
              </div>
            </div>
            <div class="danger-zone">
              <h4>Zone dangereuse</h4>
              <button class="btn btn--danger btn--outline-danger" (click)="authService.logout()">
                ⏻ Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { padding-top: 64px; min-height: 100vh; background: #f8fafc; }
    .profile-container { max-width: 900px; margin: 0 auto; padding: 2rem; }
    .page-title { font-size: 1.75rem; font-weight: 800; color: #1e293b; margin: 0 0 1.5rem; }
    .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .profile-card {
      background: white; border-radius: 12px; padding: 1.5rem;
      border: 1.5px solid #e2e8f0;
    }
    .profile-card--avatar {
      grid-column: span 2; display: flex; flex-direction: column;
      align-items: center; text-align: center; padding: 2rem;
    }
    .big-avatar {
      width: 80px; height: 80px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 1.75rem; font-weight: 700; margin-bottom: 1rem;
    }
    .profile-card--avatar h2 { margin: 0 0 0.375rem; font-size: 1.5rem; font-weight: 700; color: #1e293b; }
    .profile-card--avatar p { margin: 0 0 0.75rem; color: #64748b; }
    .role-badge {
      padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600;
      background: #e0f2fe; color: #0369a1;
    }
    .role-badge--admin { background: #fef3c7; color: #92400e; }
    .joined-date { font-size: 0.8rem; color: #94a3b8; margin: 0.75rem 0 0; }
    .profile-card h3 { margin: 0 0 1.25rem; font-size: 0.9rem; font-weight: 700; color: #1e293b; }
    .form { display: flex; flex-direction: column; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; }
    label { font-size: 0.8rem; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.03em; }
    .input {
      padding: 0.625rem 0.875rem; border: 1.5px solid #e2e8f0; border-radius: 8px;
      font-size: 0.875rem; outline: none; transition: all 0.15s; width: 100%; box-sizing: border-box;
    }
    .input:focus { border-color: #2d6a9f; box-shadow: 0 0 0 3px rgba(45,106,159,0.1); }
    .input--error { border-color: #ef4444; }
    .hint { font-size: 0.75rem; color: #94a3b8; }
    .btn {
      padding: 0.625rem 1.25rem; border-radius: 8px; border: none;
      font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.15s;
      display: inline-flex; align-items: center; gap: 0.5rem; width: fit-content; margin-top: 0.5rem;
    }
    .btn--primary { background: #2d6a9f; color: white; }
    .btn--primary:hover:not(:disabled) { background: #1e3a5f; }
    .btn--primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn--danger { background: #ef4444; color: white; }
    .btn--outline-danger { background: white; border: 1.5px solid #ef4444; color: #ef4444; }
    .spinner {
      width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .info-list { display: flex; flex-direction: column; gap: 0.875rem; }
    .info-row { display: flex; flex-direction: column; gap: 0.25rem; }
    .info-key { font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; }
    .info-val { font-size: 0.875rem; color: #1e293b; }
    .monospace { font-family: monospace; font-size: 0.75rem; }
    .danger-zone { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #fee2e2; }
    .danger-zone h4 { margin: 0 0 0.875rem; font-size: 0.8rem; color: #ef4444; text-transform: uppercase; letter-spacing: 0.04em; }
    @media (max-width: 768px) {
      .profile-grid { grid-template-columns: 1fr; }
      .profile-card--avatar { grid-column: span 1; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  savingProfile = false;
  savingPassword = false;

  constructor(public authService: AuthService, private fb: FormBuilder, private toast: ToastService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => {
      this.user = u;
      if (u) {
        this.profileForm = this.fb.group({
          name: [u.name, Validators.required],
          email: [u.email, [Validators.required, Validators.email]]
        });
      }
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: (g: any) => g.get('newPassword').value === g.get('confirmPassword').value ? null : { mismatch: true } });
  }

  getInitials(): string {
    return this.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  }

  getAvatarColor(): string {
    const colors = ['#4f46e5','#7c3aed','#db2777','#2563eb','#059669'];
    return colors[(this.user?.name?.charCodeAt(0) || 0) % colors.length];
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.savingProfile = true;
    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => { this.toast.success('Profil mis à jour !'); this.savingProfile = false; },
      error: (err) => { this.toast.error(err.error?.message || 'Erreur'); this.savingProfile = false; }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    this.savingPassword = true;
    const { currentPassword, newPassword } = this.passwordForm.value;
    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.toast.success('Mot de passe changé !');
        this.passwordForm.reset();
        this.savingPassword = false;
      },
      error: (err) => { this.toast.error(err.error?.message || 'Erreur'); this.savingPassword = false; }
    });
  }
}
