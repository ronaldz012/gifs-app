import {Component, input, OnDestroy, OnInit, output, signal} from '@angular/core';
import {ProductSearchResult} from '../../../../../components/product-search/product-search-result';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {ProductSearch} from '../../../../../components/product-search/product-search';
import {DecimalPipe} from '@angular/common';
import {Gender} from '../../../../../interfaces/gender';

@Component({
  selector: 'app-existing-product',
  standalone: true,
  imports: [DecimalPipe, ReactiveFormsModule, ProductSearch, ProductSearch],
  templateUrl: './existing-product.html',
  styles: [`:host { display: contents; }`],
})
export class ExistingProduct implements OnInit,OnDestroy {

  protected readonly Gender = Gender;

  productIdCtrl   = input.required<FormControl<GUID | null>>();
  selectedProduct = signal<ProductSearchResult | null>(null);

  productSelected = output<ProductSearchResult>();
  createNew       = output<string>();
  remove          = output<void>();
  ngOnInit(): void {
    this.productIdCtrl().addValidators([Validators.required]);
  }

  handleProductSelected(product: ProductSearchResult | null): void {
    if (product) {
      this.productIdCtrl().setValue(product.id);
      this.selectedProduct.set(product);
      this.productSelected.emit(product);
    } else {
      this.productIdCtrl().setValue(null);
      this.selectedProduct.set(null);
    }
  }

  ngOnDestroy(): void {
    const ctrl = this.productIdCtrl();
    ctrl.setValue(null);
    ctrl.clearValidators();
    ctrl.updateValueAndValidity();
  }
}
