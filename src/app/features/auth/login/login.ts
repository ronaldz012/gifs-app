import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { ConnectivityService } from '@core/services/connectivity-service';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
})
export default class Login implements OnInit {
  private auth0 = inject(Auth0Service);
  private connectivity = inject(ConnectivityService);

  loading = signal(false);
  checking = signal(true);
  errorMessage = signal<string | null>(null);
  canLogin = signal(false);

  constructor() {
    effect(() => {
      if (this.connectivity.isOnline()) {
        if (!this.checking()) {
          this.errorMessage.set(null);
          this.canLogin.set(true);
        }
      } else {
        this.canLogin.set(false);
        if (!this.checking()) this.errorMessage.set('Sin conexión. Revisá tu conexión a internet.');
      }
    });
  }

  ngOnInit(): void {
    this.checkConnectivity();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.checkConnectivity());
      window.addEventListener('offline', () => {
        this.canLogin.set(false);
        this.checking.set(false);
        this.errorMessage.set('Sin conexión. Revisá tu conexión a internet.');
      });
    }
  }

  private checkConnectivity(): void {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.canLogin.set(false);
      this.checking.set(false);
      this.errorMessage.set('Sin conexión. Revisá tu conexión a internet.');
      this.connectivity.reportFailure();
      return;
    }
    this.checking.set(true);
    this.errorMessage.set(null);
    this.connectivity.checkNow().subscribe((ok) => {
      this.checking.set(false);
      if (ok) {
        this.canLogin.set(true);
        this.errorMessage.set(null);
      } else {
        this.canLogin.set(false);
        this.errorMessage.set('Sin conexión. Revisá tu conexión a internet.');
      }
    });
  }

  onLogin(): void {
    if (!this.canLogin() || this.checking()) {
      this.errorMessage.set('Sin conexión. Revisá tu conexión a internet.');
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);
    this.auth0.loginWithRedirect().subscribe({
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Error al iniciar sesión. Intentá de nuevo.');
      },
    });
  }

  retry(): void {
    this.checkConnectivity();
  }
}
