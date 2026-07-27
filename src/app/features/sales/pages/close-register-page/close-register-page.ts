import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CashRegisterService } from '@features/sales/services/cash-register-service';
import { CurrentRegisterDto } from '@features/sales/dtos/current-register-dto';
import { ClosureDetailDto } from '@features/sales/dtos/closure-detail-dto';
import SkeletonList from '@shared/ui/skeleton-list/skeleton-list';

@Component({
  selector: 'app-close-register-page',
  standalone: true,
  imports: [DecimalPipe, DatePipe, RouterLink, SkeletonList],
  styles: `
    @keyframes fade-up {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fade-up 240ms ease both; }
  `,
  template: `
    <div class="max-w-3xl mx-auto fade-up">

      @if (state() === 'init') {
        <app-skeleton-list [rows]="3" [columns]="2" />

      } @else if (state() === 'already-closed') {
        <div class="flex flex-col items-center gap-3 p-12 rounded-xl border border-border bg-bg-surface shadow-xs">
          <span class="material-icons text-4xl text-text-soft opacity-60">lock</span>
          <p class="text-sm font-medium text-text-muted">Esta caja ya está cerrada.</p>
          <a routerLink="/sales/pos" class="text-xs font-medium text-accent-ui hover:underline">Volver al POS</a>
        </div>

      } @else if (state() === 'error') {
        <div class="flex flex-col items-center gap-3 p-12 rounded-xl border border-border bg-bg-surface shadow-xs">
          <span class="material-icons text-4xl text-feedback-error-text">error_outline</span>
          <p class="text-sm font-medium text-text-muted">{{ errorMessage() }}</p>
          <a routerLink="/sales/pos" class="text-xs font-medium text-accent-ui hover:underline">Volver al POS</a>
        </div>

      } @else { @let c = closure()!;
        <div class="flex flex-col gap-4">

          <div class="flex items-center gap-3">
            <a routerLink="/sales/pos" class="btn-icon">
              <span class="material-icons text-base">arrow_back</span>
            </a>
            <h1 class="text-lg font-black text-text-main">Cierre de Caja</h1>
          </div>

          <div class="bg-bg-surface rounded-xl border border-border-strong px-6 py-5">
            <p class="section-title mb-4">Información del turno</p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p class="field-label">Abierto</p>
                <p class="field-value">{{ c.openedAt | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
              <div>
                <p class="field-label">Abrió</p>
                <p class="field-value">{{ c.openedByName }}</p>
              </div>
              <div>
                <p class="field-label">Apertura</p>
                <p class="field-value">Bs {{ c.openingBalance | number:'1.2-2' }}</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="bg-bg-surface rounded-xl border border-border-strong px-4 py-4">
              <p class="field-label">Ventas</p>
              <p class="text-lg font-black text-text-main font-mono">Bs {{ c.totalSales | number:'1.2-2' }}</p>
            </div>
            <div class="bg-bg-surface rounded-xl border border-border-strong px-4 py-4">
              <p class="field-label">Efectivo</p>
              <p class="text-lg font-black text-text-main font-mono">Bs {{ c.cashSales | number:'1.2-2' }}</p>
            </div>
            <div class="bg-bg-surface rounded-xl border border-border-strong px-4 py-4">
              <p class="field-label">Gastos</p>
              <p class="text-lg font-black text-feedback-error-text font-mono">Bs {{ c.totalExpenses | number:'1.2-2' }}</p>
            </div>
            <div class="bg-bg-surface rounded-xl border border-accent-ui/30 px-4 py-4">
              <p class="field-label">Esperado</p>
              <p class="text-lg font-black text-accent-ui font-mono">Bs {{ expectedAmount() | number:'1.2-2' }}</p>
            </div>
          </div>

          <div class="bg-bg-surface rounded-xl border border-border-strong px-6 py-5">
            <p class="section-title mb-4">Cerrar turno</p>
            <div class="flex flex-col gap-4">
              <div>
                <label class="field-label">Monto contado en caja</label>
                <input
                  type="number"
                  placeholder="0"
                  [value]="closingBalance()"
                  (input)="closingBalance.set(+$event.target.value)"
                  class="w-full max-w-xs px-4 py-2.5 text-lg font-mono font-bold border border-border rounded-xl bg-bg-surface text-text-main focus:outline-none focus:border-accent-ui [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
              <div class="flex gap-3">
                <a
                  routerLink="/sales/pos"
                  class="px-6 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-muted hover:bg-bg-muted transition-all"
                >
                  Cancelar
                </a>
                <button
                  type="button"
                  (click)="confirmClose()"
                  [disabled]="closingBalance() <= 0 || submitting()"
                  class="px-6 py-2.5 bg-accent-ui text-white rounded-xl text-sm font-bold hover:bg-accent-ui/90 disabled:opacity-40 transition-all flex items-center gap-2"
                >
                  @if (submitting()) {
                    <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  }
                  Confirmar Cierre
                </button>
              </div>
              @if (closeError()) {
                <p class="text-sm text-feedback-error-text">{{ closeError() }}</p>
              }
            </div>
          </div>

        </div>
      }

    </div>
  `,
})
export default class CloseRegisterPage implements OnInit {
  private router = inject(Router);
  private cashRegisterService = inject(CashRegisterService);

  state = signal<'init' | 'ready' | 'already-closed' | 'error'>('init');
  closure = signal<ClosureDetailDto | null>(null);
  currentRegister = signal<CurrentRegisterDto | null>(null);
  closingBalance = signal<number>(0);
  submitting = signal(false);
  closeError = signal<string | null>(null);
  errorMessage = signal('');

  expectedAmount = computed(() => {
    const c = this.closure();
    if (!c) return 0;
    return c.openingBalance + c.cashSales - c.totalExpenses;
  });

  ngOnInit(): void {
    this.cashRegisterService.getCurrentRegister().subscribe({
      next: (reg) => {
        if (!reg.isOpen) {
          this.state.set('already-closed');
          return;
        }
        if (!reg.closureId) {
          this.errorMessage.set('No se encontró un cierre activo.');
          this.state.set('error');
          return;
        }
        this.currentRegister.set(reg);
        this.loadClosureDetail(reg.closureId);
      },
      error: () => {
        this.errorMessage.set('Error al verificar el estado de la caja.');
        this.state.set('error');
      },
    });
  }

  private loadClosureDetail(id: string): void {
    this.cashRegisterService.getClosureDetail(id).subscribe({
      next: (c) => {
        this.closure.set(c);
        this.state.set('ready');
      },
      error: () => {
        this.errorMessage.set('Error al cargar los datos del turno.');
        this.state.set('error');
      },
    });
  }

  confirmClose(): void {
    if (this.closingBalance() <= 0 || this.submitting()) return;

    this.submitting.set(true);
    this.closeError.set(null);

    this.cashRegisterService.closeRegister({ closingBalance: this.closingBalance() }).subscribe({
      next: () => {
        this.router.navigate(['/sales/pos']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.closeError.set(err?.error?.message || 'Error al cerrar la caja. Intente de nuevo.');
      },
    });
  }
}
