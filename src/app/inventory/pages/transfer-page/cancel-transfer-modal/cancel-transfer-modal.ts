import { Component, input, output } from '@angular/core';

/**
 * Modal to confirm cancellation of an outgoing transfer.
 * The parent controls visibility; this component only emits actions.
 *
 * Usage:
 *   @if (showCancelModal()) {
 *     <app-cancel-transfer-modal
 *       [submitting]="submitting()"
 *       (confirm)="onConfirmCancel()"
 *       (close)="showCancelModal.set(false)"
 *     />
 *   }
 */
@Component({
  selector: 'app-cancel-transfer-modal',
  template: `
    <!-- Overlay -->
    <div
      class="fixed inset-0 bg-black/30 z-40 flex items-end sm:items-center justify-center
             backdrop-blur-[2px]"
      (click)="close.emit()"
    >
      <!-- Sheet / Dialog -->
      <div
        class="confirm-enter w-full sm:w-auto sm:min-w-80 bg-white
               rounded-t-2xl sm:rounded-2xl shadow-xl z-50
               px-5 pt-5 pb-7 sm:pb-5"
        (click)="$event.stopPropagation()"
      >
        <!-- Handle (mobile) -->
        <div class="sm:hidden w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5"></div>

        <p class="text-sm font-semibold text-gray-800 mb-1">¿Cancelar transferencia?</p>
        <p class="text-xs text-gray-400 mb-5">Esta acción no se puede deshacer.</p>

        <div class="flex flex-col sm:flex-row gap-3">
          <button
            (click)="close.emit()"
            class="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500
                   text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            No, volver
          </button>
          <button
            (click)="confirm.emit()"
            [disabled]="submitting()"
            class="flex-1 py-2.5 rounded-xl bg-red-500 text-white
                   text-sm font-medium hover:bg-red-600 transition-colors
                   disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Sí, cancelar
          </button>
        </div>

        <button
          (click)="close.emit()"
          class="w-full mt-3 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  `,
  styles: `
    @keyframes confirm-in {
      from { opacity: 0; transform: scaleY(0.9); }
      to   { opacity: 1; transform: scaleY(1); }
    }
    .confirm-enter {
      animation: confirm-in 160ms ease both;
      transform-origin: top;
    }
  `,
})
export class CancelTransferModal {
  submitting = input<boolean>(false);

  confirm = output<void>();
  close   = output<void>();
}
