import { Component, computed, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { CategoryService } from '../../../services/category-service';
import { FormsModule } from '@angular/forms';
import { ProductQueryParams, ProductSortBy } from '../../../dtos/products/product-dto';
import { Gender } from '../../../interfaces/gender';
import { BrandService } from '@features/inventory/services/brand-service';

@Component({
  selector: 'app-product-filter-bar',
  imports: [FormsModule],
  templateUrl: './product-filter-bar.html',
  styles: ``,
})
export class ProductFilterBar implements OnInit {
  params = input.required<ProductQueryParams>();
  change = output<Partial<ProductQueryParams>>();
  Gender = Gender;
  ProductSortBy = ProductSortBy;

  private categoryService = inject(CategoryService);
  private brandService = inject(BrandService);

  protected categories = computed(() => this.categoryService.categories());
  protected brands = computed(() => this.brandService.brands());

  searchValue = signal('');

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Sync searchValue cuando params cambia externamente
    effect(() => this.searchValue.set(this.params().filter ?? ''));
  }
  ngOnInit(): void {
    this.categoryService.load();
    this.brandService.load();
  }

  onSearch(value: string) {
    this.searchValue.set(value);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.emit({ filter: value || undefined, page: 1 }), 350);
  }

  onSortChange(value: string) {
    switch (value) {
      case 'stock_asc':
        this.emit({ sortBy: ProductSortBy.Stock, sortDescending: false, page: 1 });
        break;
      case 'stock_desc':
        this.emit({ sortBy: ProductSortBy.Stock, sortDescending: true, page: 1 });
        break;
      default:
        this.emit({ sortBy: ProductSortBy.CreatedAt, sortDescending: true, page: 1 });
    }
  }

  onToggleInactive(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.emit({ includeInactive: checked || undefined, page: 1 });
  }

  currentSort(): string {
    const p = this.params();
    if (p.sortBy === ProductSortBy.Stock) {
      return p.sortDescending ? 'stock_desc' : 'stock_asc';
    }
    return 'created_desc';
  }

  emit(patch: Partial<ProductQueryParams>) {
    this.change.emit(patch);
  }

  hasActiveFilters() {
    const p = this.params();
    return p.filter || p.categoryId || p.brandId || p.gender || p.includeInactive;
  }

  clearAll() {
    this.searchValue.set('');
    this.change.emit({
      filter: undefined,
      categoryId: undefined,
      brandId: undefined,
      gender: undefined,
      includeInactive: undefined,
      sortBy: undefined,
      sortDescending: undefined,
      page: 1,
    });
  }
}
