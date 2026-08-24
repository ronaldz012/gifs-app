import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProviderService } from '@features/inventory/services/provider-service';
import CreateProvider from '@features/inventory/components/create-provider/create-provider';
import EditProvider from '@features/inventory/components/edit-provider/edit-provider';
import { ConfirmActionModal } from '@features/inventory/pages/transfer-page/confirm-action-modal/confirm-action-modal';
import { Provider } from '@features/inventory/dtos/providers/provider';
import { UpdateProviderDto } from '@features/inventory/dtos/providers/update-provider-dto';
import { ToastService } from '@core/services/toast-service';
import { closeModal, getModalId, openModal } from '@shared/utils/modal-query';

@Component({
  selector: 'app-providers-page',
  imports: [CreateProvider, EditProvider, ConfirmActionModal, RouterLink],
  template: `
    <div class="flex flex-col gap-4 w-full">
      <!-- Header: volver + título + acciones -->
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <a routerLink="/inventory/receptions" class="btn-icon">
            <span class="material-icons text-base">arrow_back</span>
          </a>
          <h1 class="text-lg font-black text-text-main">Proveedores</h1>
        </div>
        <button
          type="button"
          (click)="openCreate()"
          class="btn btn-primary btn-sm shrink-0 flex items-center gap-1"
        >
          <span class="material-icons text-base">add</span>
          Nuevo proveedor
        </button>
      </div>

      <!-- Filtros -->
      <div class="flex items-center gap-3">
        <div class="relative flex-1 max-w-xs">
          <span
            class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-text-soft text-lg"
            >search</span
          >
          <input
            type="text"
            placeholder="Buscar proveedor..."
            [value]="query()"
            (input)="onQuery($event)"
            class="w-full pl-9 pr-3 py-2 text-sm text-text-main bg-bg-surface border border-border rounded-lg
                   focus:outline-none focus:border-border-strong focus:ring-2 focus:ring-ring-focus-ring"
          />
        </div>

        <label
          class="flex items-center gap-2 cursor-pointer select-none shrink-0"
          title="Mostrar también inactivos"
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
          <span class="text-sm text-text-muted">Incluir inactivos</span>
        </label>
      </div>

      <!-- Lista -->
      @if (loading()) {
        <div class="flex flex-col gap-3">
          @for (_ of [1, 2, 3, 4]; track $index) {
            <div class="bg-bg-surface rounded-xl border border-border p-4 animate-pulse">
              <div class="flex items-center gap-3">
                <div class="h-4 flex-1 bg-bg-muted rounded"></div>
                <div class="h-4 w-16 bg-bg-muted rounded shrink-0"></div>
              </div>
            </div>
          }
        </div>
      } @else if (filteredProviders().length === 0) {
        <div
          class="flex flex-col items-center justify-center gap-3 py-20 bg-bg-surface border border-dashed border-border rounded-2xl text-text-soft"
        >
          <div
            class="w-16 h-16 rounded-full bg-bg-muted flex items-center justify-center text-text-soft/40"
          >
            <span class="material-icons text-[36px]">local_shipping</span>
          </div>
          <div class="text-center px-6">
            <p class="font-bold text-text-main text-sm">Sin proveedores</p>
            <p class="text-xs max-w-xs mt-1">
              {{
                query()
                  ? 'No hay proveedores que coincidan con tu búsqueda.'
                  : 'Registrá tu primer proveedor.'
              }}
            </p>
          </div>
        </div>
      } @else {
        <!-- Desktop -->
        <div class="hidden lg:block bg-bg-surface rounded-xl border border-border overflow-hidden">
          <div class="hidden lg:grid grid-cols-[1.2fr_1fr_1fr_1fr_90px_72px] px-4 py-3 bg-bg-muted border-b border-border text-[10px] font-bold uppercase tracking-wider text-text-soft">
            <span>Nombre</span>
            <span>Contacto</span>
            <span>Email</span>
            <span>Teléfono</span>
            <span>Estado</span>
            <span></span>
          </div>
          @for (p of filteredProviders(); track p.id) {
            <div class="hidden lg:grid grid-cols-[1.2fr_1fr_1fr_1fr_90px_72px] px-4 py-3 border-b border-border last:border-0 hover:bg-accent-ui/5 transition-colors items-center">
              <span class="text-sm font-medium text-text-main truncate">{{ p.name }}</span>
              <span class="text-sm text-text-muted truncate">{{ p.contactName || '—' }}</span>
              <span class="text-sm text-text-muted truncate">{{ p.email || '—' }}</span>
              <span class="text-sm text-text-muted truncate">{{ p.phoneNumber || '—' }}</span>
              <span class="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold justify-self-start"
                [class]="p.isActive ? 'bg-feedback-success text-feedback-success-text' : 'bg-feedback-warning text-feedback-warning-text'">
                {{ p.isActive ? 'Activo' : 'Inactivo' }}
              </span>
              <div class="flex justify-end gap-1">
                <button type="button" (click)="openStatusConfirm(p)" class="action-btn" [class.action-btn--edit]="p.isActive" [class.action-btn--delete]="!p.isActive" [title]="p.isActive ? 'Desactivar' : 'Activar'">
                  <span class="material-icons text-base">{{ p.isActive ? 'toggle_on' : 'toggle_off' }}</span>
                </button>
                <button type="button" (click)="openEdit(p)" class="action-btn action-btn--edit" title="Editar">
                  <span class="material-icons text-base">edit</span>
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Mobile -->
        <div class="lg:hidden flex flex-col gap-3">
          @for (p of filteredProviders(); track p.id) {
            <div class="bg-bg-surface rounded-xl border border-border p-4 flex flex-col gap-2">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-text-main truncate">{{ p.name }}</p>
                  @if (p.contactName) { <p class="text-xs text-text-muted truncate">{{ p.contactName }}</p> }
                  @if (p.email) { <p class="text-xs text-text-muted truncate">{{ p.email }}</p> }
                  @if (p.phoneNumber) { <p class="text-xs font-mono text-text-soft">{{ p.phoneNumber }}</p> }
                </div>
                <span class="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold shrink-0"
                  [class]="p.isActive ? 'bg-feedback-success text-feedback-success-text' : 'bg-feedback-warning text-feedback-warning-text'">
                  {{ p.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
              <div class="flex items-center gap-3">
                <button type="button" (click)="openStatusConfirm(p)" class="action-text" [class.action-text--edit]="p.isActive" [class.action-text--delete]="!p.isActive">
                  {{ p.isActive ? 'Desactivar' : 'Activar' }}
                </button>
                <button type="button" (click)="openEdit(p)" class="action-text action-text--edit">Editar</button>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Modal crear -->
    @if (showCreate()) {
      <div
        class="fixed inset-0 bg-overlay z-40 flex items-center justify-center p-4"
        (click)="closeCreate()"
      >
        <div class="w-full max-w-xs" (click)="$event.stopPropagation()">
          <app-create-provider
            [initialName]="''"
            (created)="onCreated($event)"
            (closed)="closeCreate()"
          />
        </div>
      </div>
    }

    <!-- Modal editar -->
    @if (editing()) {
      <app-edit-provider
        [item]="editing()!"
        [saving]="saving()"
        (saved)="onUpdated($event)"
        (closed)="closeEdit()"
      />
    }

    <!-- Modal estado -->
    @if (statusConfirm()) {
      <app-confirm-action-modal
        [title]="statusConfirm()!.isActive ? '¿Desactivar proveedor?' : '¿Activar proveedor?'"
        [description]="
          statusConfirm()!.isActive
            ? 'El proveedor dejará de estar disponible para nuevas recepciones.'
            : 'El proveedor volverá a estar disponible para nuevas recepciones.'
        "
        [confirmLabel]="statusConfirm()!.isActive ? 'Sí, desactivar' : 'Sí, activar'"
        [submitting]="saving()"
        (confirm)="onStatusConfirm()"
        (close)="closeModal()"
      />
    }
  `,
})
export default class ProvidersPage {
  private providerService = inject(ProviderService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  items = signal<Provider[]>([]);
  loading = signal(false);

  query = signal('');
  includeInactive = signal(false);

  showCreate = signal(false);
  editing = signal<Provider | null>(null);
  statusConfirm = signal<Provider | null>(null);
  saving = signal(false);

  filteredProviders = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.items();
    return this.items().filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.contactName ?? '').toLowerCase().includes(q) ||
        (p.email ?? '').toLowerCase().includes(q),
    );
  });

  constructor() {
    this.load();
    this.route.queryParamMap.subscribe((params) => {
      const modal = params.get('modal');
      this.showCreate.set(modal === 'create');
      const editId = getModalId(modal, 'edit');
      const statusId = getModalId(modal, 'status');
      if (editId) {
        this.editing.set(this.items().find((p) => p.id === editId) ?? null);
      } else {
        this.editing.set(null);
      }
      if (statusId) {
        this.statusConfirm.set(this.items().find((p) => p.id === statusId) ?? null);
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
    this.providerService.getAll(this.includeInactive()).subscribe({
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

  onCreated(provider: Provider): void {
    this.toastService.success('Proveedor creado');
    this.closeCreate();
    this.load();
  }

  openEdit(provider: Provider): void {
    openModal(this.router, this.route, `edit:${provider.id}`);
  }

  closeEdit(): void {
    this.closeModal();
  }

  onUpdated(dto: UpdateProviderDto): void {
    const id = this.editing()!.id;
    this.saving.set(true);
    this.providerService.updateItem(id, dto).subscribe({
      next: () => {
        this.saving.set(false);
        this.toastService.success('Proveedor actualizado');
        this.closeEdit();
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  openStatusConfirm(provider: Provider): void {
    openModal(this.router, this.route, `status:${provider.id}`);
  }

  onStatusConfirm(): void {
    const id = this.statusConfirm()!.id;
    this.saving.set(true);
    this.providerService.updateStatus(id).subscribe({
      next: (isActive) => {
        this.saving.set(false);
        this.items.update((list) => list.map((p) => (p.id === id ? { ...p, isActive } : p)));
        this.toastService.success(isActive ? 'Proveedor activado' : 'Proveedor desactivado');
        this.closeModal();
      },
      error: () => this.saving.set(false),
    });
  }

  closeCreate(): void {
    this.closeModal();
  }
}
