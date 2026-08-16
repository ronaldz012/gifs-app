import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SaleService } from '@features/sales/services/sale-service';
import { SaleDetailDto } from '@features/sales/dtos/sale-detail-dto';
import SkeletonList from '@shared/ui/skeleton-list/skeleton-list';

@Component({
  selector: 'app-sale-detail-page',
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
    <div class="max-w-5xl mx-auto fade-up">
      @if (loading()) {
        <app-skeleton-list [rows]="3" [columns]="2" />
      } @else if (!sale()) {
        <div
          class="flex flex-col items-center gap-3 p-12 rounded-xl border border-border bg-bg-surface shadow-xs"
        >
          <span class="material-icons text-4xl text-text-soft opacity-60">receipt</span>
          <p class="text-sm font-medium text-text-muted">Venta no encontrada.</p>
          <a routerLink="/sales/sales" class="text-xs font-medium text-accent-ui hover:underline"
            >Volver a ventas</a
          >
        </div>
      } @else {
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <button type="button" (click)="goBack()" class="btn-icon">
              <span class="material-icons text-base">arrow_back</span>
            </button>
            <h1 class="text-lg font-black text-text-main">Detalle de Venta</h1>
          </div>

          <div class="bg-bg-surface rounded-xl border border-border-strong px-6 py-5">
            <p class="section-title mb-4">Información general</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p class="field-label">Fecha</p>
                <p class="field-value">{{ sale()!.createdAt | date: 'dd/MM/yyyy HH:mm' }}</p>
              </div>
              <div>
                <p class="field-label">Vendedor</p>
                <p class="field-value">{{ sale()!.soldByName }}</p>
              </div>
              <div>
                <p class="field-label">Método de pago</p>
                <p class="field-value">
                  {{ sale()!.paymentMethod === 0 ? 'Efectivo' : 'Pago Móvil' }}
                </p>
              </div>
              <div>
                <p class="field-label">Tipo de documento</p>
                <p class="field-value">
                  @if (sale()!.documentType === 0) {
                    Boleta
                  } @else if (sale()!.documentType === 1) {
                    Factura
                  } @else {
                    Pendiente
                  }
                </p>
              </div>
              <div>
                <p class="field-label">Total</p>
                <p class="field-value font-bold">
                  {{ sale()!.totalAmount | currency: 'BOB' : 'symbol' : '1.2-2' }}
                </p>
              </div>
              <div>
                <p class="field-label">Artículos</p>
                <p class="field-value">{{ sale()!.totalItems }} unidades</p>
              </div>
              <div>
                <p class="field-label">N° Factura</p>
                <p class="field-value">{{ sale()!.invoiceNumber ?? '—' }}</p>
              </div>
              <div>
                <p class="field-label">Código de transacción</p>
                <p class="field-value">{{ sale()!.transactionCode || '—' }}</p>
              </div>
              <div>
                <p class="field-label">Notas</p>
                <p class="field-value">{{ sale()!.notes || '—' }}</p>
              </div>
            </div>
          </div>

          <div class="bg-bg-surface rounded-xl border border-border-strong px-6 py-5">
            <p class="section-title mb-4">Artículos</p>

            <!-- MOBILE -->
            <ul class="flex flex-col divide-y divide-border md:hidden">
              @for (item of sale()!.items; track item.id) {
                <li class="flex items-center gap-3 py-3">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-text-main truncate">
                      {{ item.productDisplayName }}
                    </p>
                    <p class="field-label">
                      <span class="font-mono text-text-muted">{{ item.productSku }}</span>
                    </p>
                  </div>
                  <div class="shrink-0 text-right">
                    <p class="text-sm font-semibold tabular-nums text-text-main">
                      {{ item.quantity }}
                      <span class="text-xs font-normal text-text-soft">uds</span>
                    </p>
                    <p class="field-label tabular-nums">
                      {{ item.unitPrice | currency: 'BOB' : 'symbol' : '1.2-2' }} c/u
                    </p>
                  </div>
                  <div class="shrink-0 text-right w-20 hidden sm:block">
                    <p class="text-sm tabular-nums text-text-muted">
                      {{ item.finalPrice | currency: 'BOB' : 'symbol' : '1.2-2' }}
                    </p>
                    <p class="field-label">subtotal</p>
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
                    <th class="text-right py-2 px-4">P. Unitario</th>
                    <th class="text-right py-2 px-4">Cant.</th>
                    <th class="text-right py-2 px-4">Descuento</th>
                    <th class="text-right py-2 pl-4">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  @for (item of sale()!.items; track item.id) {
                    <tr>
                      <td class="py-2.5 pr-4 font-mono text-xs text-text-muted">
                        {{ item.productSku }}
                      </td>
                      <td class="py-2.5 pr-4 text-text-main font-medium">
                        {{ item.productDisplayName }}
                      </td>
                      <td class="py-2.5 px-4 text-right text-text-muted font-mono tabular-nums">
                        {{ item.unitPrice | currency: 'BOB' : 'symbol' : '1.2-2' }}
                      </td>
                      <td class="py-2.5 px-4 text-right text-text-main font-mono tabular-nums">
                        {{ item.quantity }} <span class="text-xs text-text-soft">uds</span>
                      </td>
                      <td
                        class="py-2.5 px-4 text-right text-feedback-error-text font-mono tabular-nums"
                      >
                        {{ item.discountAmount | currency: 'BOB' : 'symbol' : '1.2-2' }}
                      </td>
                      <td
                        class="py-2.5 pl-4 text-right font-mono font-bold text-text-main tabular-nums"
                      >
                        {{ item.finalPrice | currency: 'BOB' : 'symbol' : '1.2-2' }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div
              class="pt-3 mt-1 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-1"
            >
              <span class="text-xs text-text-soft">{{ sale()!.totalItems }} unidades en total</span>
              <span class="text-sm font-semibold text-text-main tabular-nums">
                {{ sale()!.totalAmount | currency: 'BOB' : 'symbol' : '1.2-2' }}
              </span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export default class SaleDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private saleService = inject(SaleService);

  sale = signal<SaleDetailDto | null>(null);
  loading = signal(true);

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['sales', 'sales']);
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadDetail(id);
  }

  private loadDetail(id: string): void {
    this.loading.set(true);
    this.saleService.getSaleDetail(id).subscribe({
      next: (s) => {
        this.sale.set(s);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
