import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toasts"
        class="toast toast--{{ toast.type }}"
        (click)="toastService.remove(toast.id)"
      >
        <span class="toast__icon">{{ getIcon(toast.type) }}</span>
        <span class="toast__message">{{ toast.message }}</span>
        <button class="toast__close" (click)="toastService.remove(toast.id)">✕</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 380px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      cursor: pointer;
      animation: slideIn 0.3s ease;
      font-size: 0.875rem;
      font-weight: 500;
    }
    @keyframes slideIn {
      from { transform: translateX(110%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .toast--success { background: #10b981; color: white; }
    .toast--error { background: #ef4444; color: white; }
    .toast--warning { background: #f59e0b; color: white; }
    .toast--info { background: #3b82f6; color: white; }
    .toast__message { flex: 1; }
    .toast__icon { font-size: 1rem; }
    .toast__close { background: none; border: none; color: inherit; cursor: pointer; opacity: 0.8; font-size: 0.875rem; padding: 0; }
    .toast__close:hover { opacity: 1; }
  `]
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(public toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toasts$.subscribe(toasts => this.toasts = toasts);
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      success: '✓', error: '✕', warning: '⚠', info: 'ℹ'
    };
    return icons[type] || 'ℹ';
  }
}
