import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SizeService } from '@features/inventory/services/size-service';
import CreateSize from '@features/inventory/components/create-size/create-size.component';
import EditSize from '@features/inventory/components/edit-size/edit-size';
import { ConfirmActionModal } from '@features/inventory/pages/transfer-page/confirm-action-modal/confirm-action-modal';
import { Size } from '@features/inventory/dtos/sizes/size';
import { UpdateSizeDto } from '@features/inventory/dtos/sizes/update-size-dto';
import { ToastService } from '@core/services/toast-service';
import { closeModal, getModalId, openModal } from '@shared/utils/modal-query';
import CatalogList from './catalog-list';

@Component({
  selector: 'app-size-list',
  imports: [CatalogList, CreateSize, EditSize, ConfirmActionModal],
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
            (click)="openCreate()"
            class="btn btn-primary btn-sm flex items-center gap-1"
          >
            <span class="material-icons text-base">add</span>
            Nueva talla
          </button>
        </div>
      </div>

      <app-catalog-list
        [loading]="loading()"
        [items]="filtered()"
        [headers]="['Nombre', 'Orden', 'Estado', '']"
        cols="1.2fr 80px 90px 72px"
        [emptyMessage]="emptyMessage()"
        [itemTemplate]="rowTpl"
      />
    </div>

    <ng-template #rowTpl let-size>
      <div
        class="hidden lg:grid px-4 py-3 border-b border-border last:border-0 hover:bg-accent-ui/5 transition-colors items-center"
        style="grid-template-columns: 1.2fr 80px 90px 72px"
      >
        <span class="text-sm font-medium text-text-main truncate">{{ size.name }}</span>
        <span class="text-sm text-text-muted">Ord. {{ size.sortOrder }}</span>
        <span class="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold justify-self-start"
          [class]="size.isActive ? 'bg-feedback-success text-feedback-success-text' : 'bg-feedback-warning text-feedback-warning-text'">
          {{ size.isActive ? 'Activa' : 'Inactiva' }}
        </span>
        <div class="flex justify-end gap-1">
          <button type="button" (click)="openStatusConfirm(size)" class="action-btn" [class.action-btn--edit]="size.isActive" [class.action-btn--delete]="!size.isActive" [title]="size.isActive ? 'Desactivar' : 'Activar'">
            <span class="material-icons text-base">{{ size.isActive ? 'toggle_on' : 'toggle_off' }}</span>
          </button>
          <button type="button" (click)="openEdit(size)" class="action-btn action-btn--edit" title="Editar">
            <span class="material-icons text-base">edit</span>
          </button>
        </div>
      </div>

      <div class="lg:hidden px-4 py-3 border-b border-border last:border-0 flex flex-col gap-2">
        <div class="flex items-center justify-between gap-2">
          <span class="text-sm font-semibold text-text-main truncate">{{ size.name }}</span>
          <span class="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold shrink-0"
            [class]="size.isActive ? 'bg-feedback-success text-feedback-success-text' : 'bg-feedback-warning text-feedback-warning-text'">
            {{ size.isActive ? 'Activa' : 'Inactiva' }}
          </span>
        </div>
        <p class="text-xs text-text-soft">Ord. {{ size.sortOrder }}</p>
        <div class="flex items-center gap-3">
          <button type="button" (click)="openStatusConfirm(size)" class="action-text" [class.action-text--edit]="size.isActive" [class.action-text--delete]="!size.isActive">
            {{ size.isActive ? 'Desactivar' : 'Activar' }}
          </button>
          <button type="button" (click)="openEdit(size)" class="action-text action-text--edit">Editar</button>
        </div>
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

    @if (editing()) {
      <div
        class="fixed inset-0 bg-overlay z-40 flex items-center justify-center p-4"
        (click)="closeEdit()"
      >
        <div class="w-full max-w-xs" (click)="$event.stopPropagation()">
          <app-edit-size
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
        [title]="statusConfirm()!.isActive ? '¿Desactivar talla?' : '¿Activar talla?'"
        [description]="
          statusConfirm()!.isActive
            ? 'La talla dejará de estar disponible para nuevas variantes.'
            : 'La talla volverá a estar disponible para nuevas variantes.'
        "
        [confirmLabel]="statusConfirm()!.isActive ? 'Sí, desactivar' : 'Sí, activar'"
        [submitting]="saving()"
        (confirm)="onStatusConfirm()"
        (close)="closeModal()"
      />
    }
  `,
})
export default class SizeList {
  readonly service = inject(SizeService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  items = signal<Size[]>([]);
  loading = signal(false);

  query = signal('');
  includeInactive = signal(false);

  showCreate = signal(false);
  editing = signal<Size | null>(null);
  statusConfirm = signal<Size | null>(null);
  saving = signal(false);

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const all = this.items();
    if (!q) return all;
    return all.filter((s) => s.name.toLowerCase().includes(q));
  });

  emptyMessage = computed(() =>
    this.query() ? 'No hay tallas que coincidan con tu búsqueda.' : 'Registrá tu primera talla.',
  );

  constructor() {
    this.load();
    this.route.queryParamMap.subscribe((params) => {
      const tab = params.get('tab');
      const modal = params.get('modal');
      if (tab && tab !== 'tallas') {
        this.showCreate.set(false);
        this.editing.set(null);
        this.statusConfirm.set(null);
        return;
      }
      this.showCreate.set(modal === 'create');
      const editId = getModalId(modal, 'edit');
      const statusId = getModalId(modal, 'status');
      if (editId) {
        this.editing.set(this.items().find((b) => b.id === editId) ?? null);
      } else {
        this.editing.set(null);
      }
      if (statusId) {
        this.statusConfirm.set(this.items().find((b) => b.id === statusId) ?? null);
      } else {
        this.statusConfirm.set(null);
      }
    });
  }

  closeModal(): void {
    closeModal(this.router, this.route);
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

  openCreate(): void {
    openModal(this.router, this.route, 'create');
  }

  onCreated(size: Size): void {
    this.toastService.success('Talla creada');
    this.closeCreate();
    this.load();
  }

  openEdit(size: Size): void {
    openModal(this.router, this.route, `edit:${ size.id }`);
  }

  closeEdit(): void {
    this.closeModal();
  }

  onUpdated(dto: UpdateSizeDto): void {
    const id = this.editing()!.id;
    this.saving.set(true);
    this.service.updateItem(id, dto).subscribe({
      next: () => {
        this.saving.set(false);
        this.toastService.success('Talla actualizada');
        this.closeEdit();
        this.load();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        const e = err as { error?: { detail?: string; title?: string }; message?: string };
        this.toastService.error(e?.error?.detail || e?.error?.title || e?.message || 'Error al actualizar la talla.');
      },
    });
  }

  openStatusConfirm(size: Size): void {
    openModal(this.router, this.route, `status:${ size.id }`);
  }

  onStatusConfirm(): void {
    const id = this.statusConfirm()!.id;
    this.saving.set(true);
    this.service.updateStatus(id).subscribe({
      next: (isActive) => {
        this.saving.set(false);
        this.items.update((list) => list.map((s) => (s.id === id ? { ...s, isActive } : s)));
        this.toastService.success(isActive ? 'Talla activada' : 'Talla desactivada');
        this.closeModal();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        const e = err as { error?: { detail?: string; title?: string }; message?: string };
        this.toastService.error(e?.error?.detail || e?.error?.title || e?.message || 'Error al cambiar el estado de la talla.');
      },
    });
  }

  closeCreate(): void {
    this.closeModal();
  }
}
