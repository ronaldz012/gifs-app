import { Component, computed, inject, signal } from '@angular/core';
import { BrandService } from '@features/inventory/services/brand-service';
import CreateBrand from '@features/inventory/components/create-brand/create-brand.component';
import { Brand } from '@features/inventory/dtos/brands/brand-dto';
import { ToastService } from '@core/services/toast-service';
import CatalogList from './catalog-list';

@Component({
  selector: 'app-brand-list',
  imports: [CatalogList, CreateBrand],
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
            placeholder="Buscar marca..."
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
          Nueva marca
        </button>
      </div>

      <app-catalog-list
        [loading]="service.loading()"
        [items]="filtered()"
        [headers]="['Prefijo', 'Nombre', 'Descripción']"
        cols="90px 1.2fr 1fr"
        [emptyMessage]="emptyMessage()"
        [itemTemplate]="rowTpl"
      />
    </div>

    <ng-template #rowTpl let-brand>
      <!-- Desktop -->
      <div
        class="hidden lg:grid px-4 py-3 border-b border-border last:border-0 hover:bg-accent-ui/5 transition-colors"
        style="grid-template-columns: 90px 1.2fr 1fr"
      >
        <span class="font-mono text-xs text-text-soft uppercase tracking-widest">{{
          brand.prefix
        }}</span>
        <span class="text-sm font-medium text-text-main truncate">{{ brand.name }}</span>
        <span class="text-sm text-text-muted truncate">{{ brand.description || '—' }}</span>
      </div>

      <!-- Mobile -->
      <div class="lg:hidden px-4 py-3 border-b border-border last:border-0">
        <div class="flex items-center justify-between gap-2">
          <span class="text-sm font-semibold text-text-main truncate">{{ brand.name }}</span>
          <span class="font-mono text-[10px] text-text-soft uppercase tracking-widest shrink-0">{{
            brand.prefix
          }}</span>
        </div>
        @if (brand.description) {
          <p class="mt-1 text-xs text-text-muted truncate">{{ brand.description }}</p>
        }
      </div>
    </ng-template>

    @if (showCreate()) {
      <div
        class="fixed inset-0 bg-overlay z-40 flex items-center justify-center p-4"
        (click)="closeCreate()"
      >
        <div class="w-full max-w-xs" (click)="$event.stopPropagation()">
          <app-create-brand
            [initialName]="''"
            (created)="onCreated($event)"
            (closed)="closeCreate()"
          />
        </div>
      </div>
    }
  `,
})
export default class BrandList {
  readonly service = inject(BrandService);
  private toastService = inject(ToastService);

  query = signal('');
  showCreate = signal(false);

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const all = this.service.brands();
    if (!q) return all;
    return all.filter(
      (b) => b.name.toLowerCase().includes(q) || b.prefix.toLowerCase().includes(q),
    );
  });

  emptyMessage = computed(() =>
    this.query() ? 'No hay marcas que coincidan con tu búsqueda.' : 'Registrá tu primera marca.',
  );

  constructor() {
    this.service.load();
  }

  onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  onCreated(brand: Brand): void {
    this.service.add(brand);
    this.toastService.success('Marca creada');
    this.closeCreate();
  }

  closeCreate(): void {
    this.showCreate.set(false);
  }
}
