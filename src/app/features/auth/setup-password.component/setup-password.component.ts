import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { form, FormField, required, pattern, validate } from '@angular/forms/signals';
import { AuthService } from '../services/auth-service';

interface SetupForm {
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-setup-password',
  imports: [FormField, RouterLink],
  templateUrl: './setup-password.component.html',
})
export default class SetupPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  loading = signal(true);
  submitting = signal(false);
  token = signal('');
  email = signal('');
  tokenError = signal<string | null>(null);
  submitError = signal<string | null>(null);
  showPassword = signal(false);
  showConfirm = signal(false);

  model = signal<SetupForm>({ password: '', confirmPassword: '' });

  setupForm = form(this.model, (schemaPath) => {
    required(schemaPath.password, { message: 'La contraseña es requerida' });
    pattern(schemaPath.password, /^(?=.*[a-zA-Z])(?=.*\d).+$/, {
      message: 'Debe contener letras y números',
    });
    required(schemaPath.confirmPassword, { message: 'Confirma tu contraseña' });
    validate(schemaPath.confirmPassword, ({ value, valueOf }) => {
      if (value() !== valueOf(schemaPath.password)) {
        return { kind: 'mismatch', message: 'Las contraseñas no coinciden' };
      }
      return null;
    });
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      if (!code) {
        this.tokenError.set('Enlace inválido. No se encontró el código de verificación.');
        this.loading.set(false);
        return;
      }
      this.token.set(code);
      this.authService.verifyToken(code).subscribe({
        next: (res) => {
          if (res.valid) {
            this.email.set(res.email);
          } else {
            this.tokenError.set('Este enlace ha expirado o ya fue utilizado.');
          }
          this.loading.set(false);
        },
        error: () => {
          this.tokenError.set('Error al verificar el enlace. Intenta de nuevo.');
          this.loading.set(false);
        },
      });
    });
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.setupForm().invalid()) return;
    this.submitting.set(true);
    this.submitError.set(null);
    this.authService.completeSetup(this.token(), this.model().password).subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        this.submitError.set('Error al configurar la contraseña. Intenta de nuevo.');
        this.submitting.set(false);
      },
    });
  }

  toggleShowPassword() {
    this.showPassword.update(v => !v);
  }

  toggleShowConfirm() {
    this.showConfirm.update(v => !v);
  }
}
