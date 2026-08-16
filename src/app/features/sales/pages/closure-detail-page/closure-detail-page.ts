import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CashRegisterService } from '@features/sales/services/cash-register-service';
import { ClosureDetailDto } from '@features/sales/dtos/closure-detail-dto';
import SkeletonList from '@shared/ui/skeleton-list/skeleton-list';

@Component({
  selector: 'app-closure-detail-page',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, RouterLink, SkeletonList],
  styles: `
    @keyframes fade-up {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .fade-up {
      animation: fade-up 240ms ease both;
    }
  `,
  template: `
    <div class="max-w-4xl mx-auto fade-up">
      @if (loading()) {
        <app-skeleton-list [rows]="3" [columns]="2" />
      } @else if (!closure()) {
        <div
          class="flex flex-col items-center gap-3 p-12 rounded-xl border border-border bg-bg-surface shadow-xs"
        >
          <span class="material-icons text-4xl text-text-soft opacity-60">payments</span>
          <p class="text-sm font-medium text-text-muted">Cierre no encontrado.</p>
          <a routerLink="/sales/closures" class="text-xs font-medium text-accent-ui hover:underline"
            >Volver a cierres</a
          >
        </div>
      } @else {
        @let c = closure()!;
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <button type="button" (click)="goBack()" class="btn-icon">
              <span class="material-icons text-base">arrow_back</span>
            </button>
            <h1 class="text-lg font-black text-text-main">Detalle de Cierre</h1>
          </div>

          <div class="bg-bg-surface rounded-xl border border-border-strong px-6 py-5">
            <p class="section-title mb-4">Información general</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p class="field-label">Apertura</p>
                <p class="field-value">{{ c.openedAt | date: 'dd/MM/yyyy HH:mm' }}</p>
              </div>
              <div>
                <p class="field-label">Cierre</p>
                <p class="field-value">
                  {{ c.closedAt ? (c.closedAt | date: 'dd/MM/yyyy HH:mm') : '—' }}
                </p>
              </div>
              <div>
                <p class="field-label">Abrió</p>
                <p class="field-value">{{ c.openedByName }}</p>
              </div>
              <div>
                <p class="field-label">Cerró</p>
                <p class="field-value">{{ c.closedByName || '—' }}</p>
              </div>
              <div>
                <p class="field-label">Monto apertura</p>
                <p class="field-value">
                  {{ c.openingBalance | currency: 'BOB' : 'symbol' : '1.2-2' }}
                </p>
              </div>
              <div>
                <p class="field-label">Total ventas</p>
                <p class="field-value">{{ c.totalSales | currency: 'BOB' : 'symbol' : '1.2-2' }}</p>
              </div>
              <div>
                <p class="field-label">Ventas efectivo</p>
                <p class="field-value">{{ c.cashSales | currency: 'BOB' : 'symbol' : '1.2-2' }}</p>
              </div>
              <div>
                <p class="field-label">Total gastos</p>
                <p class="field-value text-feedback-error-text">
                  {{ c.totalExpenses | currency: 'BOB' : 'symbol' : '1.2-2' }}
                </p>
              </div>
              <div>
                <p class="field-label">Saldo esperado</p>
                <p class="field-value font-semibold">
                  {{ c.systemSalesAmount | currency: 'BOB' : 'symbol' : '1.2-2' }}
                </p>
              </div>
              <div>
                <p class="field-label">Monto contado</p>
                <p class="field-value font-semibold">
                  {{ c.realCountedAmount | currency: 'BOB' : 'symbol' : '1.2-2' }}
                </p>
              </div>
              <div>
                <p class="field-label">Diferencia</p>
                <p
                  class="field-value font-bold"
                  [class.text-feedback-success-text]="c.difference === 0"
                  [class.text-feedback-error-text]="c.difference !== 0"
                >
                  @if (c.difference === 0) {
                    Cuadra
                  } @else {
                    {{ c.difference | currency: 'BOB' : 'symbol' : '1.2-2' }}
                  }
                </p>
              </div>
            </div>
          </div>

          @if (c.sales.length > 0) {
            <div class="bg-bg-surface rounded-xl border border-border-strong px-6 py-5">
              <p class="section-title mb-4">Ventas del turno ({{ c.sales.length }})</p>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr
                      class="text-[10px] font-bold uppercase tracking-wider text-text-soft border-b border-border"
                    >
                      <th class="text-left py-2 pr-4">Hora</th>
                      <th class="text-left py-2 pr-4">Vendedor</th>
                      <th class="text-right py-2 px-4">Total</th>
                      <th class="text-center py-2 px-4">Pago</th>
                      <th class="text-center py-2 px-4">Doc.</th>
                      <th class="text-right py-2 pl-4">Arts.</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border">
                    @for (sale of c.sales; track sale.id) {
                      <tr>
                        <td class="py-2.5 pr-4 text-sm text-text-main font-mono">
                          {{ sale.createdAt | date: 'HH:mm' }}
                        </td>
                        <td class="py-2.5 pr-4 text-sm text-text-muted">{{ sale.soldByName }}</td>
                        <td
                          class="py-2.5 px-4 text-right text-sm font-mono font-bold text-text-main"
                        >
                          {{ sale.totalAmount | currency: 'BOB' : 'symbol' : '1.2-2' }}
                        </td>
                        <td class="py-2.5 px-4 text-center">
                          <span
                            class="text-[11px] font-medium px-2 py-0.5 rounded-md"
                            [class.bg-bg-muted]="sale.paymentMethod === 'Cash'"
                            [class.text-text-muted]="sale.paymentMethod === 'Cash'"
                            [class.bg-feedback-info-bg]="sale.paymentMethod !== 'Cash'"
                            [class.text-feedback-info-text]="sale.paymentMethod !== 'Cash'"
                          >
                            {{ sale.paymentMethod === 'Cash' ? 'Efectivo' : sale.paymentMethod }}
                          </span>
                        </td>
                        <td class="py-2.5 px-4 text-center">
                          <span
                            class="text-[11px] font-medium px-2 py-0.5 rounded-md"
                            [class.bg-bg-muted]="sale.documentType === 'Ticket'"
                            [class.text-text-muted]="sale.documentType === 'Ticket'"
                            [class.bg-feedback-success-bg]="sale.documentType === 'Invoice'"
                            [class.text-feedback-success-text]="sale.documentType === 'Invoice'"
                            [class.bg-feedback-warning-bg]="sale.documentType === 'PendingInvoice'"
                            [class.text-feedback-warning-text]="
                              sale.documentType === 'PendingInvoice'
                            "
                          >
                            @if (sale.documentType === 'Invoice') {
                              Factura
                            } @else if (sale.documentType === 'PendingInvoice') {
                              Pendiente
                            } @else {
                              Boleta
                            }
                          </span>
                        </td>
                        <td
                          class="py-2.5 pl-4 text-right text-sm font-mono text-accent-ui font-bold"
                        >
                          {{ sale.itemsCount }}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          @if (c.movements.length > 0) {
            <div class="bg-bg-surface rounded-xl border border-border-strong px-6 py-5">
              <p class="section-title mb-4">Movimientos ({{ c.movements.length }})</p>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr
                      class="text-[10px] font-bold uppercase tracking-wider text-text-soft border-b border-border"
                    >
                      <th class="text-left py-2 pr-4">Tipo</th>
                      <th class="text-left py-2 pr-4">Descripción</th>
                      <th class="text-right py-2 px-4">Monto</th>
                      <th class="text-right py-2 pl-4">Hora</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border">
                    @for (m of c.movements; track m.id) {
                      <tr>
                        <td class="py-2.5 pr-4">
                          <span
                            class="text-[11px] font-bold px-2 py-0.5 rounded-md"
                            [class.text-feedback-error-text]="m.type === 'Outflow'"
                            [class.bg-feedback-error-bg]="m.type === 'Outflow'"
                            [class.text-feedback-success-text]="m.type !== 'Outflow'"
                            [class.bg-feedback-success-bg]="m.type !== 'Outflow'"
                          >
                            {{ m.type === 'Outflow' ? 'Salida' : 'Entrada' }}
                          </span>
                        </td>
                        <td class="py-2.5 pr-4 text-sm text-text-main">{{ m.description }}</td>
                        <td
                          class="py-2.5 px-4 text-right text-sm font-mono font-bold"
                          [class.text-feedback-error-text]="m.type === 'Outflow'"
                          [class.text-feedback-success-text]="m.type !== 'Outflow'"
                        >
                          {{
                            (m.type === 'Outflow' ? -m.amount : m.amount)
                              | currency: 'BOB' : 'symbol' : '1.2-2'
                          }}
                        </td>
                        <td class="py-2.5 pl-4 text-right text-sm text-text-soft">
                          {{ m.createdAt | date: 'HH:mm' }}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          @if (c.variantStocks.length) {
            <div class="bg-bg-surface rounded-xl border border-border-strong px-6 py-5">
              <p class="section-title mb-4">
                Stock actual para reposición ({{ c.variantStocks.length }})
              </p>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr
                      class="text-[10px] font-bold uppercase tracking-wider text-text-soft border-b border-border"
                    >
                      <th class="text-left py-2 pr-4">Producto</th>
                      <th class="text-left py-2 pr-4">SKU</th>
                      <th class="text-right py-2 pl-4">Stock</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border">
                    @for (v of c.variantStocks; track v.productVariantId) {
                      <tr>
                        <td class="py-2.5 pr-4 text-sm text-text-main">
                          {{ v.productDisplayName }}
                        </td>
                        <td class="py-2.5 pr-4 text-sm font-mono text-text-muted">
                          {{ v.productSku }}
                        </td>
                        <td
                          class="py-2.5 pl-4 text-right text-sm font-mono font-bold"
                          [class.text-feedback-error-text]="v.currentStock <= 0"
                          [class.text-feedback-warning-text]="
                            v.currentStock > 0 && v.currentStock <= 5
                          "
                          [class.text-text-main]="v.currentStock > 5"
                        >
                          {{ v.currentStock }}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export default class ClosureDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cashRegisterService = inject(CashRegisterService);

  closure = signal<ClosureDetailDto | null>(null);
  loading = signal(true);

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['sales', 'closures']);
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadDetail(id);
  }

  private loadDetail(id: string): void {
    this.loading.set(true);
    this.cashRegisterService.getClosureDetail(id, true).subscribe({
      next: (c) => {
        this.closure.set(c);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
