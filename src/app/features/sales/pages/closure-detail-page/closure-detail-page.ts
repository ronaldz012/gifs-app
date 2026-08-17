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
            <div class="bg-bg-surface rounded-xl border border-border-strong overflow-hidden">
              <div class="px-6 pt-5 pb-3">
                <p class="section-title mb-0">Ventas del turno ({{ c.sales.length }})</p>
              </div>

              <div
                class="hidden lg:grid lg:grid-cols-4 px-6 py-2 bg-bg-muted border-y border-border text-[10px] font-bold uppercase tracking-wider text-text-soft"
              >
                <span>Hora</span>
                <span class="text-right">Monto</span>
                <span class="text-center">Pago</span>
                <span class="text-right">Arts.</span>
              </div>

              <ul class="flex flex-col">
                @for (sale of c.sales; track sale.id) {
                  <li class="bg-bg-surface border-b border-border last:border-b-0">
                    <!-- MOBILE -->
                    <div class="flex items-center gap-4 px-6 py-3.5 lg:hidden">
                      <div class="flex flex-col min-w-0 flex-1">
                        <p class="text-sm font-semibold text-text-main">
                          {{ sale.totalAmount | currency: 'BOB' : 'symbol' : '1.2-2' }}
                        </p>
                        <p class="mt-0.5 text-xs text-text-muted">
                          {{ sale.createdAt | date: 'HH:mm' }}
                          <span class="mx-1">·</span>
                          <span [class.text-feedback-info-text]="sale.paymentMethod !== 'Cash'">
                            {{ sale.paymentMethod === 'Cash' ? 'Efectivo' : sale.paymentMethod }}
                          </span>
                          <span class="mx-1">·</span>
                          {{ sale.itemsCount }} {{ sale.itemsCount === 1 ? 'art' : 'arts' }}
                          <span class="mx-1">·</span>
                          {{ sale.soldByName }}
                        </p>
                      </div>
                    </div>

                    <!-- DESKTOP -->
                    <div
                      class="hidden lg:grid lg:grid-cols-4 items-center px-6 py-3 transition-colors hover:bg-bg-muted/30"
                    >
                      <span class="text-[13px] text-text-main font-mono">{{
                        sale.createdAt | date: 'HH:mm'
                      }}</span>
                      <span class="text-right text-[13px] font-mono font-bold text-text-main">{{
                        sale.totalAmount | currency: 'BOB' : 'symbol' : '1.2-2'
                      }}</span>
                      <span class="text-center">
                        <span
                          class="text-[11px] font-medium px-2 py-0.5 rounded-md"
                          [class.bg-bg-muted]="sale.paymentMethod === 'Cash'"
                          [class.text-text-muted]="sale.paymentMethod === 'Cash'"
                          [class.bg-feedback-info-bg]="sale.paymentMethod !== 'Cash'"
                          [class.text-feedback-info-text]="sale.paymentMethod !== 'Cash'"
                        >
                          {{ sale.paymentMethod === 'Cash' ? 'Efectivo' : sale.paymentMethod }}
                        </span>
                      </span>
                      <span class="text-right text-[13px] font-mono text-text-soft">{{
                        sale.itemsCount
                      }}</span>
                    </div>

                    <!-- Items de la venta -->
                    @if (sale.items.length > 0) {
                      <div class="px-6 pb-3 lg:pb-2">
                        <div class="border-t border-border/60 pt-2">
                          @for (item of sale.items; track item.productVariantId) {
                            <div class="flex items-center justify-between gap-3 text-xs py-0.5">
                              <span class="min-w-0 flex items-center gap-2">
                                <span class="font-mono text-text-soft shrink-0">{{
                                  item.productSku
                                }}</span>
                                <span class="truncate text-text-muted font-medium">{{
                                  item.productDisplayName
                                }}</span>
                              </span>
                              <span class="shrink-0 text-text-soft font-mono">
                                x{{ item.quantity }} ·
                                {{ item.finalPrice | currency: 'BOB' : 'symbol' : '1.2-2' }}
                              </span>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </li>
                }
              </ul>
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
            <div class="bg-bg-surface rounded-xl border border-border-strong overflow-hidden">
              <div class="px-6 pt-5 pb-3">
                <p class="section-title mb-0">
                  Stock actual para reposición ({{ c.variantStocks.length }})
                </p>
              </div>

              <!-- MOBILE -->
              <ul class="flex flex-col divide-y divide-border md:hidden">
                @for (v of c.variantStocks; track v.productVariantId) {
                  <li class="flex items-center gap-3 px-6 py-3">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-text-main truncate">
                        {{ v.productDisplayName }}
                      </p>
                      <p class="field-label">
                        <span class="font-mono text-text-muted">{{ v.productSku }}</span>
                      </p>
                    </div>
                    <div class="shrink-0 text-right">
                      <p
                        class="text-sm font-bold tabular-nums"
                        [class.text-feedback-error-text]="v.currentStock <= 0"
                        [class.text-feedback-warning-text]="
                          v.currentStock > 0 && v.currentStock <= 5
                        "
                        [class.text-text-main]="v.currentStock > 5"
                      >
                        {{ v.currentStock }}
                        <span class="text-xs font-normal text-text-soft">uds</span>
                      </p>
                    </div>
                  </li>
                }
              </ul>

              <!-- DESKTOP -->
              <div class="hidden md:block overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr
                      class="text-[10px] font-bold uppercase tracking-wider text-text-soft border-b border-border"
                    >
                      <th class="text-left py-2 pr-4">SKU</th>
                      <th class="text-left py-2 pr-4">Producto</th>
                      <th class="text-right py-2 pl-4">Stock</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border">
                    @for (v of c.variantStocks; track v.productVariantId) {
                      <tr>
                        <td class="py-2.5 pr-4 font-mono text-xs text-text-muted">
                          {{ v.productSku }}
                        </td>
                        <td class="py-2.5 pr-4 text-text-main font-medium">
                          {{ v.productDisplayName }}
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
