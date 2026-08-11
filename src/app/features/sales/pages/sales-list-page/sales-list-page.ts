import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SaleService } from '@features/sales/services/sale-service';
import { SaleListDto } from '@features/sales/dtos/sale-list-dto';
import { SalesQueryDto } from '@features/sales/dtos/sales-query-dto';
import { DateRangeFilter, DateRange } from '@shared/components/date-range-filter/date-range-filter';
import { Paginator } from '@shared/components/app-paginator/app-paginator';
import SkeletonList from '@shared/ui/skeleton-list/skeleton-list';

@Component({
  selector: 'app-sales-list-page',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, RouterLink, DateRangeFilter, Paginator, SkeletonList],
  template: `
    <div class="flex flex-col gap-4 w-full">

      <app-date-range-filter
        (rangeChange)="onDateRange($event)"
      />

      @if (loading()) {
        <app-skeleton-list [rows]="4" [columns]="3" />

      } @else if (sales().length === 0) {
        <div class="flex flex-col items-center justify-center gap-3 py-20 bg-bg-surface border border-dashed border-border rounded-2xl text-text-soft">
          <div class="w-16 h-16 rounded-full bg-bg-muted flex items-center justify-center text-text-soft/40">
            <span class="material-icons text-[36px]">receipt</span>
          </div>
          <div class="text-center px-6">
            <p class="font-bold text-text-main text-sm">Sin ventas</p>
            <p class="text-xs max-w-xs mt-1">No se encontraron ventas{{ hasDateFilter() ? ' con los filtros seleccionados' : '' }}.</p>
          </div>
          @if (hasDateFilter()) {
            <button class="text-xs font-bold text-accent-ui hover:underline" (click)="clearFilters()">Limpiar filtros</button>
          }
        </div>

      } @else {
        <div class="bg-bg-surface rounded-xl border border-border shadow-xs overflow-hidden">

          <div class="hidden lg:grid lg:grid-cols-7 px-4 py-3 bg-bg-muted border-b border-border text-[10px] font-bold uppercase tracking-wider text-text-soft">
            <span>Fecha</span>
            <span class="text-right">Total</span>
            <span>Pago</span>
            <span>Documento</span>
            <span class="text-center">Arts.</span>
            <span>Factura</span>
            <span></span>
          </div>

          <ul class="flex flex-col divide-y divide-border">
            @for (sale of sales(); track sale.id) {
              <li class="row-enter bg-bg-surface relative overflow-hidden border-b border-border transition-all duration-200 hover:shadow-md">

                <div class="absolute bottom-0 left-0 top-0 w-[4px] bg-accent-ui opacity-0 transition-opacity duration-150 group-hover:opacity-100 lg:block hidden"></div>

                <!-- MOBILE -->
                <div class="flex items-center gap-4 px-4 py-3.5 lg:hidden">
                  <div class="flex flex-col min-w-0 flex-1">
                    <p class="truncate font-inter text-sm font-bold leading-tight text-text-main">
                      {{ sale.createdAt | date:'dd/MM/yy HH:mm' }}
                    </p>
                    <p class="mt-1 font-inter text-xs text-text-muted">
                      <span class="font-bold text-accent-ui">{{ sale.totalAmount | currency:'BOB':'symbol':'1.2-2' }}</span>
                      <span class="font-bold text-accent-ui bg-accent-ui/10 px-1.5 py-0.5 rounded text-[11px]">{{ sale.itemCount }} art.</span>
                      @if (sale.paymentMethod === 0) {
                        · Efectivo
                      } @else {
                        · Pago Móvil
                      }
                      @if (sale.documentType === 'Invoice') {
                        · Factura
                      } @else if (sale.documentType === 'PendingInvoice') {
                        · Pendiente
                      } @else {
                        · Boleta
                      }
                      @if (sale.invoiceNumber) {
                        · Fact. #{{ sale.invoiceNumber }}
                      }
                    </p>
                  </div>
                  <div class="shrink-0">
                    <a [routerLink]="['/sales', 'sale', sale.id]" class="btn-link">
                      <span class="btn-link-text">Ver más</span>
                      <span class="material-icons text-base">chevron_right</span>
                    </a>
                  </div>
                </div>

                <!-- DESKTOP -->
                <div class="group hidden lg:grid lg:grid-cols-7 items-center px-4 py-3 transition-colors duration-150 hover:bg-bg-muted">
                  <span class="text-[13px] font-medium text-text-main">{{ sale.createdAt | date:'dd/MM/yy HH:mm' }}</span>
                  <span class="text-right text-[13px] font-mono font-bold text-text-main">{{ sale.totalAmount | currency:'BOB':'symbol':'1.2-2' }}</span>
                  <span>
                    @if (sale.paymentMethod === 0) {
                      <span class="text-[11px] font-medium text-text-muted bg-bg-muted px-2 py-0.5 rounded-md">Efectivo</span>
                    } @else {
                      <span class="text-[11px] font-medium text-feedback-info-text bg-feedback-info-bg/10 px-2 py-0.5 rounded-md">Pago Móvil</span>
                    }
                  </span>
                  <span>
                    @if (sale.documentType === 'Invoice') {
                      <span class="text-[11px] font-medium text-feedback-success-text bg-feedback-success-bg/10 px-2 py-0.5 rounded-md">Factura</span>
                    } @else if (sale.documentType === 'PendingInvoice') {
                      <span class="text-[11px] font-medium text-feedback-warning-text bg-feedback-warning-bg/15 px-2 py-0.5 rounded-md">Pendiente</span>
                    } @else {
                      <span class="text-[11px] font-medium text-text-soft bg-bg-muted px-2 py-0.5 rounded-md">Boleta</span>
                    }
                  </span>
                  <span class="text-center text-xs font-bold font-mono text-accent-ui bg-accent-ui/10 px-2 py-0.5 rounded-md w-fit mx-auto">{{ sale.itemCount }}</span>
                  <span class="text-xs text-text-soft font-mono truncate">{{ sale.invoiceNumber ?? '—' }}</span>
                  <div class="flex justify-end">
                    <a [routerLink]="['/sales', 'sale', sale.id]" class="btn-link">
                      <span class="btn-link-text">Ver más</span>
                      <span class="material-icons text-base">chevron_right</span>
                    </a>
                  </div>
                </div>

              </li>
            }
          </ul>
        </div>
      }

      @if (!loading() && totalItems() > 0) {
        <app-paginator
          [page]="query().page!"
          [pageSize]="query().pageSize!"
          [totalItems]="totalItems()"
          (pageChange)="onPage($event)"
          (pageSizeChange)="onPageSize($event)"
        />
      }
    </div>
  `,
})
export default class SalesListPage implements OnInit {
  private saleService = inject(SaleService);

  sales = signal<SaleListDto[]>([]);
  totalItems = signal(0);
  loading = signal(true);

  query = signal<SalesQueryDto>({ page: 1, pageSize: 20 });

  hasDateFilter = computed(() => !!(this.query().dateFrom || this.query().dateTo));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.saleService.getSales(this.query()).subscribe({
      next: (data) => {
        this.sales.set(data.items);
        this.totalItems.set(data.totalCount);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onDateRange(range: DateRange): void {
    this.query.update(q => ({ ...q, dateFrom: range.from, dateTo: range.to, page: 1 }));
    this.load();
  }

  onPage(page: number): void {
    this.query.update(q => ({ ...q, page }));
    this.load();
  }

  onPageSize(pageSize: number): void {
    this.query.update(q => ({ ...q, pageSize, page: 1 }));
    this.load();
  }

  clearFilters(): void {
    this.query.set({ page: 1, pageSize: this.query().pageSize });
    this.load();
  }
}
