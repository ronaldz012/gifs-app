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
      <div class="relative">
        <input
          type="text"
          [value]="query()"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (keydown)="onKeyDown($event)"
          placeholder="Buscá por nombre, código o SKU..."
          class="w-full px-3 py-2 pr-10 text-[13px] text-text-main bg-bg-surface border border-border rounded-lg
                 placeholder:text-text-soft focus:outline-none focus:ring-1 focus:ring-accent-ui focus:border-accent-ui
                 transition-colors duration-150"
        />
        @if (isSearching()) {
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-soft animate-spin">⟳</span>
        }
      </div>

      @if (showDropdown()) {
        <div class="absolute z-50 mt-1 w-full bg-bg-elevated border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          @for (product of results(); track product.id; let i = $index) {
            <button
              type="button"
              (click)="select(product)"
              (mouseenter)="activeIndex.set(i)"
              class="w-full text-left px-3 py-2 text-[12px] transition-colors flex items-center gap-3
                     [&.active]:bg-accent-ui/10"
              [class.active]="i === activeIndex()"
              [class.bg-accent-ui/10]="i === activeIndex()"
            >
              <span class="w-20 shrink-0 font-mono text-[11px] text-text-soft truncate">{{ product.internalCode }}</span>
              <span class="flex-1 font-medium text-text-main truncate">{{ product.name }}</span>
              <span class="text-[11px] text-text-muted shrink-0">{{ product.brandName }}</span>
            </button>
          }
          @if (allowCreate()) {
            <button
              type="button"
              (click)="onCreateNew()"
              class="w-full text-left px-3 py-2 text-[12px] text-accent-ui font-semibold border-t border-border
                     hover:bg-accent-ui/5 transition-colors flex items-center gap-2"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Crear "{{ query() }}"
            </button>
          }
          @if (showEmpty()) {
            <div class="px-3 py-4 text-center text-[12px] text-text-soft italic">
              Sin resultados para "{{ query() }}"
            </div>
          }
        </div>
      }
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
