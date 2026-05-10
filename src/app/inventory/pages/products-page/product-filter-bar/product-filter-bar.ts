import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CategoryService } from '../../../services/category-service';
import { BrandService } from '../../../services/brand-service';
import { FormsModule } from '@angular/forms';
import { ProductQueryParams } from '../../../dtos/products/product-dto';
import { Gender } from '../../../interfaces/gender';

@Component({
  selector: 'app-product-filter-bar',
  imports: [
    FormsModule
  ],
  templateUrl: './product-filter-bar.html',
  styles: ``,
})
export class ProductFilterBar {
  params = input.required<ProductQueryParams>();
  change = output<Partial<ProductQueryParams>>();
  Gender = Gender

  private categoryService = inject(CategoryService);
  private brandService = inject(BrandService);

  categories = signal<{ id: GUID; name: string }[]>([]);
  brands = signal<{ id: GUID; name: string }[]>([]);
  searchValue = signal('');

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Sync searchValue cuando params cambia externamente
    effect(() => this.searchValue.set(this.params().filter ?? ''));

    this.categoryService.getAll().subscribe(r => this.categories.set(r));
    this.brandService.getAll().subscribe(r => this.brands.set(r));
  }

  onSearch(value: string) {
    this.searchValue.set(value);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() =>
      this.emit({ filter: value || undefined, page: 1 }), 350);
  }

  emit(patch: Partial<ProductQueryParams>) {
    this.change.emit(patch);
  }

  hasActiveFilters() {
    const p = this.params();
    return p.filter || p.categoryId || p.brandId || p.gender || p.lowStock;
  }

  clearAll() {
    this.searchValue.set('');
    this.change.emit({
      filter: undefined, categoryId: undefined,
      brandId: undefined, gender: undefined,
      lowStock: undefined, page: 1
    });

  }
}
