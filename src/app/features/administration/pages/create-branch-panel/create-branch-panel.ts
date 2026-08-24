import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { applyWhen, form, FormField, minLength, required, schema } from '@angular/forms/signals';
import { UserAdminService } from '../../services/user-admin-service';
import { ToastService } from '@core/services/toast-service';
import { GetBranchDetailsResponse } from '../../dtos/branches/get-branch-details-response';
import {
  BranchType,
  BRANCH_TYPE_LABELS,
  CreateBranchRequest,
} from '../../dtos/branches/create-branch-request';

const typeSchema = schema<string>((c) => {
  required(c, { message: 'Seleccioná el tipo de sucursal' });
});

@Component({
  selector: 'app-create-branch-panel',
  imports: [FormField],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center">
      <div class="absolute inset-0 bg-overlay backdrop-blur-[1px]" (click)="onClose()"></div>

      <div
        class="relative z-10 w-full max-w-md mx-4 bg-bg-surface rounded-2xl border border-border shadow-xl animate-fade-in"
        (click)="$event.stopPropagation()"
      >
        <header class="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            @if (branchDetails()) {
              <span class="pill-info text-[10px]">Editando</span>
              <h2 class="text-base font-semibold text-text-main mt-1">Editar sucursal</h2>
            } @else {
              <span class="pill-success text-[10px]">Nueva</span>
              <h2 class="text-base font-semibold text-text-main mt-1">Crear sucursal</h2>
            }
          </div>
          <button
            type="button"
            (click)="onClose()"
            class="btn-icon hover:bg-bg-muted hover:text-text-main shrink-0"
            aria-label="Cerrar"
          >
            <span class="material-icons text-lg">close</span>
          </button>
        </header>

        <div class="px-5 space-y-4">
          <div class="flex flex-col gap-1">
            <label class="field-label">Nombre</label>
            <input
              type="text"
              [formField]="form.name"
              placeholder="Ej. Sucursal Central"
              autofocus
              class="w-full px-3 py-2 border rounded-lg text-sm text-text-main placeholder:text-text-soft bg-bg-surface font-medium outline-none transition-all focus:ring-2 focus:ring-accent-ui/20 focus:border-accent-ui"
              [class.border-border]="!(form.name().touched() && form.name().invalid())"
              [class.border-feedback-error-text]="form.name().touched() && form.name().invalid()"
            />
            @if (form.name().touched() && form.name().invalid()) {
              @for (error of form.name().errors(); track error.kind) {
                <span class="text-[10px] text-feedback-error-text">{{ error.message }}</span>
              }
            }
          </div>

          <div class="flex flex-col gap-1">
            <label class="field-label">Ubicación</label>
            <input
              type="text"
              [formField]="form.place"
              placeholder="Ej. Av. Principal #123"
              class="w-full px-3 py-2 border border-border rounded-lg text-sm text-text-main placeholder:text-text-soft bg-bg-surface font-medium outline-none transition-all focus:ring-2 focus:ring-accent-ui/20 focus:border-accent-ui"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="field-label">Teléfono</label>
            <input
              type="text"
              [formField]="form.phoneNumber"
              placeholder="Ej. 76543210"
              class="w-full px-3 py-2 border border-border rounded-lg text-sm text-text-main placeholder:text-text-soft bg-bg-surface font-medium outline-none transition-all focus:ring-2 focus:ring-accent-ui/20 focus:border-accent-ui"
            />
          </div>

          @if (!branchDetails()) {
            <div class="flex flex-col gap-1">
              <label class="field-label">
                Tipo de sucursal
                <span class="text-feedback-error-text">*</span>
              </label>
              <select
                [formField]="form.type"
                class="w-full px-3 py-2 border rounded-lg text-sm text-text-main placeholder:text-text-soft bg-bg-surface font-medium outline-none transition-all focus:ring-2 focus:ring-accent-ui/20 focus:border-accent-ui appearance-none cursor-pointer"
                [class.border-feedback-error-text]="form.type().touched() && form.type().invalid()"
                [class.border-border]="!(form.type().touched() && form.type().invalid())"
              >
                <option value="" disabled selected>Selecciona un tipo</option>
                @for (type of branchTypes; track type.value) {
                  <option [value]="type.value">{{ type.label }}</option>
                }
              </select>
              @if (form.type().touched() && form.type().invalid()) {
                @for (error of form.type().errors(); track error.kind) {
                  <span class="text-[10px] text-feedback-error-text">{{ error.message }}</span>
                }
              }
            </div>
          }

          @if (error()) {
            <div
              class="px-4 py-3 bg-feedback-error-bg/10 border border-feedback-error-text/20 rounded-lg text-xs text-feedback-error-text font-medium"
            >
              {{ error() }}
            </div>
          }
        </div>

        <footer class="flex items-center justify-end gap-2 px-5 py-4 border-t border-border mt-4">
          <button type="button" (click)="onClose()" class="btn-secondary btn-sm">Cancelar</button>
          <button
            type="button"
            (click)="onSubmit()"
            [disabled]="isSubmitting()"
            class="btn btn-primary btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            @if (isSubmitting()) {
              {{ branchDetails() ? 'Guardando...' : 'Creando...' }}
            } @else {
              {{ branchDetails() ? 'Guardar cambios' : 'Crear sucursal' }}
            }
          </button>
        </footer>
      </div>
    </div>
  `,
})
export default class CreateBranchPanel implements OnInit {
  private userAdminService = inject(UserAdminService);
  private toast = inject(ToastService);

  branchId = input<GUID>();
  branchDetails = input<GetBranchDetailsResponse>();

  close = output<void>();

  isSubmitting = signal(false);
  error = signal<string | null>(null);

  model = signal({
    name: '',
    place: '',
    phoneNumber: '',
    type: '',
    isCreating: true,
  });

  branchTypes = [
    { value: String(BranchType.Warehouse), label: BRANCH_TYPE_LABELS[BranchType.Warehouse] },
    { value: String(BranchType.PointOfSale), label: BRANCH_TYPE_LABELS[BranchType.PointOfSale] },
  ];

  form = form(this.model, (s) => {
    required(s.name, { message: 'Requerido' });
    minLength(s.name, 3, { message: 'Mínimo 3 caracteres' });
    applyWhen(s.type, ({ valueOf }) => valueOf(s.isCreating) === true, typeSchema);
  });

  ngOnInit() {
    const details = this.branchDetails();
    if (details) {
      this.model.set({
        name: details.name,
        place: details.place,
        phoneNumber: details.phoneNumber,
        type: '',
        isCreating: false,
      });
    }
  }

  onSubmit(): void {
    this.form().markAsTouched();
    this.form().markAsDirty();
    if (this.form().invalid()) return;

    this.isSubmitting.set(true);
    this.error.set(null);

    const m = this.model();
    const id = this.branchId();
    const payload: CreateBranchRequest = {
      name: m.name,
      place: m.place,
      phoneNumber: m.phoneNumber,
      ...(id ? {} : { type: Number(m.type) as BranchType }),
    };

    const request$ = id
      ? this.userAdminService.updateBranch(id, payload)
      : this.userAdminService.createBranch(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.close.emit();
      },
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        const e = err as { error?: { detail?: string; title?: string }; message?: string };
        const msg = e?.error?.detail || e?.error?.title || e?.message || 'Error al guardar la sucursal.';
        this.error.set(msg);
        this.toast.error(msg);
      },
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
