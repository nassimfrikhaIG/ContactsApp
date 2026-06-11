import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="not-found">
      <div class="not-found__content">
        <div class="not-found__code">404</div>
        <h1>Page introuvable</h1>
        <p>La page que vous cherchez n'existe pas ou a été déplacée.</p>
        <a routerLink="/contacts" class="btn">Retour aux contacts</a>
      </div>
    </div>
  `,
  styles: [`
    .not-found {
      min-height: 100vh; display: flex; align-items: center;
      justify-content: center; background: #f8fafc;
      text-align: center; padding: 2rem;
    }
    .not-found__content { max-width: 400px; }
    .not-found__code {
      font-size: 8rem; font-weight: 900; line-height: 1; margin-bottom: 1rem;
      background: linear-gradient(135deg, #2d6a9f, #1e3a5f);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    h1 { font-size: 1.75rem; font-weight: 700; color: #1e293b; margin: 0 0 0.75rem; }
    p { color: #64748b; margin: 0 0 2rem; line-height: 1.6; }
    .btn {
      display: inline-flex; align-items: center; padding: 0.75rem 2rem;
      background: #2d6a9f; color: white; border-radius: 8px;
      text-decoration: none; font-weight: 600; transition: all 0.15s;
    }
    .btn:hover { background: #1e3a5f; transform: translateY(-1px); }
  `]
})
export class NotFoundComponent {}
