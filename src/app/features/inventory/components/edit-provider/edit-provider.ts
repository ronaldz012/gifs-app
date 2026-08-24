import { Component, input, OnInit, output, signal } from '@angular/core';
import { email, FormField, form, maxLength, minLength, required } from '@angular/forms/signals';
import { Provider } from '../../dtos/providers/provider';
import { UpdateProviderDto } from '../../dtos/providers/update-provider-dto';

@Component({
  selector: 'app-edit-provider',
  standalone: true,
  imports: [FormField],
  template: `
    <div class="fixed inset-0 bg-overlay z-40 flex items-end sm:items-center justify-center backdrop-blur-[2px]" (click)="closed.emit()">
      <div class="modal-enter w-full sm:w-[480px] bg-bg-surface rounded-t-2xl sm:rounded-2xl shadow-lg z-50 px-5 pt-5 pb-7 sm:pb-5 max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        <div class="sm:hidden w-10 h-1 rounded-full bg-bg-muted mx-auto mb-5"></div>
        <div class="bg-bg-surface p-0">
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="section-title mb-0">Editar Proveedor</h3>
        <button (click)="closed.emit()" class="btn-icon hover:text-text-main">
          <span class="material-icons text-base">close</span>
        </button>
      </div>

      <!-- Error servidor -->
      @if (serverError()) {
        <div class="badge-error w-full text-center mb-3 rounded-lg px-3 py-2 text-xs">
          {{ serverError() }}
        </div>
      }

      <div class="space-y-3">
        <!-- Nombre -->
        <div>
          <label for="name" class="field-label block">NOMBRE</label>
          <input
            id="name"
            type="text"
            [formField]="editForm.name"
            (input)="clearServerError()"
            placeholder="Ej. Textiles Bolívar"
            autocomplete="off"
            class="w-full px-3 py-2 rounded-lg border bg-bg-muted text-text-main text-sm
                   outline-none transition-all focus:ring-2 focus:ring-[--focus-ring]
                   focus:border-accent-ui placeholder:text-text-soft"
            [class.border-feedback-error-text]="nameInvalid"
            [class.border-border]="!nameInvalid"
          />
          @if (nameInvalid) {
            <p class="text-[10px] text-feedback-error-text mt-1">{{ nameError }}</p>
          }
        </div>

        <!-- Contacto -->
        <div>
          <label for="contactName" class="field-label block">
            CONTACTO <span class="text-text-soft normal-case font-normal">(opcional)</span>
          </label>
          <input
            id="contactName"
            type="text"
            [formField]="editForm.contactName"
            placeholder="Nombre de la persona de contacto"
            autocomplete="off"
            class="w-full px-3 py-2 rounded-lg border border-border bg-bg-muted text-text-main text-sm
                   outline-none transition-all focus:ring-2 focus:ring-[--focus-ring]
                   focus:border-accent-ui placeholder:text-text-soft"
          />
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="field-label block">
            EMAIL <span class="text-text-soft normal-case font-normal">(opcional)</span>
          </label>
          <input
            id="email"
            type="text"
            [formField]="editForm.email"
            placeholder="contacto@empresa.com"
            autocomplete="off"
            class="w-full px-3 py-2 rounded-lg border bg-bg-muted text-text-main text-sm
                   outline-none transition-all focus:ring-2 focus:ring-[--focus-ring]
                   focus:border-accent-ui placeholder:text-text-soft"
            [class.border-feedback-error-text]="emailInvalid"
            [class.border-border]="!emailInvalid"
          />
          @if (emailInvalid) {
            <p class="text-[10px] text-feedback-error-text mt-1">{{ emailError }}</p>
          }
        </div>

        <!-- Teléfono -->
        <div>
          <label for="phoneNumber" class="field-label block">
            TELÉFONO <span class="text-text-soft normal-case font-normal">(opcional)</span>
          </label>
          <input
            id="phoneNumber"
            type="text"
            [formField]="editForm.phoneNumber"
            placeholder="+591 70000000"
            autocomplete="off"
            class="w-full px-3 py-2 rounded-lg border border-border bg-bg-muted text-text-main text-sm
                   outline-none transition-all focus:ring-2 focus:ring-[--focus-ring]
                   focus:border-accent-ui placeholder:text-text-soft"
          />
        </div>

        <!-- Dirección -->
        <div>
          <label for="address" class="field-label block">
            DIRECCIÓN <span class="text-text-soft normal-case font-normal">(opcional)</span>
          </label>
          <input
            id="address"
            type="text"
            [formField]="editForm.address"
            placeholder="Calle, zona, ciudad..."
            autocomplete="off"
            class="w-full px-3 py-2 rounded-lg border border-border bg-bg-muted text-text-main text-sm
                   outline-none transition-all focus:ring-2 focus:ring-[--focus-ring]
                   focus:border-accent-ui placeholder:text-text-soft"
          />
        </div>

        <!-- Acciones -->
        <div class="flex flex-col sm:flex-row gap-3 pt-2">
          <button type="button" (click)="closed.emit()" [disabled]="saving()" class="btn-secondary flex-1 py-2.5 rounded-xl">Cancelar</button>
          <button type="button" (click)="save()" [disabled]="saving() || editForm().invalid()" class="btn-primary flex-1 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed">
            {{ saving() ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    @keyframes modal-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    .modal-enter { animation: modal-in 180ms ease both; }
  `,
})
export default class EditProvider implements OnInit {
  item = input.required<Provider>();
  saving = input(false);

  saved = output<UpdateProviderDto>();
  closed = output<void>();

  serverError = signal<string | null>(null);

  model = signal({
    name: '',
    contactName: '',
    email: '',
    phoneNumber: '',
    address: '',
  });

  editForm = form(this.model, (path) => {
    required(path.name, { message: 'El nombre es obligatorio' });
    minLength(path.name, 2, { message: 'Mínimo 2 caracteres' });
    maxLength(path.name, 150, { message: 'Máximo 150 caracteres' });

    maxLength(path.contactName, 150, { message: 'Máximo 150 caracteres' });

    email(path.email, { message: 'Email inválido' });
    maxLength(path.email, 150, { message: 'Máximo 150 caracteres' });

    maxLength(path.phoneNumber, 30, { message: 'Máximo 30 caracteres' });

    maxLength(path.address, 250, { message: 'Máximo 250 caracteres' });
  });

  ngOnInit(): void {
    const p = this.item();
    this.model.set({
      name: p.name,
      contactName: p.contactName ?? '',
      email: p.email ?? '',
      phoneNumber: p.phoneNumber ?? '',
      address: p.address ?? '',
    });
  }

  get nameState() {
    return this.editForm.name();
  }
  get emailState() {
    return this.editForm.email();
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
    if (this.editForm().invalid()) return;
    const { name, contactName, email, phoneNumber, address } = this.model();
    this.saved.emit({
      name,
      contactName: contactName || null,
      email: email || null,
      phoneNumber: phoneNumber || null,
      address: address || null,
    });
  }
}
