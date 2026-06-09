import {
  Component, computed, DestroyRef, inject,
  input, OnInit, output, signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { debounceTime, distinctUntilChanged, finalize, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ProductService } from '../../services/product-service';
import { ProductSearchResult } from './product-search-result';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="relative w-full" (focusout)="handleFocusOut($event)">

      <!-- INPUT -->
      <div class="relative flex items-center">
        <input
          type="text"
          [value]="query()"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (keydown)="onKeyDown($event)"
          placeholder="Buscar producto..."
          class="w-full px-2 py-1 pr-6 border border-border rounded text-[11px] text-text-main
                 placeholder:text-text-soft bg-bg-surface outline-none focus:border-accent-ui
                 focus:ring-2 focus:ring-accent-ui/20 transition-all"
        />
        @if (selected()) {
          <svg class="absolute right-2 w-3.5 h-3.5 text-feedback-success-text pointer-events-none"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
          </svg>
        }
      </div>

      <!-- DROPDOWN -->
      @if (showDropdown()) {
        <div class="absolute z-50 left-0 right-0 mt-0.5 bg-bg-surface border border-border
                    rounded-lg shadow-md overflow-hidden min-w-[280px]">

          @if (isSearching()) {
            <div class="px-3 py-2 text-[10px] text-text-soft animate-pulse flex items-center gap-2">
              <div class="w-2 h-2 bg-accent-ui rounded-full animate-bounce"></div>
              Buscando...
            </div>
          }

          @for (product of results(); track product.id; let i = $index) {
            <button
              type="button"
              (mousedown)="$event.preventDefault()"
              (click)="select(product)"
              (mouseenter)="activeIndex.set(i)"
              class="w-full text-left px-2.5 py-1.5 border-b border-border last:border-0
                     flex items-center justify-between gap-3 transition-colors"
              [class.bg-accent-ui]="activeIndex() === i"
              [class.text-white]="activeIndex() === i"
              [class.bg-bg-surface]="activeIndex() !== i"
            >
              <div class="flex flex-col gap-0.5 min-w-0 flex-1">
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="text-[9px] font-mono px-1 rounded shrink-0"
                    [class.bg-bg-muted]="activeIndex() !== i"
                    [class.text-text-soft]="activeIndex() !== i"
                    [class.bg-white/20]="activeIndex() === i"
                    [class.text-white]="activeIndex() === i">
                    {{ product.internalCode }}
                  </span>
                  <span class="font-bold text-[12px] truncate leading-tight">{{ product.name }}</span>
                </div>
                <span class="text-[8px] uppercase font-bold opacity-80">
                  {{ product.categoryName }} • {{ product.brandName }}
                </span>
              </div>
              <div class="flex flex-col items-end shrink-0 border-l pl-2"
                   [class.border-border]="activeIndex() !== i"
                   [class.border-white/30]="activeIndex() === i">
                <span class="text-[12px] font-black">Bs {{ product.basePrice | number:'1.0-0' }}</span>
                <span class="text-[8px] uppercase opacity-70">{{ product.productVariants.length }} var.</span>
              </div>
            </button>
          }

          @if (showEmpty()) {
            <div class="px-3 py-3 flex flex-col items-center gap-2 bg-bg-muted/30">
              <span class="text-[11px] text-text-soft text-center">
                No se encontró <b class="text-text-main">"{{ query() }}"</b>
              </span>
              @if (allowCreate()) {
                <button type="button" (mousedown)="$event.preventDefault()" (click)="onCreateNew()"
                  class="btn btn-primary btn-sm">
                  + Crear nuevo producto
                </button>
              }
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

  // ── Inputs / Outputs ──────────────────────────────────────────────────
  initialValue = input<string>('');
  allowCreate  = input<boolean>(true);
  productSelected = output<ProductSearchResult | null>();
  createNew       = output<string>();

  // ── Estado ────────────────────────────────────────────────────────────
  query       = signal('');           // texto visible en el input
  selected    = signal(false);        // hay producto confirmado
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

  // ── Eventos ───────────────────────────────────────────────────────────
  onFocus(): void {
  this.isOpen.set(true);
  // NO limpiar aquí — dejar que el usuario decida si escribe
}

  handleFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as HTMLElement;
    if (next && (event.currentTarget as HTMLElement).contains(next)) return;
    this.isOpen.set(false);
    // si dejó texto a medias sin seleccionar, limpiar
    if (!this.selected()) {
      this.query.set('');
      this.results.set([]);
    }
  }

  onInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  
  // primera vez que escribe estando seleccionado → deseleccionar
  if (this.selected()) {
    this.selected.set(false);
    this.productSelected.emit(null);
  }

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

  onCreateNew(): void {
    this.isOpen.set(false);
    this.createNew.emit(this.query());
  }

  onKeyDown(event: KeyboardEvent): void {
    const list = this.results();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.isOpen.set(true);
        this.activeIndex.update(i => (i < list.length - 1 ? i + 1 : 0));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update(i => (i > 0 ? i - 1 : list.length - 1));
        break;
      case 'Enter':
        event.preventDefault();
        if (list[this.activeIndex()]) this.select(list[this.activeIndex()]);
        break;
      case 'Escape':
      case 'Tab':
        this.isOpen.set(false);
        break;
    }
  }
}