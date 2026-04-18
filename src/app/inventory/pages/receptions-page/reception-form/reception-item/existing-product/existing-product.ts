import {
  Component,
  DestroyRef, EventEmitter,
  inject,
  input, model, OnDestroy,
  OnInit, Output,
  output,
  signal,
} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs';
import { ProductSearchResult } from '../../../../../components/product-search/product-search-result';
import { ProductService } from '../../../../../services/product-service';
import {ProductSearch} from '../../../../../components/product-search/product-search';
import {Gender} from '../../../../../interfaces/gender';

@Component({
  selector: 'app-existing-product',
  standalone: true,
  imports: [DecimalPipe, ReactiveFormsModule, ProductSearch],
  templateUrl: './existing-product.html',
  styles: [`
    :host {
      display: contents;
    }
  `],
})
export class ExistingProduct implements OnInit, OnDestroy {

  private productService = inject(ProductService);
  private destroyRef     = inject(DestroyRef);
  protected readonly Gender = Gender;


  // ── Inputs ────────────────────────────────────────────────────────────
  productIdCtrl = input.required<FormControl<number | null>>();
  selectedProduct = signal<ProductSearchResult | null>(null);

  // ── Outputs ───────────────────────────────────────────────────────────
  productSelected  = output<ProductSearchResult>();
  switchMode       = output<void>(); // to switch no new mode
  remove           = output<void>(); //to remove this item

  // ── Estado UI ─────────────────────────────────────────────────────────
  isSearching     = signal(false);
  searchResults   = signal<ProductSearchResult[]>([]);
  private searchInput$ = new Subject<string>();

  ngOnInit(): void {
    //Required validators
    this.productIdCtrl().setValidators([Validators.required]);
    // SEARCH
    this.searchInput$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(q => {
        if (!q || q.length < 2) {
          this.searchResults.set([])
          this.isSearching.set(false);
          this.selectedProduct.set(null);
          this.productIdCtrl().setValue(null);
          return [];
        }
        this.isSearching.set(true);
        return this.productService.searchProduct(q).pipe(
          finalize(() => this.isSearching.set(false))
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(results => this.searchResults.set(results));
  }

  // Se llama desde el HTML cuando el nieto (app-product-search) emite texto
  handleSearchChanged(query: string): void {
    this.searchInput$.next(query);
  }

  // Se llama cuando se hace click en un producto de la lista
  handleProductSelected(product: ProductSearchResult | null): void {
    if (product) {
      this.productIdCtrl().setValue(product.id);
      this.productSelected.emit(product);
      this.selectedProduct.set(product);
      this.searchResults.set([]);
    } else {
      this.productIdCtrl().setValue(null);
      this.searchResults.set([]);
    }
  }






  ngOnDestroy(): void {
    this.productIdCtrl().setValue(null);
    this.productIdCtrl().clearValidators();
    this.searchResults.set([]);
  }
}
