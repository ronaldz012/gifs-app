import { Component, input, output} from '@angular/core';
import {ProductSearchResult} from '../../../../components/product-search/product-search-result';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {Gender} from '../../../../interfaces/gender';
import {ProductSearch} from '../../../../components/product-search/product-search';
import {DecimalPipe} from '@angular/common';
import { FieldTree } from '@angular/forms/signals';
import { ProductInfo } from '@features/inventory/models/item-form.model';

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
  productIdCtrl   = input.required<FieldTree<ProductInfo>>();
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
