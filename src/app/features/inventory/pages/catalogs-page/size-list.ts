import { Component, computed, inject, signal } from '@angular/core';
import { SizeService } from '@features/inventory/services/size-service';
import CreateSize from '@features/inventory/components/create-size/create-size.component';
import { Size } from '@features/inventory/dtos/sizes/size';
import { ToastService } from '@core/services/toast-service';
import CatalogList from './catalog-list';

@Component({
  selector: 'app-size-list',
  imports: [CatalogList, CreateSize],
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
            placeholder="Buscar talla..."
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
          Nueva talla
        </button>
      </div>

      <app-catalog-list
        [loading]="service.loading()"
        [items]="filtered()"
        [headers]="['Nombre', 'Orden']"
        cols="1.2fr 120px"
        [emptyMessage]="emptyMessage()"
        [itemTemplate]="rowTpl"
      />
    </div>

    <ng-template #rowTpl let-size>
      <div
        class="hidden lg:grid px-4 py-3 border-b border-border last:border-0 hover:bg-accent-ui/5 transition-colors"
        style="grid-template-columns: 1.2fr 120px"
      >
        <span class="text-sm font-medium text-text-main truncate">{{ size.name }}</span>
        <span class="text-sm text-text-muted">{{ size.sortOrder }}</span>
      </div>

      <div class="lg:hidden px-4 py-3 border-b border-border last:border-0">
        <span class="text-sm font-semibold text-text-main">{{ size.name }}</span>
      </div>
    </ng-template>

    @if (showCreate()) {
      <div
        class="fixed inset-0 bg-overlay z-40 flex items-center justify-center p-4"
        (click)="closeCreate()"
      >
        <div class="w-full max-w-xs" (click)="$event.stopPropagation()">
          <app-create-size
            [initialName]="''"
            (created)="onCreated($event)"
            (closed)="closeCreate()"
          />
        </div>
      </div>
    }
  `,
})
export default class SizeList {
  readonly service = inject(SizeService);
  private toastService = inject(ToastService);

  query = signal('');
  showCreate = signal(false);

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const all = this.service.sizes();
    if (!q) return all;
    return all.filter((s) => s.name.toLowerCase().includes(q));
  });

  emptyMessage = computed(() =>
    this.query() ? 'No hay tallas que coincidan con tu búsqueda.' : 'Registrá tu primera talla.',
  );

  constructor() {
    this.service.load();
  }

  onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  onCreated(size: Size): void {
    this.service.add(size);
    this.toastService.success('Talla creada');
    this.closeCreate();
  }

  closeCreate(): void {
    this.showCreate.set(false);
  }
}
