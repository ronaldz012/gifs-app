import { Component, input, OnInit, output, signal } from '@angular/core';
import { form, FormField, minLength, required } from '@angular/forms/signals';
import { Size } from '../../dtos/sizes/size';
import { UpdateSizeDto } from '../../dtos/sizes/update-size-dto';

@Component({
  selector: 'app-edit-size',
  standalone: true,
  imports: [FormField],
  template: `
    <div class="bg-bg-surface border border-border rounded-lg shadow-lg p-4 w-72">
      <div class="flex justify-between items-center mb-4">
        <h3 class="section-title mb-0">Editar Talla</h3>
        <button (click)="closed.emit()" class="btn-icon hover:text-text-main">
          <span class="material-icons text-base">close</span>
        </button>
      </div>

      @if (serverError()) {
        <div class="badge-error w-full text-center mb-3 rounded-lg px-3 py-2 text-xs">
          {{ serverError() }}
        </div>
      }

      <div class="space-y-3">
        <div>
          <label class="field-label block">NOMBRE</label>
          <input
            type="text"
            [formField]="editForm.name"
            (input)="clearServerError()"
            placeholder="Ej. 42, M, XL..."
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

        <div>
          <label class="field-label block">ORDEN</label>
          <input
            type="number"
            [formField]="editForm.sortOrder"
            step="1"
            placeholder="0"
            class="w-full px-3 py-2 rounded-lg border border-border bg-bg-muted text-text-main text-sm
                   outline-none transition-all focus:ring-2 focus:ring-[--focus-ring]
                   focus:border-accent-ui placeholder:text-text-soft"
          />
        </div>

        <div class="flex gap-2 pt-1">
          <button
            type="button"
            (click)="closed.emit()"
            [disabled]="saving()"
            class="btn btn-secondary btn-sm flex-1"
          >
            Cancelar
          </button>
          <button
            type="button"
            (click)="save()"
            [disabled]="saving() || editForm().invalid()"
            class="btn btn-primary btn-sm flex-1"
          >
            {{ saving() ? 'Guardando...' : 'GUARDAR' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export default class EditSize implements OnInit {
  item = input.required<Size>();
  saving = input(false);

  saved = output<UpdateSizeDto>();
  closed = output<void>();

  serverError = signal<string | null>(null);

  model = signal({ name: '', sortOrder: 0 });

  editForm = form(this.model, (path) => {
    required(path.name, { message: 'El nombre es obligatorio' });
    minLength(path.name, 1, { message: 'Mínimo 1 carácter' });
  });

  ngOnInit(): void {
    this.model.set({ name: this.item().name, sortOrder: this.item().sortOrder });
  }

  get nameState() {
    return this.editForm.name();
  }

  get nameInvalid(): boolean {
    return this.nameState.touched() && this.nameState.invalid();
  }

  get nameError(): string {
    return this.nameState.errors()?.[0]?.message ?? '';
  }

  clearServerError(): void {
    this.serverError.set(null);
  }

  save(): void {
    if (this.editForm().invalid()) return;
    const { name, sortOrder } = this.model();
    this.saved.emit({ name, sortOrder });
  }
}
