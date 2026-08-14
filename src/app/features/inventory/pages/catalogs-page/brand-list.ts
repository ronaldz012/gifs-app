import { Component, computed, inject, signal } from '@angular/core';
import { BrandService } from '@features/inventory/services/brand-service';
import CreateBrand from '@features/inventory/components/create-brand/create-brand.component';
import EditBrand from '@features/inventory/components/edit-brand/edit-brand';
import { ConfirmActionModal } from '@features/inventory/pages/transfer-page/confirm-action-modal/confirm-action-modal';
import { Brand } from '@features/inventory/dtos/brands/brand-dto';
import { UpdateBrandDto } from '@features/inventory/dtos/brands/update-brand-dto';
import { ToastService } from '@core/services/toast-service';
import CatalogList from './catalog-list';

@Component({
  selector: 'app-brand-list',
  imports: [CatalogList, CreateBrand, EditBrand, ConfirmActionModal],
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
            Nueva marca
          </button>
        </div>
      </div>

      <app-catalog-list
        [loading]="loading()"
        [items]="filtered()"
        [headers]="['Prefijo', 'Nombre', 'Descripción', 'Estado', '']"
        cols="90px 1.2fr 1fr 100px 44px"
        [emptyMessage]="emptyMessage()"
        [itemTemplate]="rowTpl"
      />
    </div>

    <ng-template #rowTpl let-brand>
      <!-- Desktop -->
      <div
        class="hidden lg:grid px-4 py-3 border-b border-border last:border-0 hover:bg-accent-ui/5 transition-colors items-center"
        style="grid-template-columns: 90px 1.2fr 1fr 100px 44px"
      >
        <span class="font-mono text-xs text-text-soft uppercase tracking-widest">{{
          brand.prefix
        }}</span>
        <span class="text-sm font-medium text-text-main truncate">{{ brand.name }}</span>
        <span class="text-sm text-text-muted truncate">{{ brand.description || '—' }}</span>
        <button
          type="button"
          (click)="openStatusConfirm(brand)"
          class="justify-self-start inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold"
          [class]="
            brand.isActive
              ? 'bg-feedback-success text-feedback-success-text hover:opacity-80'
              : 'bg-feedback-warning text-feedback-warning-text hover:opacity-80'
          "
        >
          {{ brand.isActive ? 'Activa' : 'Inactiva' }}
        </button>
        <div class="flex justify-end">
          <button
            type="button"
            (click)="openEdit(brand)"
            class="btn-icon text-text-soft hover:text-text-main"
            title="Editar"
          >
            <span class="material-icons text-base">edit</span>
          </button>
        </div>
      </div>

      <!-- Mobile -->
      <div class="lg:hidden px-4 py-3 border-b border-border last:border-0">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-sm font-semibold text-text-main truncate">{{ brand.name }}</span>
            <button
              type="button"
              (click)="openStatusConfirm(brand)"
              class="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold shrink-0"
              [class]="
                brand.isActive
                  ? 'bg-feedback-success text-feedback-success-text'
                  : 'bg-feedback-warning text-feedback-warning-text'
              "
            >
              {{ brand.isActive ? 'Activa' : 'Inactiva' }}
            </button>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <span class="font-mono text-[10px] text-text-soft uppercase tracking-widest">{{
              brand.prefix
            }}</span>
            <button
              type="button"
              (click)="openEdit(brand)"
              class="btn-icon text-text-soft hover:text-text-main"
              title="Editar"
            >
              <span class="material-icons text-base">edit</span>
            </button>
          </div>
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

    @if (editing()) {
      <div
        class="fixed inset-0 bg-overlay z-40 flex items-center justify-center p-4"
        (click)="closeEdit()"
      >
        <div class="w-full max-w-xs" (click)="$event.stopPropagation()">
          <app-edit-brand
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
        [title]="statusConfirm()!.isActive ? '¿Desactivar marca?' : '¿Activar marca?'"
        [description]="
          statusConfirm()!.isActive
            ? 'La marca dejará de estar disponible para nuevos productos.'
            : 'La marca volverá a estar disponible para nuevos productos.'
        "
        [confirmLabel]="statusConfirm()!.isActive ? 'Sí, desactivar' : 'Sí, activar'"
        [submitting]="saving()"
        (confirm)="onStatusConfirm()"
        (close)="statusConfirm.set(null)"
      />
    }
  `,
})
export default class BrandList {
  readonly service = inject(BrandService);
  private toastService = inject(ToastService);

  items = signal<Brand[]>([]);
  loading = signal(false);

  query = signal('');
  includeInactive = signal(false);

  showCreate = signal(false);
  editing = signal<Brand | null>(null);
  statusConfirm = signal<Brand | null>(null);
  saving = signal(false);

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const all = this.items();
    if (!q) return all;
    return all.filter(
      (b) => b.name.toLowerCase().includes(q) || b.prefix.toLowerCase().includes(q),
    );
  });

  emptyMessage = computed(() =>
    this.query() ? 'No hay marcas que coincidan con tu búsqueda.' : 'Registrá tu primera marca.',
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

  onCreated(brand: Brand): void {
    this.toastService.success('Marca creada');
    this.closeCreate();
    this.load();
  }

  openEdit(brand: Brand): void {
    this.editing.set(brand);
  }

  closeEdit(): void {
    this.editing.set(null);
  }

  onUpdated(dto: UpdateBrandDto): void {
    const id = this.editing()!.id;
    this.saving.set(true);
    this.service.updateItem(id, dto).subscribe({
      next: () => {
        this.saving.set(false);
        this.toastService.success('Marca actualizada');
        this.closeEdit();
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  openStatusConfirm(brand: Brand): void {
    this.statusConfirm.set(brand);
  }

  onStatusConfirm(): void {
    const id = this.statusConfirm()!.id;
    this.saving.set(true);
    this.service.updateStatus(id).subscribe({
      next: (isActive) => {
        this.saving.set(false);
        this.items.update((list) => list.map((b) => (b.id === id ? { ...b, isActive } : b)));
        this.toastService.success(isActive ? 'Marca activada' : 'Marca desactivada');
        this.statusConfirm.set(null);
      },
      error: () => this.saving.set(false),
    });
  }

  closeCreate(): void {
    this.showCreate.set(false);
  }
}
