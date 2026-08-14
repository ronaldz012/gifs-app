import { Component, computed, inject, signal } from '@angular/core';
import { CategoryService } from '@features/inventory/services/category-service';
import { CreateCategory } from '@features/inventory/components/create-category/create-category.component';
import EditCategory from '@features/inventory/components/edit-category/edit-category';
import { ConfirmActionModal } from '@features/inventory/pages/transfer-page/confirm-action-modal/confirm-action-modal';
import { Category } from '@features/inventory/dtos/categories/category-dto';
import { UpdateCategoryDto } from '@features/inventory/dtos/categories/update-category-dto';
import { ToastService } from '@core/services/toast-service';
import CatalogList from './catalog-list';

@Component({
  selector: 'app-category-list',
  imports: [CatalogList, CreateCategory, EditCategory, ConfirmActionModal],
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

        <div class="flex items-center gap-3 shrink-0">
          <label
            class="flex items-center gap-2 cursor-pointer select-none"
            title="Mostrar también inactivas"
          >
            <span class="relative inline-flex items-center">
              <input
                type="checkbox"
                class="sr-only peer"
                [checked]="includeInactive()"
                (change)="onToggleInactive($event)"
              />
              <div
                class="w-9 h-5 bg-bg-muted rounded-full peer peer-checked:bg-accent-ui peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"
              ></div>
            </span>
            <span class="text-sm text-text-muted">Incluir inactivas</span>
          </label>

          <button
            type="button"
            (click)="showCreate.set(true)"
            class="btn btn-primary btn-sm flex items-center gap-1"
          >
            <span class="material-icons text-base">add</span>
            Nueva categoría
          </button>
        </div>
      </div>

      <app-catalog-list
        [loading]="loading()"
        [items]="filtered()"
        [headers]="['Nombre', 'Descripción', 'Estado', '']"
        cols="1.2fr 1fr 100px 44px"
        [emptyMessage]="emptyMessage()"
        [itemTemplate]="rowTpl"
      />
    </div>

    <ng-template #rowTpl let-category>
      <div
        class="hidden lg:grid px-4 py-3 border-b border-border last:border-0 hover:bg-accent-ui/5 transition-colors items-center"
        style="grid-template-columns: 1.2fr 1fr 100px 44px"
      >
        <span class="text-sm font-medium text-text-main truncate">{{ category.name }}</span>
        <span class="text-sm text-text-muted truncate">{{ category.description || '—' }}</span>
        <button
          type="button"
          (click)="openStatusConfirm(category)"
          class="justify-self-start inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold"
          [class]="
            category.isActive
              ? 'bg-feedback-success text-feedback-success-text hover:opacity-80'
              : 'bg-feedback-warning text-feedback-warning-text hover:opacity-80'
          "
        >
          {{ category.isActive ? 'Activa' : 'Inactiva' }}
        </button>
        <div class="flex justify-end">
          <button
            type="button"
            (click)="openEdit(category)"
            class="btn-icon text-text-soft hover:text-text-main"
            title="Editar"
          >
            <span class="material-icons text-base">edit</span>
          </button>
        </div>
      </div>

      <div class="lg:hidden px-4 py-3 border-b border-border last:border-0">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-sm font-semibold text-text-main truncate">{{ category.name }}</span>
            <button
              type="button"
              (click)="openStatusConfirm(category)"
              class="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold shrink-0"
              [class]="
                category.isActive
                  ? 'bg-feedback-success text-feedback-success-text'
                  : 'bg-feedback-warning text-feedback-warning-text'
              "
            >
              {{ category.isActive ? 'Activa' : 'Inactiva' }}
            </button>
          </div>
          <button
            type="button"
            (click)="openEdit(category)"
            class="btn-icon text-text-soft hover:text-text-main shrink-0"
            title="Editar"
          >
            <span class="material-icons text-base">edit</span>
          </button>
        </div>
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

    @if (editing()) {
      <div
        class="fixed inset-0 bg-overlay z-40 flex items-center justify-center p-4"
        (click)="closeEdit()"
      >
        <div class="w-full max-w-xs" (click)="$event.stopPropagation()">
          <app-edit-category
            [item]="editing()!"
            [saving]="saving()"
            (saved)="onUpdated($event)"
            (closed)="closeEdit()"
          />
        </div>
      </div>
    }

    @if (statusConfirm()) {
      <app-confirm-action-modal
        [title]="statusConfirm()!.isActive ? '¿Desactivar categoría?' : '¿Activar categoría?'"
        [description]="
          statusConfirm()!.isActive
            ? 'La categoría dejará de estar disponible para nuevos productos.'
            : 'La categoría volverá a estar disponible para nuevos productos.'
        "
        [confirmLabel]="statusConfirm()!.isActive ? 'Sí, desactivar' : 'Sí, activar'"
        [submitting]="saving()"
        (confirm)="onStatusConfirm()"
        (close)="statusConfirm.set(null)"
      />
    }
  `,
})
export default class CategoryList {
  readonly service = inject(CategoryService);
  private toastService = inject(ToastService);

  items = signal<Category[]>([]);
  loading = signal(false);

  query = signal('');
  includeInactive = signal(false);

  showCreate = signal(false);
  editing = signal<Category | null>(null);
  statusConfirm = signal<Category | null>(null);
  saving = signal(false);

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const all = this.items();
    if (!q) return all;
    return all.filter((c) => c.name.toLowerCase().includes(q));
  });

  emptyMessage = computed(() =>
    this.query()
      ? 'No hay categorías que coincidan con tu búsqueda.'
      : 'Registrá tu primera categoría.',
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.getAll(this.includeInactive()).subscribe({
      next: (data) => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  onToggleInactive(event: Event): void {
    this.includeInactive.set((event.target as HTMLInputElement).checked);
    this.load();
  }

  onCreated(category: Category): void {
    this.toastService.success('Categoría creada');
    this.closeCreate();
    this.load();
  }

  openEdit(category: Category): void {
    this.editing.set(category);
  }

  closeEdit(): void {
    this.editing.set(null);
  }

  onUpdated(dto: UpdateCategoryDto): void {
    const id = this.editing()!.id;
    this.saving.set(true);
    this.service.updateItem(id, dto).subscribe({
      next: () => {
        this.saving.set(false);
        this.toastService.success('Categoría actualizada');
        this.closeEdit();
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  openStatusConfirm(category: Category): void {
    this.statusConfirm.set(category);
  }

  onStatusConfirm(): void {
    const id = this.statusConfirm()!.id;
    this.saving.set(true);
    this.service.updateStatus(id).subscribe({
      next: (isActive) => {
        this.saving.set(false);
        this.items.update((list) => list.map((c) => (c.id === id ? { ...c, isActive } : c)));
        this.toastService.success(isActive ? 'Categoría activada' : 'Categoría desactivada');
        this.statusConfirm.set(null);
      },
      error: () => this.saving.set(false),
    });
  }

  closeCreate(): void {
    this.showCreate.set(false);
  }
}
