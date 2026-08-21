import { Component, inject, signal } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
})
export default class Login {
  private auth0 = inject(Auth0Service);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  onLogin() {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.auth0.loginWithRedirect().subscribe({
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Error al iniciar sesión. Intenta de nuevo.');
      },
    });
  }
}
