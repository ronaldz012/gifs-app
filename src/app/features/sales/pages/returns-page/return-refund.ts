import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FormField, form, disabled, validate, applyEach } from '@angular/forms/signals';
import { SaleService } from '@features/sales/services/sale-service';
import {
  CreateReturnItemDto,
  CreateReturnResponse,
  SaleForReturnDto,
  ReturnableItemDto,
} from '@features/sales/dtos/returns-dto';
import SkeletonList from '@shared/ui/skeleton-list/skeleton-list';
import { SmartDatePipe } from '@shared/pipes/smart-date.pipe';
import { ConfirmActionModal } from '@features/inventory/pages/transfer-page/confirm-action-modal/confirm-action-modal';
import { ToastService } from '@core/services/toast-service';

interface ReturnLine {
  saleItemId: GUID;
  productSku: string;
  productDisplayName: string;
  soldQuantity: number;
  returnableQuantity: number;
  unitPrice: number;
  selected: boolean;
  returnQuantity: number;
}

interface RefundFormModel {
  isFullReturn: boolean;
  lines: ReturnLine[];
}

@Component({
  selector: 'app-return-refund',
  imports: [CurrencyPipe, SkeletonList, ConfirmActionModal, SmartDatePipe, FormField],
  styles: `
    @keyframes fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .fade-up { animation: fade-up 240ms ease both; }
  `,
  template: `
    <div class="flex flex-col gap-4 w-full fade-up">
      @if (loading()) {
        <app-skeleton-list [rows]="3" [columns]="2" />
      } @else if (error()) {
        <div class="flex flex-col items-center justify-center gap-3 py-20 bg-bg-surface border border-dashed border-border rounded-2xl">
          <span class="material-icons text-4xl text-feedback-error-text">error_outline</span>
          <p class="text-sm font-medium text-text-muted max-w-sm text-center">{{ error() }}</p>
          <button type="button" (click)="goBack()" class="text-xs font-bold text-accent-ui hover:underline">Volver a reembolsos</button>
        </div>
      } @else if (detail(); as d) {
        <!-- Header -->
        <div class="flex items-center gap-3">
          <button type="button" (click)="goBack()" class="btn-icon">
            <span class="material-icons text-base">arrow_back</span>
          </button>
          <h1 class="text-lg font-black text-text-main">Procesar devolución</h1>
        </div>

        <!-- Resumen venta -->
        <div class="bg-bg-surface rounded-xl border border-border shadow-xs px-6 py-5">
          <p class="text-[11px] font-bold uppercase tracking-wider text-text-soft mb-3">Venta seleccionada</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3">
            <div>
              <p class="field-label">Fecha</p>
              <p class="field-value text-sm font-medium">{{ d.createdAt | smartDate }}</p>
            </div>
            <div>
              <p class="field-label">Vendedor</p>
              <p class="field-value text-sm font-medium truncate">{{ d.soldByName }}</p>
            </div>
            <div>
              <p class="field-label">Total venta</p>
              <p class="field-value text-sm font-bold font-mono">{{ d.totalAmount | currency: 'BOB' : 'symbol' : '1.2-2' }}</p>
            </div>
          </div>
        </div>

        <!-- Banner totales — explícito para cajero -->
        <div class="rounded-xl border-2 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
             [class]="canProcess() ? 'border-accent-ui bg-accent-ui/10' : 'border-border bg-bg-muted'">
          <div class="flex flex-col gap-1.5">
            <span class="text-[11px] font-bold uppercase tracking-wider" [class]="canProcess() ? 'text-accent-ui' : 'text-text-soft'">A devolver al cliente (efectivo)</span>
            <span class="text-2xl font-black font-mono" [class]="canProcess() ? 'text-accent-ui' : 'text-text-soft'">{{ totalRefund() | currency: 'BOB' : 'symbol' : '1.2-2' }}</span>
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2.5 py-1 rounded-md bg-accent-ui text-white text-sm font-bold font-mono">{{ totalUnits() }} unid.</span>
              <span class="px-2.5 py-1 rounded-md bg-bg-surface border border-border text-sm font-bold text-text-main">{{ activeLinesCount() }} art. a devolver</span>
              <span class="px-2.5 py-1 rounded-md bg-bg-muted text-sm font-medium text-text-soft">{{ d.items.length }} art. en venta</span>
            </div>
            <span class="text-xs text-text-soft">Verificá el efectivo a entregar antes de confirmar</span>
          </div>
          <div class="flex flex-col items-start sm:items-end gap-1 text-xs">
            <span class="px-2.5 py-1 rounded-full font-bold" [class]="refundForm.isFullReturn().value() ? 'bg-accent-ui text-white' : 'bg-bg-surface border border-border text-text-muted'">
              {{ refundForm.isFullReturn().value() ? 'Reembolso completo' : 'Reembolso parcial' }}
            </span>
            @if (!canProcess()) {
              <span class="text-text-soft">Seleccioná al menos 1 unidad</span>
            }
          </div>
        </div>

        <!-- Toggle reembolso completo -->
        <label class="flex items-center gap-3 bg-bg-surface rounded-xl border border-border shadow-xs px-6 py-4 cursor-pointer hover:bg-bg-muted/40 transition-colors select-none">
          <input type="checkbox" [formField]="refundForm.isFullReturn" (change)="onToggleFullReturn($event)" class="h-5 w-5 rounded border-border text-accent-ui focus:ring-accent-ui" />
          <div class="flex flex-col">
            <span class="text-sm font-bold text-text-main">Reembolso completo</span>
            <span class="text-xs text-text-soft">Devuelve todas las unidades disponibles ({{ maxRefundUnits() }} unid. · {{ maxRefundAmount() | currency: 'BOB' : 'symbol' : '1.2-2' }})</span>
          </div>
        </label>

        <!-- Ítems -->
        <div class="bg-bg-surface rounded-xl border border-border shadow-xs overflow-hidden">
          <div class="hidden lg:grid lg:grid-cols-[auto_1fr_7rem_6rem_11rem_7rem] px-4 py-2 bg-bg-muted border-b border-border text-[10px] font-bold uppercase tracking-wider text-text-soft">
            <span class="w-5"></span>
            <span>Producto</span>
            <span class="text-center">Vendido / Disp.</span>
            <span class="text-right">Precio c/u</span>
            <span class="text-center">A devolver</span>
            <span class="text-right">Subtotal</span>
          </div>
          <div class="lg:hidden px-4 py-3 bg-bg-muted border-b border-border flex items-center justify-between">
            <p class="text-[11px] font-bold uppercase tracking-wider text-text-soft">Artículos de la venta</p>
            <span class="text-xs text-text-soft">{{ d.items.length }} art.</span>
          </div>
          <ul class="flex flex-col divide-y divide-border">
            @for (f of refundForm.lines; track f.saleItemId().value(); let i = $index) {
              <!-- Mobile -->
              <li class="lg:hidden px-4 py-3.5 flex flex-col gap-3" [class.opacity-50]="!f.selected().value() && !refundForm.isFullReturn().value()">
                <label class="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" [formField]="f.selected" (change)="onToggleLine(i, $event)"
                    class="mt-1 h-5 w-5 rounded border-border text-accent-ui focus:ring-accent-ui shrink-0" />
                  <div class="flex-1 min-w-0">
                    <p class="text-[15px] font-bold text-text-main break-words leading-snug">{{ f.productDisplayName().value() }}</p>
                    <p class="font-mono text-xs font-bold tracking-wide text-accent-ui">{{ f.productSku().value() }}</p>
                  </div>
                </label>
                <div class="flex flex-wrap items-center gap-2 pl-8">
                  <span class="px-2.5 py-1 rounded-md bg-bg-muted border border-border text-xs font-bold font-mono text-text-main">{{ f.soldQuantity().value() }}/{{ f.returnableQuantity().value() }} unid.</span>
                  <span class="text-xs text-text-soft">vendido / disp.</span>
                  <span class="px-2 py-1 rounded-md bg-bg-surface border border-border text-xs font-medium text-text-muted">{{ f.unitPrice().value() | currency: 'BOB' : 'symbol' : '1.2-2' }} c/u</span>
                </div>
                <div class="flex items-center justify-between pl-8">
                  <div class="flex items-center gap-2">
                    <button type="button" (click)="dec(i)" [disabled]="f.returnQuantity().disabled() || f.returnQuantity().value()! <= 1"
                      class="h-9 w-9 rounded-lg border border-border bg-bg-surface flex items-center justify-center text-text-main disabled:opacity-30 hover:bg-bg-muted transition-colors">
                      <span class="material-icons text-base">remove</span>
                    </button>
                    <input type="number" [formField]="f.returnQuantity"
                      class="w-16 px-2 py-2 text-center text-sm font-mono font-bold border rounded-lg bg-bg-surface text-text-main outline-none focus:border-accent-ui focus:ring-1 focus:ring-accent-ui disabled:bg-bg-muted disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      [class.border-feedback-error-text]="f.returnQuantity().touched() && f.returnQuantity().invalid()"
                      [class.border-border]="!(f.returnQuantity().touched() && f.returnQuantity().invalid())" />
                    <button type="button" (click)="inc(i)" [disabled]="f.returnQuantity().disabled() || f.returnQuantity().value()! >= f.returnableQuantity().value()!"
                      class="h-9 w-9 rounded-lg border border-border bg-bg-surface flex items-center justify-center text-text-main disabled:opacity-30 hover:bg-bg-muted transition-colors">
                      <span class="material-icons text-base">add</span>
                    </button>
                  </div>
                  <span class="text-sm font-mono font-black min-w-[5.5rem] text-right" [class.text-accent-ui]="(f.returnQuantity().value() ?? 0) > 0" [class.text-text-soft]="!f.selected().value()">
                    {{ ((f.returnQuantity().value() ?? 0) * f.unitPrice().value()!) | currency: 'BOB' : 'symbol' : '1.2-2' }}
                  </span>
                </div>
              </li>
              <!-- Desktop -->
              <li class="hidden lg:grid lg:grid-cols-[auto_1fr_7rem_6rem_11rem_7rem] items-center px-4 py-3 gap-3"
                  [class.opacity-40]="!f.selected().value() && !refundForm.isFullReturn().value()">
                <input type="checkbox" [formField]="f.selected" (change)="onToggleLine(i, $event)"
                  class="h-5 w-5 rounded border-border text-accent-ui focus:ring-accent-ui" />
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-text-main break-words leading-snug truncate" [title]="f.productDisplayName().value()">{{ f.productDisplayName().value() }}</p>
                  <p class="font-mono text-xs font-bold tracking-wide text-accent-ui truncate">{{ f.productSku().value() }}</p>
                </div>
                <span class="text-center px-2 py-1 rounded-md bg-bg-muted border border-border text-xs font-bold font-mono text-text-main justify-self-center">{{ f.soldQuantity().value() }}/{{ f.returnableQuantity().value() }} unid.</span>
                <span class="text-right text-xs font-mono font-medium text-text-muted">{{ f.unitPrice().value() | currency: 'BOB' : 'symbol' : '1.2-2' }}</span>
                <div class="flex items-center justify-center gap-2">
                  <button type="button" (click)="dec(i)" [disabled]="f.returnQuantity().disabled() || f.returnQuantity().value()! <= 1"
                    class="h-7 w-7 rounded-lg border border-border bg-bg-surface flex items-center justify-center text-text-main disabled:opacity-30 hover:bg-bg-muted transition-colors">
                    <span class="material-icons text-sm">remove</span>
                  </button>
                  <input type="number" [formField]="f.returnQuantity"
                    class="w-14 px-2 py-1 text-center text-sm font-mono font-bold border rounded-lg bg-bg-surface text-text-main outline-none focus:border-accent-ui focus:ring-1 focus:ring-accent-ui disabled:bg-bg-muted disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    [class.border-feedback-error-text]="f.returnQuantity().touched() && f.returnQuantity().invalid()"
                    [class.border-border]="!(f.returnQuantity().touched() && f.returnQuantity().invalid())" />
                  <button type="button" (click)="inc(i)" [disabled]="f.returnQuantity().disabled() || f.returnQuantity().value()! >= f.returnableQuantity().value()!"
                    class="h-7 w-7 rounded-lg border border-border bg-bg-surface flex items-center justify-center text-text-main disabled:opacity-30 hover:bg-bg-muted transition-colors">
                    <span class="material-icons text-sm">add</span>
                  </button>
                </div>
                <span class="text-right text-sm font-mono font-bold" [class.text-accent-ui]="(f.returnQuantity().value() ?? 0) > 0">
                  {{ ((f.returnQuantity().value() ?? 0) * f.unitPrice().value()!) | currency: 'BOB' : 'symbol' : '1.2-2' }}
                </span>
              </li>
              @if (f.returnQuantity().touched() && f.returnQuantity().invalid()) {
                <li class="px-4 pb-2 -mt-2">
                  @for (e of f.returnQuantity().errors(); track e.kind) {
                    <p class="text-xs text-feedback-error-text">{{ e.message }}</p>
                  }
                </li>
              }
            }
          </ul>
        </div>

        <div class="rounded-xl border border-feedback-warning/40 bg-feedback-warning/10 px-4 py-3 text-xs text-feedback-warning-text">
          El reembolso se entrega en <span class="font-bold">efectivo</span> al cliente. Verificá el monto antes de confirmar.
        </div>

        <button type="button" (click)="openConfirm()" [disabled]="!canProcess() || processing()"
          class="w-full py-3 rounded-xl text-sm font-bold bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          Procesar devolución — {{ totalRefund() | currency: 'BOB' : 'symbol' : '1.2-2' }} ({{ totalUnits() }} unid.)
        </button>
      }

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
  showConfirm = signal(false);
  processing = signal(false);

  // Signal Forms model
  refundModel = signal<RefundFormModel>({ isFullReturn: true, lines: [] });

  refundForm = form(this.refundModel, (s) => {
    applyEach(s.lines, (line) => {
      disabled(line.selected, ({ valueOf }) => valueOf(s.isFullReturn) === true);
      disabled(line.returnQuantity, ({ valueOf }) => valueOf(s.isFullReturn) === true || !valueOf(line.selected));
      validate(line.returnQuantity, ({ value, valueOf }) => {
        if (valueOf(s.isFullReturn) === true) return null;
        if (!valueOf(line.selected)) return null;
        const v = value() ?? 0;
        const max = valueOf(line.returnableQuantity) ?? 0;
        if (v <= 0) return { kind: 'min', message: 'Debe ser al menos 1' };
        if (v > max) return { kind: 'max', message: `Máx. ${max} unid.` };
        return null;
      });
    });
    validate(s.lines, ({ value, valueOf }) => {
      if (valueOf(s.isFullReturn) === true) return null;
      const has = value().some((l) => l.selected && (l.returnQuantity ?? 0) > 0);
      if (!has) return { kind: 'empty', message: 'Seleccioná al menos 1 artículo' };
      return null;
    });
  });

  // Banner totales
  totalUnits = computed(() =>
    this.refundModel().isFullReturn
      ? this.refundModel().lines.reduce((sum, l) => sum + l.returnableQuantity, 0)
      : this.refundModel().lines.filter((l) => l.selected).reduce((sum, l) => sum + (l.returnQuantity ?? 0), 0),
  );

  totalRefund = computed(() =>
    this.refundModel().isFullReturn
      ? this.refundModel().lines.reduce((sum, l) => sum + l.returnableQuantity * l.unitPrice, 0)
      : this.refundModel().lines.filter((l) => l.selected).reduce((sum, l) => sum + (l.returnQuantity ?? 0) * l.unitPrice, 0),
  );

  activeLinesCount = computed(() =>
    this.refundModel().isFullReturn
      ? this.refundModel().lines.filter((l) => l.returnableQuantity > 0).length
      : this.refundModel().lines.filter((l) => l.selected && (l.returnQuantity ?? 0) > 0).length,
  );

  maxRefundUnits = computed(() => this.detail()?.items.reduce((sum, i) => sum + i.returnableQuantity, 0) ?? 0);
  maxRefundAmount = computed(() => this.detail()?.items.reduce((sum, i) => sum + i.returnableQuantity * i.unitPrice, 0) ?? 0);

  canProcess = computed(() => {
    if (!this.detail()) return false;
    if (this.refundModel().isFullReturn) return this.maxRefundUnits() > 0;
    return this.refundForm().valid() && this.totalUnits() > 0;
  });

  confirmDescription = computed(() => {
    const units = this.totalUnits();
    const amount = this.totalRefund();
    const mode = this.refundModel().isFullReturn ? 'completo' : 'parcial';
    return `Reembolso ${mode}: ${units} unid. por Bs ${amount.toFixed(2)} en efectivo. Esta acción no se puede deshacer.`;
  });

  ngOnInit(): void {
    const saleId = this.route.snapshot.paramMap.get('saleId') ?? '';
    if (!saleId) {
      this.error.set('Falta el ID de la venta.');
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.saleService.getSaleForReturn(saleId).subscribe({
      next: (d) => {
        this.detail.set(d);
        this.refundModel.set({
          isFullReturn: true,
          lines: d.items.map((i: ReturnableItemDto) => ({
            saleItemId: i.saleItemId,
            productSku: i.productSku,
            productDisplayName: i.productDisplayName,
            soldQuantity: i.quantity,
            returnableQuantity: i.returnableQuantity,
            unitPrice: i.unitPrice,
            selected: true,
            returnQuantity: i.returnableQuantity,
          })),
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(this.friendlyLoadError(err));
        this.loading.set(false);
      },
    });
  }

  private friendlyLoadError(err: { status?: number; error?: { title?: string; detail?: string } }): string {
    const backendMsg =
      err?.error?.detail || err?.error?.title || (err?.status === 404 ? 'No se encontró una venta elegible.' : null);
    return backendMsg ?? 'Esta venta ya fue reembolsada o no es elegible para devolución.';
  }

  onToggleFullReturn(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.refundModel.update((m) => ({
      isFullReturn: checked,
      lines: m.lines.map((l) =>
        checked ? { ...l, selected: true, returnQuantity: l.returnableQuantity } : { ...l, selected: false, returnQuantity: 0 },
      ),
    }));
  }

  onToggleLine(index: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.refundModel.update((m) => {
      const lines = m.lines.map((l, i) =>
        i === index ? { ...l, selected: checked, returnQuantity: checked ? Math.min(1, l.returnableQuantity) || 0 : 0 } : l,
      );
      return { ...m, lines };
    });
  }

  inc(index: number): void {
    const m = this.refundModel();
    if (m.isFullReturn || !m.lines[index]?.selected) return;
    this.refundModel.update((curr) => {
      const lines = curr.lines.map((l, i) =>
        i === index ? { ...l, returnQuantity: Math.min(l.returnableQuantity, (l.returnQuantity ?? 0) + 1) } : l,
      );
      return { ...curr, lines };
    });
  }

  dec(index: number): void {
    const m = this.refundModel();
    if (m.isFullReturn || !m.lines[index]?.selected) return;
    this.refundModel.update((curr) => {
      const lines = curr.lines.map((l, i) =>
        i === index ? { ...l, returnQuantity: Math.max(1, (l.returnQuantity ?? 0) - 1) } : l,
      );
      return { ...curr, lines };
    });
  }

  openConfirm(): void {
    if (!this.canProcess()) {
      this.refundForm().markAsTouched();
      return;
    }
    this.showConfirm.set(true);
  }

  processReturn(): void {
    const d = this.detail();
    if (!d || this.processing()) return;

    const m = this.refundModel();
    const items: CreateReturnItemDto[] = m.isFullReturn
      ? m.lines.filter((l) => l.returnableQuantity > 0).map((l) => ({ originalSaleItemId: l.saleItemId, quantity: l.returnableQuantity }))
      : m.lines.filter((l) => l.selected && (l.returnQuantity ?? 0) > 0).map((l) => ({ originalSaleItemId: l.saleItemId, quantity: l.returnQuantity! }));

    if (!items.length) return;

    this.processing.set(true);
    this.saleService.createReturn(d.id, { items }).subscribe({
      next: (res: CreateReturnResponse) => {
        this.processing.set(false);
        this.showConfirm.set(false);
        this.toastService.success(`Devolución ${res.returnNumber} procesada por Bs ${res.totalRefundAmount.toFixed(2)}`);
        this.router.navigate(['/sales/pos/returns'], {
          queryParams: { sku: this.route.snapshot.queryParamMap.get('sku') ?? undefined },
        });
      },
      error: (err) => {
        this.processing.set(false);
        this.showConfirm.set(false);
        const msg = err?.error?.detail || err?.error?.title || 'Error al procesar la devolución. Intentá de nuevo.';
        this.toastService.error(msg);
      },
    });
  }

  goBack(): void {
    if (window.history.length > 1) window.history.back();
    else this.router.navigate(['/sales/pos/returns']);
  }
}
