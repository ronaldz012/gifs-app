import {
  Component,
  input,
  output,
  signal,
  untracked,
  forwardRef, inject, DestroyRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ProductSearchResult } from './product-search-result';
import { CurrencyPipe, NgClass } from '@angular/common';
import { Gender } from '../../interfaces/gender';
import {debounceTime, distinctUntilChanged, finalize, Subject, switchMap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ProductService} from '../../services/product-service';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [CurrencyPipe, NgClass],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProductSearch),
      multi: true,
    },
  ],
  template: `
    <div class="relative w-full" (focusout)="handleFocusOut($event)">
      <input
        type="text"
        [value]="productSearch()"
        (input)="onSearchInput($event)"
        (focus)="onFocus()"
        (keydown)="onKeyDown($event)"
        placeholder="Buscar producto..."
        class="w-full px-2 py-1.5 border border-gray-300 rounded text-[11px] text-gray-900
               focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400
               transition-colors"
        [class.bg-blue-50]="value"
      />

      @if (showDropdown() && (searchResults().length > 0 || isSearching())) {
        <div class="absolute z-[100] left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-52 overflow-y-auto min-w-70">

          @if (isSearching()) {
            <div class="px-3 py-2 text-[10px] text-gray-400 animate-pulse">
              Buscando productos...
            </div>
          }

          @for (product of searchResults(); track product.id; let i = $index) {
            <button
              type="button"
              (mousedown)="$event.preventDefault()"
              (click)="selectProduct(product)"
              (mouseenter)="activeIndex.set(i)"
              class="w-full text-left px-4 py-3 border-b border-gray-100 last:border-0
                     flex items-center justify-between gap-4 transition-all"
              [class.bg-blue-600]="activeIndex() === i"
              [class.text-white]="activeIndex() === i"
              [class.bg-white]="activeIndex() !== i"
            >

              <!-- LEFT -->
              <div class="flex flex-col min-w-0 flex-1">

                <div class="flex items-center gap-2 min-w-0">

                  <!-- código -->
                  <span
                    class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 shrink-0"
                    [ngClass]="{
                      'bg-white/20 text-white': activeIndex() === i
                    }"
                  >
                    {{ product.internalCode }}
                  </span>

                  <!-- nombre -->
                  <span class="font-semibold text-[13px] truncate">
                    {{ product.name }}
                  </span>

                  <!-- genero -->
                  <span
                    class="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border shrink-0"
                    [class.border-white]="activeIndex() === i"
                    [class.border-gray-200]="activeIndex() !== i"
                  >
                    {{ Gender[product.gender] }}
                  </span>
                </div>

                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[10px] opacity-80 uppercase tracking-wider font-medium">
                    {{ product.brandName }}
                  </span>
                  <span class="text-[10px] opacity-50">•</span>
                  <span class="text-[10px] opacity-80 italic">
                    {{ product.categoryName }}
                  </span>
                </div>
              </div>

              <!-- RIGHT -->
              <div class="flex flex-col items-end shrink-0">
                <span class="text-[14px] font-bold">
                  {{ product.basePrice | currency:'Bs' }}
                </span>
                <span class="text-[9px] opacity-70">
                  {{ product.productVariants.length }} vars.
                </span>
              </div>

            </button>
          }


          @if (!isSearching() && searchResults().length === 0 && productSearch().length > 2) {
            <button type="button"
                    (mousedown)="$event.preventDefault()"
                    (click)="onCreateNew()"
                    class="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-blue-50
               border-t border-gray-100 flex items-center gap-1">
              <span>+ Producto no encontrado, crear nuevo</span>
            </button>
          }

        </div>
      }
    </div>
  `,
})
export class ProductSearch implements ControlValueAccessor {
  private productService = inject(ProductService);
  private destroyRef = inject(DestroyRef);
  private searchInput$ = new Subject<string>();
  protected readonly Gender = Gender;

  // ── Outputs ───────────────────────────────────────────────────────────
  productSelected = output<ProductSearchResult | null>();
  createNew = output<string>();

  // ── Estado ────────────────────────────────────────────────────────────
  productSearch = signal('');
  showDropdown = signal(false);
  activeIndex = signal(0);
  isSearching = signal(false);
  searchResults = signal<ProductSearchResult[]>([]);

  value: GUID | null = null;
  private onChange = (value: GUID | null) => {};
  private onTouched = () => {};

  constructor() {
    this.searchInput$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(q => {
        if (!q || q.length < 2) {
          this.searchResults.set([]);
          this.isSearching.set(false);
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

  // ── CVA ───────────────────────────────────────────────────────────────
  writeValue(value: GUID | null): void {
    this.value = value;
    if (!value) untracked(() => this.productSearch.set(''));
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  // ── Eventos ───────────────────────────────────────────────────────────
  onFocus(): void {
    this.showDropdown.set(true);
  }

  handleFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as HTMLElement;
    if (next && (event.currentTarget as HTMLElement).contains(next)) return;
    this.showDropdown.set(false);
    this.onTouched();
    if (!this.value) this.productSearch.set('');
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.productSearch.set(value);
    this.activeIndex.set(0);
    this.showDropdown.set(true);
    this.searchInput$.next(value);

    if (!value.trim()) {
      this.value = null;
      this.onChange(null);
      this.productSelected.emit(null);
    }
  }

  selectProduct(product: ProductSearchResult): void {
    this.productSearch.set(product.name);
    this.value = product.id;
    this.onChange(product.id);
    this.onTouched();
    this.productSelected.emit(product);
    this.showDropdown.set(false);
  }

  onCreateNew(): void {
    this.createNew.emit(this.productSearch());
    this.showDropdown.set(false);
  }

  onKeyDown(event: KeyboardEvent): void {
    const results = this.searchResults();
    if (!this.showDropdown()) {
      if (event.key === 'ArrowDown') this.showDropdown.set(true);
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.update(i => (i < results.length - 1 ? i + 1 : 0));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update(i => (i > 0 ? i - 1 : results.length - 1));
        break;
      case 'Enter':
        event.preventDefault();
        if (results[this.activeIndex()]) this.selectProduct(results[this.activeIndex()]);
        break;
      case 'Escape':
      case 'Tab':
        this.showDropdown.set(false);
        break;
    }
  }
}
