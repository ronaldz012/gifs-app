import { Component, input, output} from '@angular/core';
import {ProductSearchResult} from '../../../../components/product-search/product-search-result';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {Gender} from '../../../../interfaces/gender';
import {ProductSearch} from '../../../../components/product-search/product-search';
import {DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-existing-product-info',
  imports: [
    ProductSearch,
    ReactiveFormsModule,
    DecimalPipe
  ],
  templateUrl: './existing-product-info.html',
  styles: ``,
})
export class ExistingProductInfo {

  protected readonly Gender = Gender;

  // ── Inputs ────────────────────────────────────────────────────────────
  productIdCtrl   = input.required<FormControl<GUID | null>>();
  selectedProduct = input<ProductSearchResult | null>(null);

  // ── Outputs ───────────────────────────────────────────────────────────
  productSelected = output<ProductSearchResult>();
  productCleared  = output<void>();

  // ── Handlers ──────────────────────────────────────────────────────────
  handleProductSelected(product: ProductSearchResult | null): void {
    if (product) {
      this.productSelected.emit(product);
    } else {
      this.productCleared.emit();
    }
  }

}
