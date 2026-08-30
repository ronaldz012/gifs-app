import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { SessionService } from '@features/auth/services/session-service';
import { BranchContextService } from '@core/services/branch-context-service';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center gap-4 bg-bg-main p-6">
      @if (state() === 'loading' || state() === 'retrying') {
        <div class="w-8 h-8 border-4 border-border border-t-accent-ui rounded-full animate-spin"></div>
        <p class="text-sm font-medium text-text-muted">Procesando inicio de sesión...</p>
        @if (state() === 'retrying') {
          <div class="mt-2 flex items-center gap-2 rounded-lg border border-feedback-warning/30 bg-feedback-warning/10 px-4 py-2 text-sm text-feedback-warning-text">
            <span class="h-4 w-4 border-2 border-feedback-warning/30 border-t-feedback-warning rounded-full animate-spin"></span>
            Reintentando conexión... intento {{ attempt() + 1 }}/3
            <button type="button" (click)="tryRestore(0)" class="ml-2 text-xs font-bold text-accent-ui hover:underline">Reintentar ahora</button>
          </div>
        }
      } @else if (state() === 'error') {
        <span class="material-icons text-4xl text-feedback-error-text">wifi_off</span>
        <p class="text-sm font-bold text-text-main">No pudimos conectar con el servidor</p>
        <p class="text-sm text-text-muted max-w-sm text-center whitespace-pre-wrap">{{ error() }}</p>
        <div class="flex gap-3 mt-2">
          <button type="button" (click)="tryRestore(0)" class="btn-primary btn-sm">Reintentar</button>
          <a routerLink="/login" class="btn-secondary btn-sm">Volver al login</a>
        </div>
      } @else if (error()) {
        <p class="text-sm text-feedback-error-text max-w-sm text-center whitespace-pre-wrap">{{ error() }}</p>
        <button type="button" (click)="goLogin()" class="text-xs font-bold text-accent-ui hover:underline">Volver al login</button>
      }
    </div>
  `,
})
export default class Callback implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private session = inject(SessionService);
  private branchContext = inject(BranchContextService);
  error = signal('');
  state = signal<'loading' | 'retrying' | 'error' | 'idle'>('loading');
  attempt = signal(0);
  private backoffs = [1000, 2000, 4000];

  ngOnInit(): void {
    const params = new URLSearchParams(window.location.search);
    const hasCode = params.has('code');
    const hasError = params.has('error');

    if (hasError) {
      const desc = params.get('error_description') || params.get('error') || 'Error de autenticación';
      this.error.set(decodeURIComponent(desc));
      history.replaceState({}, '', '/callback');
      this.state.set('idle');
      return;
    }

    if (hasCode) {
      this.auth.handleRedirectCallback().subscribe({
        next: () => {
          history.replaceState({}, '', '/callback');
          this.tryRestore(0);
        },
        error: (err) => {
          history.replaceState({}, '', '/callback');
          const msg = err?.error_description || err?.error || err?.message || 'No se pudo completar el inicio de sesión.';
          this.error.set(msg);
          this.state.set('idle');
        },
      });
      return;
    }

    this.auth.isAuthenticated$.subscribe((isAuth) => {
      if (isAuth) this.tryRestore(0);
      else this.router.navigate(['/login'], { replaceUrl: true });
    });
  }

  tryRestore(attempt: number): void {
    this.attempt.set(attempt);
    this.state.set(attempt === 0 ? 'loading' : 'retrying');
    this.error.set('');
    this.session.restore().subscribe({
      next: () => {
        this.router.navigate(['/'], { replaceUrl: true });
      },
      error: (err: { status?: number; error?: { detail?: string; title?: string }; message?: string; name?: string }) => {
        const status = err?.status;
        if (status === 403 || (status === 401 && (err as { error?: { reason?: string } })?.error?.reason === 'deactivated')) {
          this.error.set('Tu cuenta fue desactivada. Contactá a tu administrador.');
          this.state.set('idle');
          setTimeout(() => this.router.navigate(['/login'], { queryParams: { reason: 'deactivated' }, replaceUrl: true }), 2500);
          return;
        }
        const isNetwork = status === 0 || status === undefined || status >= 500 || err?.name === 'TimeoutError';
        if (isNetwork) {
          if (attempt < this.backoffs.length) {
            setTimeout(() => this.tryRestore(attempt + 1), this.backoffs[attempt]);
          } else {
            this.error.set('Verificá tu conexión o que el servidor esté arriba.');
            this.state.set('error');
          }
          return;
        }
        this.error.set(err?.error?.detail || err?.error?.title || err?.message || 'No se pudo completar el inicio de sesión.');
        this.state.set('error');
      },
    });
  }

  goLogin(): void {
    history.replaceState({}, '', '/login');
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
