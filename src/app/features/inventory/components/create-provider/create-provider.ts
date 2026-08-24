import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  AfterViewInit,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { email, FormField, form, maxLength, minLength, required } from '@angular/forms/signals';
import { Provider } from '../../dtos/providers/provider';
import { ProviderService } from '@features/inventory/services/provider-service';
import { ToastService } from '@core/services/toast-service';

@Component({
  selector: 'app-create-provider',
  standalone: true,
  imports: [FormField],
  templateUrl: './create-provider.html',
})
export default class CreateProvider implements AfterViewInit {
  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;

  private providerService = inject(ProviderService);
  private toast = inject(ToastService);
  private elRef = inject(ElementRef);

  initialName = input.required<string>();
  created = output<Provider>();
  closed = output<void>();

  isLoading = signal(false);
  serverError = signal<string | null>(null);

  providerModel = signal({
    name: '',
    contactName: '',
    email: '',
    phoneNumber: '',
    address: '',
  });

  providerForm = form(this.providerModel, (path) => {
    required(path.name, { message: 'El nombre es obligatorio' });
    minLength(path.name, 2, { message: 'Mínimo 2 caracteres' });
    maxLength(path.name, 150, { message: 'Máximo 150 caracteres' });

    maxLength(path.contactName, 150, { message: 'Máximo 150 caracteres' });

    email(path.email, { message: 'Email inválido' });
    maxLength(path.email, 150, { message: 'Máximo 150 caracteres' });

    maxLength(path.phoneNumber, 30, { message: 'Máximo 30 caracteres' });

    maxLength(path.address, 250, { message: 'Máximo 250 caracteres' });
  });

  ngAfterViewInit(): void {
    this.providerModel.update((m) => ({ ...m, name: this.initialName() }));
    this.nameInput?.nativeElement.focus();
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    this.closed.emit();
  }

  @HostListener('focusout', ['$event'])
  onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as HTMLElement;
    if (this.isLoading()) return;
    if (!this.elRef.nativeElement.contains(next)) this.closed.emit();
  }

  get nameState() {
    return this.providerForm.name();
  }
  get emailState() {
    return this.providerForm.email();
  }

  get nameInvalid(): boolean {
    return this.nameState.touched() && this.nameState.invalid();
  }
  get emailInvalid(): boolean {
    return this.emailState.touched() && this.emailState.invalid();
  }

  get nameError(): string {
    return this.nameState.errors()?.[0]?.message ?? '';
  }
  get emailError(): string {
    return this.emailState.errors()?.[0]?.message ?? '';
  }

  clearServerError(): void {
    this.serverError.set(null);
  }

  save(): void {
    if (this.providerForm().invalid()) return;

    this.isLoading.set(true);
    const { name, contactName, email, phoneNumber, address } = this.providerModel();

    this.providerService
      .create({
        name,
        contactName: contactName || null,
        email: email || null,
        phoneNumber: phoneNumber || null,
        address: address || null,
      })
      .subscribe({
        next: (data) => {
          this.isLoading.set(false);
          this.created.emit(data);
          this.providerModel.set({
            name: '',
            contactName: '',
            email: '',
            phoneNumber: '',
            address: '',
          });
        },
        error: (err) => {
          this.isLoading.set(false);
          if (err.status === 409) this.serverError.set('Este proveedor ya existe');
          else {
            const msg = err?.error?.detail || err?.error?.title || err?.message || 'Error al crear el proveedor.';
            this.toast.error(msg);
          }
        },
      });
  }
}