import { Component, computed, DestroyRef, inject, output, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { debounceTime, distinctUntilChanged, finalize, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ProductService } from '@features/inventory/services/product-service';
import { ProductSearchResult } from '@features/inventory/components/product-search/product-search-result.component';

interface FlatVariant {
  product: ProductSearchResult;
  sku: string;
  size: string;
  colorName: string;
  price: number;
}

@Component({
  selector: 'app-pos-search-modal',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './pos-search-modal.html',
  styles: `
    @keyframes modal-in {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .modal-enter { animation: modal-in 180ms ease both; }
  `,
})
export class PosSearchModal {
  private productService = inject(ProductService);
  private destroyRef = inject(DestroyRef);
  private search$ = new Subject<string>();

  variantSelected = output<string>();
  closed = output<void>();

  query = signal('');
  isSearching = signal(false);
  results = signal<FlatVariant[]>([]);

  showEmpty = computed(
    () => !this.isSearching() && this.results().length === 0 && this.query().length >= 2,
  );

  constructor() {
    this.search$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((q) => {
          if (q.length < 2) {
            this.results.set([]);
            this.isSearching.set(false);
            return [];
          }
          this.isSearching.set(true);
          return this.productService
            .searchProduct(q)
            .pipe(finalize(() => this.isSearching.set(false)));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((r) => this.results.set(this.flatten(r)));
  }

  private flatten(products: ProductSearchResult[]): FlatVariant[] {
    return products.flatMap((product) =>
      product.productVariants.map((v) => ({
        product,
        sku: v.sku,
        size: v.size,
        colorName: v.colorName,
        price: v.price,
      })),
    );
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.search$.next(value);
  }

  select(sku: string): void {
    this.variantSelected.emit(sku);
    this.close();
  }

  close(): void {
    this.closed.emit();
  }
}