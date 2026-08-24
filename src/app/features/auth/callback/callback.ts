import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-callback',
  standalone: true,
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center gap-4 bg-bg-main p-6">
      <div class="w-8 h-8 border-4 border-border border-t-accent-ui rounded-full animate-spin"></div>
      <p class="text-sm font-medium text-text-muted">Procesando inicio de sesión...</p>
      @if (error()) {
        <p class="text-sm text-feedback-error-text max-w-sm text-center whitespace-pre-wrap">{{ error() }}</p>
        <button type="button" (click)="goLogin()" class="text-xs font-bold text-accent-ui hover:underline">Volver al login</button>
      }
    </div>
  `,
})
export default class Callback implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  error = signal('');

  ngOnInit(): void {
    const params = new URLSearchParams(window.location.search);
    const hasCode = params.has('code');
    const hasError = params.has('error');

    if (hasError) {
      const desc = params.get('error_description') || params.get('error') || 'Error de autenticación';
      this.error.set(decodeURIComponent(desc));
      history.replaceState({}, '', '/callback');
      return;
    }

    if (hasCode) {
      // Intercambio explícito PKCE: el SDK debe consumir ?code&state y guardar tokens
      this.auth.handleRedirectCallback().subscribe({
        next: () => {
          // Limpia query y navega; el SDK ya puso tokens en localstorage
          history.replaceState({}, '', '/callback');
          this.router.navigate(['/dashboard'], { replaceUrl: true });
        },
        error: (err) => {
          history.replaceState({}, '', '/callback');
          const msg =
            err?.error_description ||
            err?.error ||
            err?.message ||
            'No se pudo completar el inicio de sesión. El código expiró o el verifier se perdió.';
          this.error.set(`${msg}\nCerrá esta pestaña, limpiá localStorage/sessionStorage y volvé a iniciar sesión.`);
        },
      });
      return;
    }

    // Sin ?code: es un refresh directo a /callback — verifica sesión silenciosa
    this.auth.isAuthenticated$.subscribe((isAuth) => {
      if (isAuth) this.router.navigate(['/dashboard'], { replaceUrl: true });
      else this.router.navigate(['/login'], { replaceUrl: true });
    });
  }

  goLogin(): void {
    history.replaceState({}, '', '/login');
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
