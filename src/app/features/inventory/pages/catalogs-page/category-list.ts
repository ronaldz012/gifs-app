import { Component, computed, inject, signal } from '@angular/core';
import { CategoryService } from '@features/inventory/services/category-service';
import { CreateCategory } from '@features/inventory/components/create-category/create-category.component';
import { Category } from '@features/inventory/dtos/categories/category-dto';
import { ToastService } from '@core/services/toast-service';
import CatalogList from './catalog-list';

@Component({
  selector: 'app-category-list',
  imports: [CatalogList, CreateCategory],
  template: `
    <div class="flex flex-col gap-4 w-full">
      <div class="flex items-center justify-between gap-3">
        <div class="relative flex-1 max-w-xs">
          <span
            class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-text-soft text-lg"
            >search</span
          >
          <input
            type="text"
            placeholder="Buscar categoría..."
            [value]="query()"
            (input)="onQuery($event)"
            class="w-full pl-9 pr-3 py-2 text-sm text-text-main bg-bg-surface border border-border rounded-lg
                   focus:outline-none focus:border-border-strong focus:ring-2 focus:ring-ring-focus-ring"
          />
        </div>
        <button
          type="button"
          (click)="showCreate.set(true)"
          class="btn btn-primary btn-sm shrink-0 flex items-center gap-1"
        >
          <span class="material-icons text-base">add</span>
          Nueva categoría
        </button>
      </div>

      <app-catalog-list
        [loading]="service.loading()"
        [items]="filtered()"
        [headers]="['Nombre', 'Descripción']"
        cols="1.2fr 1fr"
        [emptyMessage]="emptyMessage()"
        [itemTemplate]="rowTpl"
      />
    </div>

    <ng-template #rowTpl let-category>
      <div
        class="hidden lg:grid px-4 py-3 border-b border-border last:border-0 hover:bg-accent-ui/5 transition-colors"
        style="grid-template-columns: 1.2fr 1fr"
      >
        <span class="text-sm font-medium text-text-main truncate">{{ category.name }}</span>
        <span class="text-sm text-text-muted truncate">{{ category.description || '—' }}</span>
      </div>

      <div class="lg:hidden px-4 py-3 border-b border-border last:border-0">
        <span class="text-sm font-semibold text-text-main">{{ category.name }}</span>
        @if (category.description) {
          <p class="mt-1 text-xs text-text-muted truncate">{{ category.description }}</p>
        }
      </div>
    </ng-template>

    @if (showCreate()) {
      <div
        class="fixed inset-0 bg-overlay z-40 flex items-center justify-center p-4"
        (click)="closeCreate()"
      >
        <div class="w-full max-w-xs" (click)="$event.stopPropagation()">
          <app-create-category
            [initialName]="''"
            (created)="onCreated($event)"
            (closed)="closeCreate()"
          />
        </div>
      </div>
    }
  `,
})
export default class CategoryList {
  readonly service = inject(CategoryService);
  private toastService = inject(ToastService);

  query = signal('');
  showCreate = signal(false);

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const all = this.service.categories();
    if (!q) return all;
    return all.filter((c) => c.name.toLowerCase().includes(q));
  });

  emptyMessage = computed(() =>
    this.query()
      ? 'No hay categorías que coincidan con tu búsqueda.'
      : 'Registrá tu primera categoría.',
  );

  constructor() {
    this.service.load();
  }

  onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  onCreated(category: Category): void {
    this.service.add(category);
    this.toastService.success('Categoría creada');
    this.closeCreate();
  }

  closeCreate(): void {
    this.showCreate.set(false);
  }
}
