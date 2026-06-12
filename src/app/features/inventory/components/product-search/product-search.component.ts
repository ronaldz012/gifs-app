import {
  Component, computed, DestroyRef, inject,
  input, OnInit, output, signal,
} from '@angular/core';
import { debounceTime, distinctUntilChanged, finalize, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ProductService } from '../../services/product-service';
import { ProductSearchResult } from './product-search-result.component';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [],
  template: `
    <div class="relative w-full" (focusout)="handleFocusOut($event)">
      ...
    </div>
  `,
})
export class ProductSearch implements OnInit {

  private productService = inject(ProductService);
  private destroyRef     = inject(DestroyRef);
  private search$        = new Subject<string>();

  initialValue = input<string>('');
  allowCreate  = input<boolean>(true);
  productSelected = output<ProductSearchResult | null>();
  createNew       = output<string>();

  query       = signal('');
  selected    = signal(false);
  isSearching = signal(false);
  results     = signal<ProductSearchResult[]>([]);
  activeIndex = signal(0);
  isOpen      = signal(false);

  showDropdown = computed(() => this.isOpen() && !this.selected());
  showEmpty    = computed(() =>
    !this.isSearching() && this.results().length === 0 && this.query().length >= 2
  );

  constructor() {
    this.search$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(q => {
        if (q.length < 2) {
          this.results.set([]);
          this.isSearching.set(false);
          return [];
        }
        this.isSearching.set(true);
        return this.productService.searchProduct(q).pipe(
          finalize(() => this.isSearching.set(false))
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(r => this.results.set(r));
  }

  ngOnInit(): void {
    if (this.initialValue()) {
      this.query.set(this.initialValue());
      this.selected.set(true);
    }
  }

  onFocus(): void { this.isOpen.set(true); }

  handleFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as HTMLElement;
    if (next && (event.currentTarget as HTMLElement).contains(next)) return;
    this.isOpen.set(false);
    if (!this.selected()) { this.query.set(''); this.results.set([]); }
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (this.selected()) { this.selected.set(false); this.productSelected.emit(null); }
    this.query.set(value);
    this.activeIndex.set(0);
    this.search$.next(value);
  }

  select(product: ProductSearchResult): void {
    this.query.set(product.name);
    this.selected.set(true);
    this.isOpen.set(false);
    this.results.set([]);
    this.productSelected.emit(product);
  }

  onCreateNew(): void { this.isOpen.set(false); this.createNew.emit(this.query()); }

  onKeyDown(event: KeyboardEvent): void {
    const list = this.results();
    switch (event.key) {
      case 'ArrowDown': event.preventDefault(); this.isOpen.set(true); this.activeIndex.update(i => (i < list.length - 1 ? i + 1 : 0)); break;
      case 'ArrowUp': event.preventDefault(); this.activeIndex.update(i => (i > 0 ? i - 1 : list.length - 1)); break;
      case 'Enter': event.preventDefault(); if (list[this.activeIndex()]) this.select(list[this.activeIndex()]); break;
      case 'Escape':
      case 'Tab': this.isOpen.set(false); break;
    }
  }
}
