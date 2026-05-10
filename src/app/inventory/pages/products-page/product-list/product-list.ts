import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../services/product-service';
import { ListProductDto } from '../../../interfaces/listProductDto';
import ProductItem from './product-item/product-item';
import { SkeletonList } from '../../../../core/ui/skeleton-list/skeleton-list';
import { ProductFilterBar } from '../product-filter-bar/product-filter-bar';
import { Paginator } from '../../../../core/components/app-paginator/app-paginator';
import { ProductQueryParams } from '../../../dtos/products/product-dto';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [ProductItem, SkeletonList, Paginator, ProductFilterBar, Paginator],
  template: `
    <div class="flex flex-col gap-3">
      <!-- Filtros -->
      <app-product-filter-bar
        [params]="query()"
        (change)="patchQuery($event)" />

      <!-- Lista -->
      @if (loading()) {
        <app-skeleton-list [rows]="4" [columns]="3" />
      } @else if (products().length === 0) {
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-12
                flex flex-col items-center gap-3">
          <span class="text-3xl opacity-30">👕</span>
          <p class="text-sm text-gray-400">No se encontraron productos.</p>
          @if (hasActiveFilters()) {
            <button
              class="text-sm text-indigo-500 hover:underline"
              (click)="patchQuery({ filter: undefined, categoryId: undefined,
                                brandId: undefined, gender: undefined,
                                lowStock: undefined, page: 1 })">
              Limpiar filtros
            </button>
          }
        </div>
      } @else {
        <!-- Wrapper desktop: borde + header + lista unificados -->
        <div class="flex flex-col gap-2.5
                lg:gap-0 lg:border lg:border-gray-200 lg:rounded-xl lg:overflow-hidden lg:shadow-sm lg:bg-white">

          <!-- Header columnas — solo desktop -->
          <div class="hidden lg:grid px-4 py-2 border-b border-gray-100
                  text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50/80"
               style="grid-template-columns: 7rem 1fr 10rem 7rem 5rem 6rem 6.5rem;">
            <span>Código</span>
            <span>Nombre</span>
            <span>Marca / Cat.</span>
            <span class="text-right pr-4">Variantes</span>
            <span class="text-right pr-4">Stock</span>
            <span class="text-right pr-4">Precio</span>
            <span></span>
          </div>

          <!-- Items -->
          <ul class="flex flex-col gap-2.5 lg:gap-0 lg:divide-y lg:divide-gray-100">
            @for (p of products(); track p.id; let i = $index) {
              <app-product-item
                class="row-enter"
                [style.animation-delay.ms]="i * 30"
                [product]="p"
                [index]="i"
                (viewDetail)="goToDetail($event)"
                (viewStock)="goToStock($event)"
                (viewMovements)="goToMovements($event)" />
            }
          </ul>
        </div>
      }

      <!-- Paginador -->
      @if (!loading() && totalItems() > 0) {
        <app-paginator
          [page]="query().page!"
          [pageSize]="query().pageSize!"
          [totalItems]="totalItems()"
          (pageChange)="patchQuery({ page: $event })"
          (pageSizeChange)="patchQuery({ pageSize: $event, page: 1 })" />
      }
    </div>
  `,
  styles: [`
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .row-enter { animation: slide-up 220ms ease both; }
  `]
})
export default class ProductList implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  products = signal<ListProductDto[]>([]);
  totalItems = signal(0);
  loading = signal(false);

  query = signal<ProductQueryParams>({
    isPaged: true,
    page: 1,
    pageSize: 20,
    sortBy: 'Name',
    sortDirection: 'asc',
  });

  hasActiveFilters = computed(() => {
    const q = this.query();
    return !!(q.filter || q.categoryId || q.brandId || q.gender || q.lowStock);
  });

  ngOnInit() { this.load(); }

  patchQuery(patch: Partial<ProductQueryParams>) {
    this.query.update(q => ({ ...q, ...patch }));
    this.load();
  }

  load() {
    this.loading.set(true);
    this.productService.getProducts(this.query()).subscribe({
      next: data => {
        this.products.set(data.items);
        this.totalItems.set(data.totalCount); // ajusta al nombre real de tu PagedResult
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goToDetail(id: GUID) { this.router.navigate(['inventory', 'products', id, 'detail']); }
  goToStock(id: GUID) { this.router.navigate(['inventory','products', id, 'stock']); }
  goToMovements(id: GUID) { this.router.navigate(['inventory','products', id, 'movements']); }
}
