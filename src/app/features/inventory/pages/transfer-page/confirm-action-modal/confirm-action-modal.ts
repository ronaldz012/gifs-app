import { Component, input, output } from '@angular/core';

/**
 * Generic confirmation modal for destructive actions.
 * The parent controls visibility; this component only emits actions.
 *
 * Usage:
 *   @if (showConfirmModal()) {
 *     <app-confirm-action-modal
 *       title="¿Cancelar recepción?"
 *       description="Esta acción revertirá el stock registrado."
 *       confirmLabel="Sí, revertir"
 *       [submitting]="submitting()"
 *       (confirm)="onConfirmRollback()"
 *       (close)="showConfirmModal.set(false)"
 *     />
 *   }
 **/
@Component({
  selector: 'app-confirm-action-modal',
  template: `
    <!-- Overlay -->
    <div
      class="fixed inset-0 bg-overlay z-40 flex items-end sm:items-center justify-center backdrop-blur-[2px]"
      (click)="close.emit()"
    >
      <!-- Sheet / Dialog -->
      <div
        class="confirm-enter w-full sm:w-auto sm:min-w-80 bg-bg-surface
               rounded-t-2xl sm:rounded-2xl shadow-lg z-50
               px-5 pt-5 pb-7 sm:pb-5"
        (click)="$event.stopPropagation()"
      >
        <!-- Handle (mobile) -->
        <div class="sm:hidden w-10 h-1 rounded-full bg-bg-muted mx-auto mb-5"></div>

        <p class="text-sm font-semibold text-text-main mb-1">{{ title() }}</p>
        <p class="text-xs text-text-soft mb-5">{{ description() }}</p>

        <div class="flex flex-col sm:flex-row gap-3">
          <button (click)="close.emit()" class="btn-secondary flex-1 py-2.5 rounded-xl">
            {{ cancelLabel() }}
          </button>
          <button
            (click)="confirm.emit()"
            [disabled]="submitting()"
            class="btn-danger flex-1 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            @if (submitting()) {
              <span class="opacity-70">{{ submittingLabel() }}</span>
            } @else {
              {{ confirmLabel() }}
            }
          </button>
        </div>

        <button
          (click)="close.emit()"
          class="w-full mt-3 py-2 text-xs text-text-soft hover:text-text-muted transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  `,
  styles: `
    @keyframes confirm-in {
      from {
        opacity: 0;
        transform: scaleY(0.9);
      }
      to {
        opacity: 1;
        transform: scaleY(1);
      }
    }
    .confirm-enter {
      animation: confirm-in 160ms ease both;
      transform-origin: top;
    }
  `,
})
export class ConfirmActionModal {
  // Content
  title = input<string>('¿Confirmar acción?');
  description = input<string>('Esta acción no se puede deshacer.');
  confirmLabel = input<string>('Confirmar');
  cancelLabel = input<string>('No, volver');
  submittingLabel = input<string>('Procesando...');

  // Style — permite cambiar el color del botón de confirmación según el contexto
  confirmButtonClass = input<string>('bg-feedback-error hover:opacity-90');

  // State
  submitting = input<boolean>(false);

  // Events
  confirm = output<void>();
  close = output<void>();
}
