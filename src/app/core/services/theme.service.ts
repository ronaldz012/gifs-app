// theme.service.ts
import { Injectable, signal, computed, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'erp-theme';

  private _theme = signal<Theme>(this.getInitialTheme());

  isDark = computed(() => this._theme() === 'dark');

  constructor() {
    effect(() => {
      const theme = this._theme();
      const html = document.documentElement;
      html.classList.toggle('dark', theme === 'dark');
      html.classList.toggle('light', theme === 'light');
      localStorage.setItem(this.STORAGE_KEY, theme);
    });
  }

  toggle() {
    this._theme.update(t => t === 'dark' ? 'light' : 'dark');
  }

  private getInitialTheme(): Theme {
    const stored = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}