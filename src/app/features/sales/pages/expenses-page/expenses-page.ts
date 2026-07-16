import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CashRegisterService } from '@features/sales/services/cash-register-service';
import { MovementListDto } from '@features/sales/dtos/movement-list-dto';
import { DatePipe, DecimalPipe } from '@angular/common';
import CreateExpenseModal from './create-expense-modal';

@Component({
  selector: 'app-expenses-page',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe, CreateExpenseModal],
  template: `
    <div class="w-full max-w-7xl mx-auto p-4 md:py-6 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <a routerLink="/sales/pos" class="inline-flex items-center gap-1 text-xs text-text-soft hover:text-text-main transition-colors mb-1">
            <span class="material-icons !text-[14px]">arrow_back</span>
            Volver al POS
          </a>
          <h2 class="text-lg font-black text-text-main">Gastos del Día</h2>
          <p class="text-xs text-text-soft">Movimientos registrados en la caja abierta</p>
        </div>
        <button
          type="button"
          (click)="isCreateModalOpen.set(true)"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-ui text-white rounded-xl text-sm font-bold hover:bg-accent-ui/90 active:scale-95 transition-all shadow-xs w-full sm:w-auto justify-center"
        >
          <span class="material-icons !text-[18px]">add</span>
          Crear Gasto
        </button>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <div class="w-8 h-8 border-4 border-border border-t-accent-ui rounded-full animate-spin"></div>
        </div>
      } @else if (movements().length === 0) {
        <div class="flex flex-col items-center justify-center gap-3 py-20 bg-bg-surface border border-dashed border-border rounded-2xl text-text-soft">
          <div class="w-16 h-16 rounded-full bg-bg-muted flex items-center justify-center text-text-soft/40">
            <span class="material-icons text-[36px]">receipt_long</span>
          </div>
          <div class="text-center px-6">
            <p class="font-bold text-text-main text-sm">Sin movimientos hoy</p>
            <p class="text-xs max-w-xs mt-1">Aún no hay gastos registrados en la caja de hoy.</p>
          </div>
        </div>
      } @else {
        <div class="bg-bg-surface rounded-xl border border-border shadow-xs overflow-hidden">
          <div class="hidden md:grid grid-cols-[100px_1fr_100px_80px] gap-4 px-5 py-3 bg-bg-muted border-b border-border text-[10px] font-bold uppercase tracking-wider text-text-soft">
            <span>Tipo</span>
            <span>Descripción</span>
            <span class="text-right">Monto</span>
            <span class="text-right">Hora</span>
          </div>

          <div class="divide-y divide-border">
            @for (movement of movements(); track movement.id) {
              <div class="grid grid-cols-[auto_1fr_auto] md:grid-cols-[100px_1fr_100px_80px] gap-2 md:gap-4 px-4 md:px-5 py-3 md:py-2.5 items-center hover:bg-bg-muted/30 transition-colors">

                <div class="md:flex md:items-center hidden">
                  @if (movement.type === 'Outflow') {
                    <span class="text-[11px] font-bold text-feedback-error-text bg-feedback-error-bg/10 px-2 py-0.5 rounded-md">Salida</span>
                  } @else {
                    <span class="text-[11px] font-bold text-feedback-success-text bg-feedback-success-bg/10 px-2 py-0.5 rounded-md">Entrada</span>
                  }
                </div>

                <div class="flex flex-col md:hidden">
                  @if (movement.type === 'Outflow') {
                    <span class="text-[10px] font-bold text-feedback-error-text bg-feedback-error-bg/10 px-1.5 py-0.5 rounded-md w-fit">Salida</span>
                  } @else {
                    <span class="text-[10px] font-bold text-feedback-success-text bg-feedback-success-bg/10 px-1.5 py-0.5 rounded-md w-fit">Entrada</span>
                  }
                  <span class="text-[13px] font-medium text-text-main mt-1">{{ movement.description }}</span>
                  <div class="flex items-center justify-between mt-1">
                    <span class="text-[12px] font-mono font-bold" [class.text-feedback-error-text]="movement.type === 'Outflow'" [class.text-feedback-success-text]="movement.type === 'Inflow'">
                      {{ movement.type === 'Outflow' ? '-' : '+' }}Bs {{ movement.amount | number:'1.2-2' }}
                    </span>
                    <span class="text-[11px] text-text-soft">{{ movement.createdAt | date:'HH:mm' }}</span>
                  </div>
                </div>

                <div class="hidden md:block text-[13px] font-medium text-text-main truncate">{{ movement.description }}</div>

                <div class="hidden md:block text-right text-[13px] font-mono font-bold" [class.text-feedback-error-text]="movement.type === 'Outflow'" [class.text-feedback-success-text]="movement.type === 'Inflow'">
                  {{ movement.type === 'Outflow' ? '-' : '+' }}Bs {{ movement.amount | number:'1.2-2' }}
                </div>

                <div class="hidden md:block text-right text-[12px] text-text-soft">{{ movement.createdAt | date:'HH:mm' }}</div>

              </div>
            }
          </div>
        </div>
      }
    </div>

    @if (isCreateModalOpen()) {
      <app-create-expense-modal
        (saved)="loadMovements()"
        (close)="isCreateModalOpen.set(false)"
      />
    }
  `,
})
export default class ExpensesPage implements OnInit {
  private cashRegisterService = inject(CashRegisterService);

  movements = signal<MovementListDto[]>([]);
  loading = signal(true);
  isCreateModalOpen = signal(false);

  ngOnInit(): void {
    this.loadMovements();
  }

  loadMovements(): void {
    this.cashRegisterService.getMovements().subscribe({
      next: (movements) => {
        this.movements.set(movements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
