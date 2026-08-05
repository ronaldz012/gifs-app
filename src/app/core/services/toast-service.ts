import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

const DEFAULT_DURATION_MS = 3000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<ToastItem[]>([]);

  private nextId = 0;

  success(message: string, durationMs: number = DEFAULT_DURATION_MS): void {
    this.show(message, 'success', durationMs);
  }

  error(message: string, durationMs: number = DEFAULT_DURATION_MS): void {
    this.show(message, 'error', durationMs);
  }

  warning(message: string, durationMs: number = DEFAULT_DURATION_MS): void {
    this.show(message, 'warning', durationMs);
  }

  info(message: string, durationMs: number = DEFAULT_DURATION_MS): void {
    this.show(message, 'info', durationMs);
  }

  private show(message: string, type: ToastType, durationMs: number): void {
    const toast: ToastItem = { id: this.nextId++, message, type };
    this.toasts.update((list) => [...list, toast]);

    setTimeout(() => this.dismiss(toast.id), durationMs);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
