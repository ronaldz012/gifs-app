import { Component, input, OnInit, output, signal } from '@angular/core';
import { Observable } from 'rxjs';

export interface CheckActionResult {
  canProceed: boolean;
  reason?: string;
}

type CheckState = 'checking' | 'allowed' | 'denied' | 'error';

/**
 * Generic on-demand verification modal.
 * Opens in "checking" state, runs the provided check function, then either
 * enables the confirm button (allowed) or shows the blocking reason (denied).
 * The parent controls visibility and provides the check/execute functions.
 *
 * Usage:
 *   @if (showModal()) {
 *     <app-verify-action-modal
 *       title="¿Revertir recepción?"
 *       description="Se descontará el stock registrado."
 *       confirmLabel="Sí, revertir"
 *       [checkFn]="checkRollback"
 *       [executeFn]="executeRollback"
 *       [reasonMessages]="reasonMessages"
 *       (confirmed)="onConfirmed()"
 *       (closed)="showModal.set(false)"
 *     />
 *   }
 **/
@Component({
  selector: 'app-verify-action-modal',
  template: `
    <div
      class="fixed inset-0 bg-overlay z-40 flex items-end sm:items-center justify-center backdrop-blur-[2px]"
      (click)="close()"
    >
      <div
        class="confirm-enter w-full sm:w-auto sm:min-w-80 bg-bg-surface
               rounded-t-2xl sm:rounded-2xl shadow-lg z-50
               px-5 pt-5 pb-7 sm:pb-5"
        (click)="$event.stopPropagation()"
      >
        <div class="sm:hidden w-10 h-1 rounded-full bg-bg-muted mx-auto mb-5"></div>

        <!-- Checking -->
        @if (state() === 'checking') {
          <div class="flex flex-col items-center gap-3 py-6">
            <span
              class="w-7 h-7 rounded-full border-2 border-bg-muted border-t-accent-ui animate-spin"
            ></span>
            <p class="text-sm font-semibold text-text-main">{{ checkingLabel() }}</p>
            <p class="text-xs text-text-soft">{{ checkingDescription() }}</p>
          </div>
        }

        <!-- Allowed -->
        @if (state() === 'allowed') {
          <p class="text-sm font-semibold text-text-main mb-1">{{ title() }}</p>
          <p class="text-xs text-text-soft mb-5">{{ description() }}</p>
          <div class="flex flex-col sm:flex-row gap-3">
            <button
              (click)="close()"
              [disabled]="submitting()"
              class="btn-secondary flex-1 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {{ cancelLabel() }}
            </button>
            <button
              (click)="execute()"
              [disabled]="submitting()"
              [class]="
                confirmButtonClass() +
                ' flex-1 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed'
              "
            >
              @if (submitting()) {
                <span class="opacity-70">{{ submittingLabel() }}</span>
              } @else {
                {{ confirmLabel() }}
              }
            </button>
          </div>
        }

        <!-- Denied -->
        @if (state() === 'denied') {
          <p class="text-sm font-semibold text-text-main mb-1">{{ title() }}</p>
          <p class="text-xs text-text-soft mb-5">{{ deniedMessage() }}</p>
          <div class="flex">
            <button (click)="close()" class="btn-secondary flex-1 py-2.5 rounded-xl">
              Entendido
            </button>
          </div>
        }

        <!-- Error -->
        @if (state() === 'error') {
          <p class="text-sm font-semibold text-text-main mb-1">Error</p>
          <p class="text-xs text-text-soft mb-5">No se pudo verificar. Inténtalo de nuevo.</p>
          <div class="flex flex-col sm:flex-row gap-3">
            <button (click)="close()" class="btn-secondary flex-1 py-2.5 rounded-xl">Cerrar</button>
            <button (click)="check()" class="btn-primary flex-1 py-2.5 rounded-xl">
              Reintentar
            </button>
          </div>
        }
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
export class VerifyActionModal implements OnInit {
  // Content
  title = input<string>('¿Confirmar acción?');
  description = input<string>('Esta acción no se puede deshacer.');
  checkingLabel = input<string>('Verificando...');
  checkingDescription = input<string>('Consultando si se puede realizar.');
  confirmLabel = input<string>('Confirmar');
  cancelLabel = input<string>('No, volver');
  submittingLabel = input<string>('Procesando...');
  confirmButtonClass = input<string>('bg-feedback-error hover:opacity-90');

  // Behavior — parent must provide the observable-returning functions
  checkFn = input.required<() => Observable<CheckActionResult>>();
  executeFn = input.required<() => Observable<void>>();
  reasonMessages = input<Record<string, string>>({});

  // Events
  confirmed = output<void>();
  closed = output<void>();

  state = signal<CheckState>('checking');
  reason = signal<string | undefined>(undefined);
  submitting = signal(false);

  ngOnInit(): void {
    this.check();
  }

  check(): void {
    this.state.set('checking');
    this.checkFn()().subscribe({
      next: (result) => {
        if (result.canProceed) {
          this.state.set('allowed');
        } else {
          this.reason.set(result.reason);
          this.state.set('denied');
        }
      },
      error: () => this.state.set('error'),
    });
  }

  execute(): void {
    this.submitting.set(true);
    this.executeFn()().subscribe({
      next: () => {
        this.submitting.set(false);
        this.confirmed.emit();
      },
      error: () => this.submitting.set(false),
    });
  }

  deniedMessage(): string {
    const reason = this.reason();
    if (reason && this.reasonMessages()[reason]) {
      return this.reasonMessages()[reason];
    }
    return 'No se puede completar esta acción.';
  }

  close(): void {
    if (this.submitting()) return;
    this.closed.emit();
  }
}
