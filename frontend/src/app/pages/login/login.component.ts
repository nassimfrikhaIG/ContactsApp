import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-left">
        <div class="auth-brand">
          <span class="auth-logo">&#9672;</span>
          <h1>ContactHub</h1>
          <p>Gérez vos contacts professionnels avec élégance et efficacité.</p>
        </div>
        <div class="auth-features">
          <div class="feature"><span>&#10003;</span> Import/Export CSV</div>
          <div class="feature"><span>&#10003;</span> Recherche avancée</div>
          <div class="feature"><span>&#10003;</span> Groupes &amp; Tags</div>
          <div class="feature"><span>&#10003;</span> Tableau de bord analytique</div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-card">
          <h2 class="auth-title">Connexion</h2>
          <p class="auth-subtitle">Bienvenue ! Connectez-vous à votre espace.</p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label>Email</label>
              <input type="email" formControlName="email" placeholder="vous&#64;exemple.com" class="input"
                [class.input--error]="form.get('email')?.invalid && form.get('email')?.touched">
              <span class="error" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
                Email invalide
              </span>
            </div>

            <div class="form-group">
              <label>Mot de passe</label>
              <div class="input-wrapper">
                <input [type]="showPass ? 'text' : 'password'" formControlName="password"
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" class="input"
                  [class.input--error]="form.get('password')?.invalid && form.get('password')?.touched">
                <button type="button" class="toggle-pass" (click)="showPass = !showPass">
                  {{ showPass ? '&#128584;' : '&#128065;' }}
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn--primary btn--full" [disabled]="loading">
              <span *ngIf="loading" class="spinner"></span>
              {{ loading ? 'Connexion...' : 'Se connecter' }}
            </button>
          </form>

     

          <p class="auth-switch">
            Pas encore de compte ? <a routerLink="/register">S'inscrire</a>
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
    .auth-features { margin-top: 3rem; display: flex; flex-direction: column; gap: 0.75rem; }
    .feature { display: flex; align-items: center; gap: 0.75rem; opacity: 0.9; }
    .feature span { background: rgba(255,255,255,0.2); width: 24px; height: 24px;
      border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; }
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
    .input-wrapper { position: relative; }
    .toggle-pass {
      position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; font-size: 1rem;
    }
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
    .auth-demo {
      margin: 1.5rem 0 1rem; padding: 0.875rem; background: #f0f9ff;
      border-radius: 8px; border: 1px solid #bae6fd; text-align: center;
    }
    .auth-demo p { margin: 0 0 0.375rem; font-size: 0.8rem; color: #64748b; }
    .auth-demo code { font-size: 0.85rem; color: #0369a1; font-weight: 600; }
    .auth-switch { text-align: center; font-size: 0.875rem; color: #64748b; margin: 0; }
    .auth-switch a { color: #2d6a9f; font-weight: 600; text-decoration: none; }
    @media (max-width: 768px) {
      .auth-left { display: none; }
      .auth-right { width: 100%; padding: 1.5rem; }
    }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  showPass = false;

  constructor(private fb: FormBuilder, private authService: AuthService,
              private router: Router, private toast: ToastService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    const { email, password } = this.form.value;
    this.authService.login(email, password).subscribe({
      next: () => { this.toast.success('Connexion réussie !'); this.router.navigate(['/contacts']); },
      error: (err) => { this.toast.error(err.error?.message || 'Erreur de connexion'); this.loading = false; }
    });
  }
}
