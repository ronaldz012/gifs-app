import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { SaleService } from '@features/sales/services/sale-service';
import { PagedResult } from '@features/inventory/dtos/paged-result';
import SkeletonList from '@shared/ui/skeleton-list/skeleton-list';
import { Paginator } from '@shared/components/app-paginator/app-paginator';
import { SaleSkuSearchDto } from '@features/sales/dtos/returns-dto';

@Component({
  selector: 'app-returns-search',
  imports: [CurrencyPipe, DatePipe, RouterLink, SkeletonList, Paginator],
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
      <!-- Header -->
      <div class="flex items-center gap-3 mb-5">
        <a routerLink="/sales/pos" class="btn-icon">
          <span class="material-icons text-base">arrow_back</span>
        </a>
        <h1 class="text-lg font-black text-text-main">Reembolsos</h1>
      </div>

      <!-- Buscador -->
      <div class="bg-bg-surface rounded-xl border border-border-strong px-6 py-5 mb-4">
        <label class="field-label block mb-2" for="skuInput">SKU del producto</label>
        <div class="flex gap-2">
          <input
            id="skuInput"
            type="text"
            placeholder="Escaneá o pegá el SKU..."
            autocomplete="off"
            class="flex-1 px-3 py-2.5 text-sm rounded-lg border border-border bg-bg-muted text-text-main
                   font-mono placeholder:text-text-soft outline-none transition-colors
                   focus:border-border-strong focus:ring-1 focus:ring-accent-ui"
            (input)="onSkuInput($event)"
            (keydown.enter)="search()"
          />
          <button
            type="button"
            (click)="search()"
            [disabled]="searching() || !skuValue().trim()"
            class="px-4 py-2.5 rounded-lg text-sm font-semibold bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover disabled:opacity-40 transition-colors flex items-center gap-2"
          >
            @if (searching()) {
              <span
                class="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"
              ></span>
            }
            Buscar ventas (7 días)
          </button>
        </div>
        <p class="mt-2 text-[11px] text-text-soft">
          Se listan las ventas de los últimos 7 días que contengan ese SKU en sus ítems.
        </p>
      </div>

      <!-- Resultados -->
      @if (loading()) {
        <app-skeleton-list [rows]="3" [columns]="4" />
      } @else if (searched() && results().length === 0) {
        <div
          class="flex flex-col items-center gap-3 p-12 rounded-xl border border-dashed border-border bg-bg-surface shadow-xs"
        >
          <span class="material-icons text-4xl text-text-soft opacity-60">receipt</span>
          <p class="text-sm font-medium text-text-muted">
            No se encontraron ventas con ese SKU en los últimos 7 días.
          </p>
        </div>
      } @else if (results().length > 0) {
        <div class="bg-bg-surface rounded-xl border border-border-strong overflow-hidden">
          <div
            class="hidden lg:grid lg:grid-cols-[11rem_7rem_7rem_9rem_8rem] px-6 py-2 bg-bg-muted border-b border-border text-[10px] font-bold uppercase tracking-wider text-text-soft"
          >
            <span>Fecha</span>
            <span>Items venta</span>
            <span>Unid. vendidas</span>
            <span class="text-right">Monto total</span>
            <span class="text-right">Acción</span>
          </div>
          <ul class="flex flex-col">
            @for (sale of results(); track sale.id) {
              <li
                class="bg-bg-surface border-b-2 border-border-strong last:border-b-0 hover:bg-bg-muted/30 transition-colors"
              >
                <!-- Mobile: 2 filas -->
                <div class="flex flex-col lg:hidden">
                  <!-- Fila 1: datos de la venta -->
                  <div class="flex items-center justify-between gap-2 px-6 py-3">
                    <span class="text-sm font-semibold text-text-main">
                      {{ sale.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                    </span>
                    <span class="font-mono text-sm font-bold">{{
                      sale.totalAmount | currency: 'BOB' : 'symbol' : '1.2-2'
                    }}</span>
                  </div>
                  <div class="flex items-center gap-2 px-6 pb-3 text-xs text-text-soft">
                    <span class="px-2 py-0.5 rounded bg-bg-muted border border-border font-mono font-medium">
                      {{ sale.totalItems }} items
                    </span>
                    <span class="px-2 py-0.5 rounded bg-bg-muted border border-border font-mono font-medium">
                      {{ sale.totalUnitsSold }} unid.
                    </span>
                  </div>
                  <div class="flex justify-end px-6 pb-3">
                    <button type="button" (click)="openRefund(sale)" class="btn-link">
                      <span class="btn-link-text">Seleccionar</span>
                      <span class="material-icons text-base">chevron_right</span>
                    </button>
                  </div>
                  <!-- Fila 2: producto coincidente -->
                  @if (sale.matchedItems; as item) {
                    <div class="mx-4 mb-4 flex flex-col gap-1.5 rounded-lg border border-border bg-bg-muted/40 px-4 py-3">
                      <span class="font-mono text-xs font-bold tracking-wide text-accent-ui">{{ item.productSku }}</span>
                      <p class="text-[15px] font-bold leading-snug text-text-main break-words">
                        {{ item.productDisplayName }}
                      </p>
                      <div class="flex flex-wrap gap-2 pt-1 text-xs">
                        <span class="px-2.5 py-1 rounded bg-accent-ui/10 text-accent-ui font-semibold">×{{ item.quantity }} u.</span>
                        <span class="px-2.5 py-1 rounded bg-bg-surface border border-border text-text-muted font-medium">{{ item.unitPrice | currency: 'BOB' : 'symbol' : '1.2-2' }} c/u</span>
                      </div>
                    </div>
                  }
                </div>
                <!-- Desktop: 2 filas -->
                <div class="hidden lg:flex lg:flex-col">
                  <!-- Fila 1: datos de la venta -->
                  <div class="grid grid-cols-[11rem_7rem_7rem_9rem_8rem] items-center px-6 py-3">
                    <span class="text-[13px] text-text-main font-mono">
                      {{ sale.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                    </span>
                    <span class="text-[13px] text-text-muted font-mono font-medium">{{ sale.totalItems }}</span>
                    <span class="text-[13px] text-text-muted font-mono font-medium">{{ sale.totalUnitsSold }}</span>
                    <span class="text-right text-[13px] font-mono font-bold text-text-main">
                      {{ sale.totalAmount | currency: 'BOB' : 'symbol' : '1.2-2' }}
                    </span>
                    <div class="flex justify-end">
                      <button type="button" (click)="openRefund(sale)" class="btn-link">
                        <span class="btn-link-text">Seleccionar</span>
                        <span class="material-icons text-base">chevron_right</span>
                      </button>
                    </div>
                  </div>
                  <!-- Fila 2: producto coincidente — simple, una sola fila -->
                  @if (sale.matchedItems; as item) {
                    <div class="flex items-center gap-3 border-t border-border bg-bg-muted/30 px-6 py-2.5 text-sm">
                      <span class="font-mono text-xs font-bold tracking-wide text-accent-ui shrink-0">{{ item.productSku }}</span>
                      <span class="font-semibold text-text-main min-w-0 flex-1">{{ item.productDisplayName }}</span>
                      <span class="text-xs font-medium text-text-muted shrink-0">×{{ item.quantity }} u.</span>
                      <span class="text-xs font-medium text-text-muted shrink-0">{{ item.unitPrice | currency: 'BOB' : 'symbol' : '1.2-2' }} c/u</span>
                    </div>
                  }
                </div>
              </li>
            }
          </ul>
        </div>

        @if (!loading() && totalResults() > 0) {
          <app-paginator
            [page]="query().page!"
            [pageSize]="query().pageSize!"
            [totalItems]="totalResults()"
            (pageChange)="onPage($event)"
            (pageSizeChange)="onPageSize($event)"
          />
        }
      }
    </div>
  `,
})
export default class ReturnsSearch {
  private saleService = inject(SaleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private readonly DAYS = 7;

  skuValue = signal('');
  searching = signal(false);
  searched = signal(false);
  loading = signal(false);
  results = signal<SaleSkuSearchDto[]>([]);
  totalResults = signal(0);
  query = signal<{ sku?: string; days?: number; page?: number; pageSize?: number }>({
    page: 1,
    pageSize: 10,
  });

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const sku = params.get('sku') ?? '';
      this.skuValue.set(sku);
      if (sku.trim()) {
        this.doSearch(sku);
      } else {
        this.results.set([]);
        this.totalResults.set(0);
        this.searched.set(false);
      }
    });
  }

  onSkuInput(event: Event): void {
    this.skuValue.set((event.target as HTMLInputElement).value);
  }

  search(): void {
    const sku = this.skuValue().trim();
    if (!sku || this.searching()) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sku },
      queryParamsHandling: 'merge',
    });
  }

  openRefund(sale: SaleSkuSearchDto): void {
    this.router.navigate(['/sales/pos/returns', sale.id], {
      queryParams: { sku: this.skuValue().trim() },
    });
  }

  onPage(page: number): void {
    this.query.update((q) => ({ ...q, page }));
    this.doSearch(this.skuValue().trim());
  }

  onPageSize(pageSize: number): void {
    this.query.update((q) => ({ ...q, pageSize, page: 1 }));
    this.doSearch(this.skuValue().trim());
  }

  private doSearch(sku: string): void {
    this.loading.set(true);
    const q = this.query();
    this.saleService
      .searchBySku({ sku, days: this.DAYS, page: q.page, pageSize: q.pageSize })
      .subscribe({
        next: (res) => {
          this.results.set(res.items);
          this.totalResults.set(res.totalCount);
          this.searched.set(true);
          this.searching.set(false);
          this.loading.set(false);
        },
        error: () => {
          this.searched.set(true);
          this.searching.set(false);
          this.loading.set(false);
        },
      });
  }
}