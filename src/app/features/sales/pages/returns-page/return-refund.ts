import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { SaleService } from '@features/sales/services/sale-service';
import {
  CreateReturnItemDto,
  CreateReturnResponse,
  SaleForReturnDto,
  ReturnableItemDto,
} from '@features/sales/dtos/returns-dto';
import SkeletonList from '@shared/ui/skeleton-list/skeleton-list';
import { ConfirmActionModal } from '@features/inventory/pages/transfer-page/confirm-action-modal/confirm-action-modal';
import { ToastService } from '@core/services/toast-service';

interface ReturnLine {
  saleItemId: GUID;
  productSku: string;
  productDisplayName: string;
  soldQuantity: number;
  returnableQuantity: number;
  returnQuantity: number;
}

@Component({
  selector: 'app-return-refund',
  imports: [CurrencyPipe, DatePipe, SkeletonList, ConfirmActionModal],
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
      } @else if (error()) {
        <div
          class="flex flex-col items-center gap-3 p-12 rounded-xl border border-feedback-error bg-bg-surface shadow-xs"
        >
          <span class="material-icons text-4xl text-feedback-error-text">error_outline</span>
          <p class="text-sm font-medium text-text-muted max-w-sm">{{ error() }}</p>
          <button
            type="button"
            (click)="goBack()"
            class="text-xs font-medium text-accent-ui hover:underline"
          >
            Volver a reembolsos
          </button>
        </div>
      } @else if (detail(); as d) {
        <div class="flex flex-col gap-4">
          <!-- Header -->
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <button type="button" (click)="goBack()" class="btn-icon">
                <span class="material-icons text-base">arrow_back</span>
              </button>
              <h1 class="text-lg font-black text-text-main">Procesar devolución</h1>
            </div>
          </div>

          <!-- Resumen de la venta -->
          <div class="bg-bg-surface rounded-xl border border-border-strong px-6 py-5">
            <p class="section-title mb-4">Venta seleccionada</p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
              <div>
                <p class="field-label">Fecha</p>
                <p class="field-value">{{ d.createdAt | date: 'dd/MM/yyyy HH:mm' }}</p>
              </div>
              <div>
                <p class="field-label">Vendedor</p>
                <p class="field-value">{{ d.soldByName }}</p>
              </div>
              <div>
                <p class="field-label">Total venta</p>
                <p class="field-value font-semibold">
                  {{ d.totalAmount | currency: 'BOB' : 'symbol' : '1.2-2' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Tipo de reembolso -->
          <div class="bg-bg-surface rounded-xl border border-border-strong px-6 py-5">
            <p class="section-title mb-4">Tipo de reembolso</p>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                (click)="setMode('full')"
                class="py-3 rounded-xl border-2 text-sm font-semibold transition-colors"
                [class]="
                  mode() === 'full'
                    ? 'border-accent-ui bg-accent-ui/10 text-accent-ui'
                    : 'border-border text-text-muted hover:bg-bg-muted'
                "
              >
                Reembolso completo
              </button>
              <button
                type="button"
                (click)="setMode('partial')"
                class="py-3 rounded-xl border-2 text-sm font-semibold transition-colors"
                [class]="
                  mode() === 'partial'
                    ? 'border-accent-ui bg-accent-ui/10 text-accent-ui'
                    : 'border-border text-text-muted hover:bg-bg-muted'
                "
              >
                Reembolso parcial
              </button>
            </div>
          </div>

          <!-- Ítems a devolver -->
          <div class="bg-bg-surface rounded-xl border border-border-strong overflow-hidden mb-4">
            <p class="section-title px-6 pt-5 pb-3">Ítems a devolver</p>
            <div
              class="hidden lg:grid lg:grid-cols-[1fr_7rem_9rem] gap-x-4 px-6 py-2 bg-bg-muted border-y border-border text-[10px] font-bold uppercase tracking-wider text-text-soft"
            >
              <span>Producto</span>
              <span class="text-center">Vendido / A devolver</span>
              <span class="text-right pr-2">Margen línea</span>
            </div>
            <ul class="divide-y divide-border">
              @for (line of lines(); track line.saleItemId; let i = $index) {
                <li class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-6 py-3">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-text-main truncate">
                      {{ line.productDisplayName }}
                    </p>
                    <p class="field-label">
                      <span class="font-mono">{{ line.productSku }}</span>
                    </p>
                  </div>
                  <div
                    class="sm:w-[7rem] shrink-0 flex items-center justify-between sm:justify-end gap-2"
                  >
                    <span class="text-xs text-text-soft">Vendido:</span>
                    <span class="text-sm font-semibold tabular-nums text-text-main"
                      >{{ line.soldQuantity }} uds</span
                    >
                  </div>
                  <div
                    class="sm:w-[9rem] shrink-0 flex items-center justify-between sm:justify-end gap-2"
                  >
                    <span class="text-xs text-text-soft sm:hidden">A devolver:</span>
                    <input
                      type="number"
                      min="0"
                      [max]="line.returnableQuantity"
                      step="1"
                      [value]="line.returnQuantity"
                      [disabled]="mode() === 'full'"
                      (input)="onReturnQtyChange(i, $event)"
                      class="w-20 px-2 py-1.5 text-right text-sm font-mono font-bold border border-border rounded-lg bg-bg-surface text-text-main disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <span class="text-xs text-text-soft">uds</span>
                  </div>
                </li>
              }
            </ul>
          </div>

          <div
            class="rounded-xl border border-feedback-warning/40 bg-feedback-warning/10 px-4 py-3 text-xs text-feedback-warning-text mb-4"
          >
            El reembolso se realiza en efectivo.
          </div>

          <button
            type="button"
            (click)="openConfirm()"
            [disabled]="!canProcess()"
            class="w-full py-3 rounded-xl text-sm font-bold btn-danger disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Procesar devolución
          </button>
        </div>
      }

      <!-- Modal confirmación -->
      @if (showConfirm()) {
        <app-confirm-action-modal
          title="¿Procesar devolución?"
          [description]="confirmDescription()"
          confirmLabel="Sí, procesar"
          submittingLabel="Procesando..."
          [submitting]="processing()"
          (confirm)="processReturn()"
          (close)="showConfirm.set(false)"
        />
      }
    </div>
  `,
})
export default class ReturnRefund {
  private saleService = inject(SaleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ToastService);

  detail = signal<SaleForReturnDto | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  mode = signal<'full' | 'partial'>('full');
  lines = signal<ReturnLine[]>([]);
  showConfirm = signal(false);
  processing = signal(false);

  canProcess = computed(() => this.lines().some((l) => l.returnQuantity > 0));

  confirmDescription = computed(() => {
    const total = this.lines().reduce((sum, l) => sum + l.returnQuantity, 0);
    return `Se devolverán ${total} unidades en efectivo. Esta acción no se puede deshacer.`;
  });

  ngOnInit(): void {
    const saleId = this.route.snapshot.paramMap.get('saleId') ?? '';
    const sku = this.route.snapshot.queryParamMap.get('sku') ?? '';

    if (!saleId || !sku) {
      this.error.set('Falta el SKU para procesar la devolución.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.saleService.getSaleForReturn(saleId).subscribe({
      next: (d) => {
        this.detail.set(d);
        // Reembolso completo por defecto
        this.buildLines(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(this.friendlyLoadError(err));
        this.loading.set(false);
      },
    });
  }

  private friendlyLoadError(err: {
    status?: number;
    error?: { title?: string; detail?: string };
  }): string {
    const backendMsg =
      err?.error?.detail ||
      err?.error?.title ||
      (err?.status === 404 ? 'No se encontró una venta elegible con ese SKU.' : null);
    return backendMsg ?? 'Esta venta ya fue reembolsada o no es elegible para devolución.';
  }

  private buildLines(fillAll: boolean): void {
    const d = this.detail();
    if (!d) return;
    this.lines.set(
      d.items.map((i: ReturnableItemDto) => ({
        saleItemId: i.saleItemId,
        productSku: i.productSku,
        productDisplayName: i.productDisplayName,
        soldQuantity: i.quantity,
        returnableQuantity: i.returnableQuantity,
        returnQuantity: fillAll ? i.returnableQuantity : 0,
      })),
    );
  }

  setMode(mode: 'full' | 'partial'): void {
    this.mode.set(mode);
    this.buildLines(mode === 'full');
  }

  onReturnQtyChange(index: number, event: Event): void {
    if (this.mode() === 'full') return;
    const raw = parseInt((event.target as HTMLInputElement).value, 10);
    const line = this.lines()[index];
    if (!line) return;
    const qty = isNaN(raw) ? 0 : Math.max(0, Math.min(line.returnableQuantity, raw));
    this.lines.update((list) =>
      list.map((l, i) => (i === index ? { ...l, returnQuantity: qty } : l)),
    );
  }

  openConfirm(): void {
    if (!this.canProcess()) return;
    this.showConfirm.set(true);
  }

  processReturn(): void {
    const d = this.detail();
    if (!d || this.processing()) return;

    const items: CreateReturnItemDto[] = this.lines()
      .filter((l) => l.returnQuantity > 0)
      .map((l) => ({ originalSaleItemId: l.saleItemId, quantity: l.returnQuantity }));

    if (!items.length) return;

    this.processing.set(true);
    this.saleService.createReturn(d.id, { items }).subscribe({
      next: (res: CreateReturnResponse) => {
        this.processing.set(false);
        this.showConfirm.set(false);
        this.toastService.success(
          `Devolución ${res.returnNumber} procesada por Bs ${res.totalRefundAmount.toFixed(2)}`,
        );
        this.router.navigate(['/sales/pos/returns'], {
          queryParams: { sku: this.route.snapshot.queryParamMap.get('sku') ?? undefined },
        });
      },
      error: (err) => {
        this.processing.set(false);
        this.showConfirm.set(false);
        const msg =
          err?.error?.detail ||
          err?.error?.title ||
          'Error al procesar la devolución. Intentá de nuevo.';
        this.toastService.error(msg);
      },
    });
  }

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/sales/pos/returns']);
    }
  }
}
