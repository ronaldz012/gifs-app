import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { SaleService } from '@features/sales/services/sale-service';
import SkeletonList from '@shared/ui/skeleton-list/skeleton-list';
import { Paginator } from '@shared/components/app-paginator/app-paginator';
import { SmartDatePipe } from '@shared/pipes/smart-date.pipe';
import { SaleSkuSearchDto } from '@features/sales/dtos/returns-dto';

@Component({
  selector: 'app-returns-search',
  imports: [CurrencyPipe, RouterLink, SkeletonList, Paginator, SmartDatePipe],
  styles: `
    @keyframes fade-up {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fade-up 240ms ease both; }
    .row-enter { animation: fade-up 200ms ease both; }
  `,
  template: `
    <div class="flex flex-col gap-4 w-full fade-up">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <a routerLink="/sales/pos" class="btn-icon">
          <span class="material-icons text-base">arrow_back</span>
        </a>
        <h1 class="text-lg font-black text-text-main">Reembolsos</h1>
      </div>

      <!-- Buscador -->
      <div class="bg-bg-surface rounded-xl border border-border-strong px-6 py-5">
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
            [value]="skuValue()"
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
              <span class="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
            }
            Buscar ventas (7 días)
          </button>
        </div>
        <p class="mt-2 text-[11px] text-text-soft">
          Se listan las ventas de los últimos 7 días que contengan ese SKU en sus ítems.
        </p>
      </div>

      <!-- Card producto buscado -->
      @if (searched() && searchedDisplayName()) {
        <div class="flex flex-col gap-1 rounded-xl border border-border-strong bg-bg-surface px-6 py-4 shadow-xs">
          <span class="font-mono text-xs font-bold tracking-wide text-accent-ui">{{ searchedSku() }}</span>
          <p class="text-[15px] font-bold leading-snug text-text-main break-words">
            {{ searchedDisplayName() }}
          </p>
          <span class="text-xs text-text-soft">{{ totalResults() }} venta(s) encontrada(s) en los últimos 7 días</span>
        </div>
      }

      @if (loading()) {
        <app-skeleton-list [rows]="4" [columns]="4" />
      } @else if (searched() && results().length === 0) {
        <div
          class="flex flex-col items-center justify-center gap-3 py-20 bg-bg-surface border border-dashed border-border rounded-2xl text-text-soft"
        >
          <div class="w-16 h-16 rounded-full bg-bg-muted flex items-center justify-center text-text-soft/40">
            <span class="material-icons text-[36px]">receipt</span>
          </div>
          <div class="text-center px-6">
            <p class="font-bold text-text-main text-sm">Sin ventas</p>
            <p class="text-xs max-w-xs mt-1">No se encontraron ventas con ese SKU en los últimos 7 días.</p>
          </div>
        </div>
      } @else if (results().length > 0) {
        <div class="bg-bg-surface rounded-xl border border-border shadow-xs overflow-hidden">
          <div
            class="hidden lg:grid lg:grid-cols-[11rem_9rem_6rem_7rem_1fr_8rem_7rem] px-4 py-3 bg-bg-muted border-b border-border text-[10px] font-bold uppercase tracking-wider text-text-soft"
          >
            <span>Fecha</span>
            <span>Cant. × Precio</span>
            <span class="text-center">Art. dif.</span>
            <span class="text-center">Total unid.</span>
            <span>Vendedor</span>
            <span class="text-right">Monto total</span>
            <span></span>
          </div>
          <ul class="flex flex-col divide-y divide-border">
            @for (sale of results(); track sale.id) {
              <li class="row-enter bg-bg-surface relative overflow-hidden border-b border-border transition-all duration-200 hover:shadow-md">
                <div class="absolute bottom-0 left-0 top-0 w-[4px] bg-accent-ui opacity-0 transition-opacity duration-150 group-hover:opacity-100 lg:block hidden"></div>

                <!-- MOBILE: una sola fila por venta -->
                <div class="flex items-center gap-4 px-4 py-3.5 lg:hidden">
                  <div class="flex flex-col min-w-0 flex-1">
                    <p class="truncate font-inter text-sm font-bold leading-tight text-text-main">
                      {{ sale.createdAt | smartDate }}
                    </p>
                    <p class="mt-1 font-inter text-xs text-text-muted flex flex-wrap items-center gap-1.5">
                      <span class="font-bold text-accent-ui bg-accent-ui/10 px-1.5 py-0.5 rounded text-[11px]">×{{ sale.matchedItem.quantity }} · {{ sale.matchedItem.unitPrice | currency: 'BOB' : 'symbol' : '1.2-2' }}</span>
                      <span class="font-bold text-accent-ui">{{ sale.totalAmount | currency: 'BOB' : 'symbol' : '1.2-2' }}</span>
                      <span class="font-medium text-text-soft bg-bg-muted px-1.5 py-0.5 rounded text-[11px]">{{ sale.totalItems }} art. dif.</span>
                      <span class="font-medium text-text-soft bg-bg-muted px-1.5 py-0.5 rounded text-[11px]">{{ sale.totalUnitsSold }} unid.</span>
                      <span class="truncate">· {{ sale.soldByName }}</span>
                    </p>
                  </div>
                  <div class="shrink-0">
                    <button type="button" (click)="openRefund(sale)" class="btn-link">
                      <span class="btn-link-text">Ver más</span>
                      <span class="material-icons text-base">chevron_right</span>
                    </button>
                  </div>
                </div>

                <!-- DESKTOP: una sola fila por venta -->
                <div class="group hidden lg:grid lg:grid-cols-[11rem_9rem_6rem_7rem_1fr_8rem_7rem] items-center px-4 py-3 transition-colors duration-150 hover:bg-bg-muted">
                  <span class="text-[13px] font-medium text-text-main">{{ sale.createdAt | smartDate }}</span>
                  <span class="text-[11px] font-bold text-accent-ui bg-accent-ui/10 px-2 py-0.5 rounded-md w-fit">×{{ sale.matchedItem.quantity }} · {{ sale.matchedItem.unitPrice | currency: 'BOB' : 'symbol' : '1.2-2' }}</span>
                  <span class="text-center text-xs font-bold font-mono text-accent-ui bg-accent-ui/10 px-2 py-0.5 rounded-md w-fit mx-auto">{{ sale.totalItems }}</span>
                  <span class="text-center text-xs font-medium text-text-muted bg-bg-muted px-2 py-0.5 rounded-md w-fit mx-auto">{{ sale.totalUnitsSold }}</span>
                  <span class="text-xs text-text-muted truncate pr-2">{{ sale.soldByName }}</span>
                  <span class="text-right text-[13px] font-mono font-bold text-text-main">{{ sale.totalAmount | currency: 'BOB' : 'symbol' : '1.2-2' }}</span>
                  <div class="flex justify-end">
                    <button type="button" (click)="openRefund(sale)" class="btn-link">
                      <span class="btn-link-text">Ver más</span>
                      <span class="material-icons text-base">chevron_right</span>
                    </button>
                  </div>
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
  searchedSku = signal('');
  searchedDisplayName = signal('');
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
        this.searchedSku.set('');
        this.searchedDisplayName.set('');
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
          this.searchedSku.set(res.searchedSku);
          this.searchedDisplayName.set(res.searchedDisplayName);
          this.results.set(res.sales.items);
          this.totalResults.set(res.sales.totalCount);
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
