import { Component, inject, input, output, signal } from '@angular/core';
import { CashRegisterService } from '@features/sales/services/cash-register-service';
import { CreateMovementDto } from '@features/sales/dtos/create-movement-dto';

@Component({
  selector: 'app-create-expense-modal',
  standalone: true,
  imports: [],
  template: `
    <div
      class="fixed inset-0 bg-overlay z-40 flex items-end sm:items-center justify-center backdrop-blur-[1px]"
      (click)="close.emit()"
    >
      <div
        class="modal-enter w-full sm:w-[420px] bg-bg-surface rounded-t-2xl sm:rounded-2xl shadow-lg z-50 px-5 pt-5 pb-7 sm:pb-5 max-h-[90vh] overflow-y-auto"
        (click)="$event.stopPropagation()"
      >
        <div class="sm:hidden w-10 h-1 rounded-full bg-bg-muted mx-auto mb-5"></div>

        <div class="flex items-center justify-between mb-5">
          <h3 class="text-base font-bold text-text-main">Nuevo Gasto</h3>
          <button type="button" class="btn-icon hover:bg-bg-muted" (click)="close.emit()">
            <span class="material-icons text-[18px]">close</span>
          </button>
        </div>

        <div class="space-y-4">
          <div class="flex flex-col gap-1.5">
            <label class="field-label">Monto (Bs)</label>
            <input
              #amountInput
              type="number"
              placeholder="0.00"
              (input)="amount.set(+$any($event.target).value)"
              class="w-full px-3 py-2.5 border border-border rounded-xl text-sm font-mono font-bold text-text-main bg-bg-surface focus:outline-none focus:border-accent-ui transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              [class.border-feedback-error-text]="submitted() && amount() <= 0"
              autofocus
            />
            @if (submitted() && amount() <= 0) {
              <span class="text-[10px] text-feedback-error-text">El monto debe ser mayor a 0</span>
            }
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="field-label">Descripción</label>
            <input
              #descInput
              type="text"
              placeholder="Ej. Compra de café, pasaje, etc."
              (input)="description.set($any($event.target).value)"
              class="w-full px-3 py-2.5 border border-border rounded-xl text-sm text-text-main bg-bg-surface focus:outline-none focus:border-accent-ui transition-all placeholder:text-text-soft"
              [class.border-feedback-error-text]="submitted() && !description().trim()"
            />
            @if (submitted() && !description().trim()) {
              <span class="text-[10px] text-feedback-error-text">La descripción es obligatoria</span>
            }
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            type="button"
            (click)="close.emit()"
            class="order-2 sm:order-1 flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-muted hover:bg-bg-muted transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            (click)="onSave()"
            [disabled]="saving()"
            class="order-1 sm:order-2 flex-1 py-2.5 bg-accent-ui text-white rounded-xl text-sm font-bold hover:bg-accent-ui/90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            @if (saving()) {
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            }
            Guardar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    @keyframes modal-in {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .modal-enter { animation: modal-in 180ms ease both; }
  `,
})
export default class CreateExpenseModal {
  saved = output<void>();
  close = output<void>();

  private cashRegisterService = inject(CashRegisterService);

  amount = signal(0);
  description = signal('');
  saving = signal(false);
  submitted = signal(false);

  onSave(): void {
    this.submitted.set(true);

    if (this.amount() <= 0 || !this.description().trim()) return;

    this.saving.set(true);

    const dto: CreateMovementDto = {
      amount: this.amount(),
      description: this.description().trim(),
      type: 'Outflow',
    };

    this.cashRegisterService.createMovement(dto).subscribe({
      next: () => {
        this.saved.emit();
        this.close.emit();
      },
      error: () => {
        this.saving.set(false);
        alert('Error al crear el gasto. Intente de nuevo.');
      }
    });
  }
}
