import { Component, input, output } from '@angular/core';

/**
 * Modal to resolve an incoming transfer (complete or reject).
 * The parent controls visibility; this component only emits actions.
 *
 * Usage:
 *   @if (showResolveModal()) {
 *     <app-resolve-transfer-modal
 *       (resolve)="onResolve($event)"
 *       (close)="showResolveModal.set(false)"
 *     />
 *   }
 */
@Component({
  selector: 'app-resolve-transfer-modal',
  template: `
    <!-- Overlay -->
    <div
      class="fixed inset-0 bg-overlay z-40 flex items-end sm:items-center justify-center
             backdrop-blur-[2px]"
      (click)="close.emit()"
    >
      <!-- Sheet / Dialog -->
      <div
        class="confirm-enter w-full sm:w-auto sm:min-w-80 bg-bg-surface
               rounded-t-2xl sm:rounded-2xl shadow-xl z-50
               px-5 pt-5 pb-7 sm:pb-5"
        (click)="$event.stopPropagation()"
      >
        <!-- Handle (mobile) -->
        <div class="sm:hidden w-10 h-1 rounded-full bg-bg-muted mx-auto mb-5"></div>

        <p class="text-sm font-semibold text-text-main mb-1">Resolver transferencia</p>
        <p class="text-xs text-text-soft mb-5">
          Seleccioná qué acción tomar sobre esta transferencia entrante.
        </p>

        <div class="flex flex-col sm:flex-row gap-3">
          <button
            (click)="resolve.emit('reject')"
            [disabled]="submitting()"
            class="flex-1 py-2.5 rounded-xl border border-feedback-error-text/30 text-feedback-error-text
                   text-sm font-medium hover:bg-feedback-error transition-colors
                   disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Rechazar
          </button>
          <button
            (click)="resolve.emit('complete')"
            [disabled]="submitting()"
            class="flex-1 py-2.5 rounded-xl bg-btn-primary-bg text-btn-primary-text
                   text-sm font-medium hover:bg-btn-primary-hover transition-colors
                   disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Completar
          </button>
        </div>

        <button
          (click)="close.emit()"
          class="w-full mt-3 py-2 text-xs text-text-soft hover:text-text-muted transition-colors"
        >
          Cancelar
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
export class ResolveTransferModal {
  submitting = input<boolean>(false);

  resolve = output<'complete' | 'reject'>();
  close = output<void>();
}
