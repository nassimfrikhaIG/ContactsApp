import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-left">
        <div class="auth-brand">
          <span class="auth-logo">◈</span>
          <h1>ContactHub</h1>
          <p>Créez votre espace de gestion de contacts professionnels.</p>
        </div>
      </div>
      <div class="auth-right">
        <div class="auth-card">
          <h2 class="auth-title">Créer un compte</h2>
          <p class="auth-subtitle">Rejoignez ContactHub dès maintenant.</p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label>Nom complet</label>
              <input type="text" formControlName="name" placeholder="Jean Dupont" class="input"
                [class.input--error]="f['name'].invalid && f['name'].touched">
              <span class="error" *ngIf="f['name'].invalid && f['name'].touched">Nom requis</span>
            </div>

            <div class="form-group">
              <label>Email</label>
              <input type="email" formControlName="email" placeholder="vous&#64;exemple.com" class="input"
                [class.input--error]="f['email'].invalid && f['email'].touched">
              <span class="error" *ngIf="f['email'].invalid && f['email'].touched">Email invalide</span>
            </div>

            <div class="form-group">
              <label>Mot de passe</label>
              <input type="password" formControlName="password" placeholder="Min. 6 caractères" class="input"
                [class.input--error]="f['password'].invalid && f['password'].touched">
              <span class="error" *ngIf="f['password'].invalid && f['password'].touched">Min. 6 caractères</span>
            </div>

            <div class="form-group">
              <label>Confirmer le mot de passe</label>
              <input type="password" formControlName="confirmPassword" placeholder="Répétez le mot de passe" class="input"
                [class.input--error]="form.hasError('mismatch') && f['confirmPassword'].touched">
              <span class="error" *ngIf="form.hasError('mismatch') && f['confirmPassword'].touched">
                Les mots de passe ne correspondent pas
              </span>
            </div>

            <button type="submit" class="btn btn--primary btn--full" [disabled]="loading">
              <span *ngIf="loading" class="spinner"></span>
              {{ loading ? 'Création...' : "Créer le compte" }}
            </button>
          </form>

          <p class="auth-switch">
            Déjà un compte ? <a routerLink="/login">Se connecter</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: flex; min-height: 100vh; }
    .auth-left {
      flex: 1; background: linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%);
      display: flex; flex-direction: column; justify-content: center;
      padding: 4rem; color: white;
    }
    .auth-logo { font-size: 3rem; display: block; margin-bottom: 1rem; }
    .auth-left h1 { font-size: 2.5rem; font-weight: 800; margin: 0 0 1rem; }
    .auth-left p { opacity: 0.8; font-size: 1.1rem; line-height: 1.6; }
    .auth-right {
      width: 480px; display: flex; align-items: center; justify-content: center;
      padding: 2rem; background: #f8fafc;
    }
    .auth-card {
      background: white; border-radius: 16px; padding: 2.5rem;
      box-shadow: 0 4px 30px rgba(0,0,0,0.08); width: 100%;
    }
    .auth-title { font-size: 1.75rem; font-weight: 700; margin: 0 0 0.5rem; color: #1e293b; }
    .auth-subtitle { color: #64748b; margin: 0 0 2rem; }
    .auth-form { display: flex; flex-direction: column; gap: 1.25rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; }
    label { font-size: 0.875rem; font-weight: 500; color: #374151; }
    .input {
      padding: 0.75rem 1rem; border: 1.5px solid #e5e7eb; border-radius: 8px;
      font-size: 0.9rem; outline: none; transition: border-color 0.15s; width: 100%; box-sizing: border-box;
    }
    .input:focus { border-color: #2d6a9f; box-shadow: 0 0 0 3px rgba(45,106,159,0.1); }
    .input--error { border-color: #ef4444; }
    .error { font-size: 0.8rem; color: #ef4444; }
    .btn {
      padding: 0.75rem 1.5rem; border-radius: 8px; border: none;
      font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.15s;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    }
    .btn--primary { background: #2d6a9f; color: white; }
    .btn--primary:hover:not(:disabled) { background: #1e3a5f; transform: translateY(-1px); }
    .btn--primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn--full { width: 100%; margin-top: 0.5rem; }
    .spinner {
      width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .auth-switch { text-align: center; font-size: 0.875rem; color: #64748b; margin: 1.5rem 0 0; }
    .auth-switch a { color: #2d6a9f; font-weight: 600; text-decoration: none; }
    @media (max-width: 768px) { .auth-left { display: none; } .auth-right { width: 100%; padding: 1.5rem; } }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private authService: AuthService,
              private router: Router, private toast: ToastService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatch });
  }

  get f() { return this.form.controls; }

  passwordMatch(group: FormGroup) {
    const p = group.get('password')?.value;
    const cp = group.get('confirmPassword')?.value;
    return p === cp ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    const { name, email, password } = this.form.value;
    this.authService.register({ name, email, password }).subscribe({
      next: () => { this.toast.success('Compte créé avec succès !'); this.router.navigate(['/contacts']); },
      error: (err) => { this.toast.error(err.error?.message || 'Erreur lors de la création'); this.loading = false; }
    });
  }
}
