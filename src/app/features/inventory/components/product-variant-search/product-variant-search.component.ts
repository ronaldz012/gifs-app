import { Component, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, Subject, switchMap, tap } from 'rxjs';
import { ProductService } from '@features/inventory/services/product-service';
import { ProductVariantBySkuDto } from '@features/inventory/dtos/products/product-variant-by-sku-dto';
import { SkuInput } from '@shared/components/sku-input/sku-input';

/**
 * @deprecated Use SkuInput directly (shared/components/sku-input). Kept for backward compat.
 */
@Component({
  selector: 'app-product-variant-search',
  imports: [SkuInput],
  template: `
    <div class="flex flex-col gap-1">
      <app-sku-input [placeholder]="placeholder()" (skuSubmit)="onSkuSubmit($event)" />
      @if (loading()) {
        <span class="text-xs text-text-soft px-1">Buscando...</span>
      }
      @if (errorMsg()) {
        <p class="text-xs text-feedback-error-text px-1">{{ errorMsg() }}</p>
      }
    </div>
  `,
})
export class ProductVariantSearch {
  private productService = inject(ProductService);

  placeholder = input<string>('Código...');
  productFound = output<ProductVariantBySkuDto>();

  loading = signal(false);
  errorMsg = signal('');

  private search$ = new Subject<string>();

  constructor() {
    this.search$
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.errorMsg.set('');
        }),
        switchMap((code) =>
          this.productService.getVariantBySku(code).pipe(
            catchError((err) => {
              const msg =
                err.status === 404
                  ? `No se encontró "${code}"`
                  : err.status === 409
                    ? `El producto "${code}" está inactivo`
                    : 'Error al buscar el producto';
              this.errorMsg.set(msg);
              this.loading.set(false);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((variant) => {
        this.loading.set(false);
        this.productFound.emit(variant);
      });
  }

  onSkuSubmit(code: string): void {
    if (!code || this.loading()) return;
    this.search$.next(code);
  }
}
