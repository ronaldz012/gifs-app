import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProviderService } from '@features/inventory/services/provider-service';
import CreateProvider from '@features/inventory/components/create-provider/create-provider';
import EditProvider from '@features/inventory/components/edit-provider/edit-provider';
import { ConfirmActionModal } from '@features/inventory/pages/transfer-page/confirm-action-modal/confirm-action-modal';
import { Provider } from '@features/inventory/dtos/providers/provider';
import { UpdateProviderDto } from '@features/inventory/dtos/providers/update-provider-dto';
import { ToastService } from '@core/services/toast-service';

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
          (click)="showCreate.set(true)"
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
          <div
            class="hidden lg:grid grid-cols-[1.2fr_1fr_1fr_1fr_100px_44px] px-4 py-3 bg-bg-muted border-b border-border"
          >
            <span class="text-[10px] font-bold uppercase tracking-wider text-text-soft"
              >Nombre</span
            >
            <span class="text-[10px] font-bold uppercase tracking-wider text-text-soft"
              >Contacto</span
            >
            <span class="text-[10px] font-bold uppercase tracking-wider text-text-soft">Email</span>
            <span class="text-[10px] font-bold uppercase tracking-wider text-text-soft"
              >Teléfono</span
            >
            <span class="text-[10px] font-bold uppercase tracking-wider text-text-soft"
              >Estado</span
            >
            <span></span>
          </div>
          @for (p of filteredProviders(); track p.id) {
            <div
              class="hidden lg:grid grid-cols-[1.2fr_1fr_1fr_1fr_100px_44px] px-4 py-3 border-b border-border last:border-0 hover:bg-accent-ui/5 transition-colors items-center"
            >
              <span class="text-sm font-medium text-text-main truncate">{{ p.name }}</span>
              <span class="text-sm text-text-muted truncate">{{ p.contactName || '—' }}</span>
              <span class="text-sm text-text-muted truncate">{{ p.email || '—' }}</span>
              <span class="text-sm text-text-muted truncate">{{ p.phoneNumber || '—' }}</span>
              <button
                type="button"
                (click)="openStatusConfirm(p)"
                class="justify-self-start inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold"
                [class]="
                  p.isActive
                    ? 'bg-feedback-success text-feedback-success-text hover:opacity-80'
                    : 'bg-feedback-warning text-feedback-warning-text hover:opacity-80'
                "
              >
                {{ p.isActive ? 'Activo' : 'Inactivo' }}
              </button>
              <div class="flex justify-end">
                <button
                  type="button"
                  (click)="openEdit(p)"
                  class="btn-icon text-text-soft hover:text-text-main"
                  title="Editar"
                >
                  <span class="material-icons text-base">edit</span>
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Mobile -->
        <div class="lg:hidden flex flex-col gap-3">
          @for (p of filteredProviders(); track p.id) {
            <div class="bg-bg-surface rounded-xl border border-border p-4">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-sm font-semibold text-text-main truncate">{{ p.name }}</span>
                  <button
                    type="button"
                    (click)="openStatusConfirm(p)"
                    class="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold shrink-0"
                    [class]="
                      p.isActive
                        ? 'bg-feedback-success text-feedback-success-text'
                        : 'bg-feedback-warning text-feedback-warning-text'
                    "
                  >
                    {{ p.isActive ? 'Activo' : 'Inactivo' }}
                  </button>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  @if (p.phoneNumber) {
                    <span class="tag-neutral">{{ p.phoneNumber }}</span>
                  }
                  <button
                    type="button"
                    (click)="openEdit(p)"
                    class="btn-icon text-text-soft hover:text-text-main"
                    title="Editar"
                  >
                    <span class="material-icons text-base">edit</span>
                  </button>
                </div>
              </div>
              @if (p.contactName || p.email) {
                <div class="mt-2 flex flex-col gap-1 text-xs text-text-muted">
                  @if (p.contactName) {
                    <span>{{ p.contactName }}</span>
                  }
                  @if (p.email) {
                    <span>{{ p.email }}</span>
                  }
                </div>
              }
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
      <div
        class="fixed inset-0 bg-overlay z-40 flex items-center justify-center p-4"
        (click)="closeEdit()"
      >
        <div class="w-full max-w-md" (click)="$event.stopPropagation()">
          <app-edit-provider
            [item]="editing()!"
            [saving]="saving()"
            (saved)="onUpdated($event)"
            (closed)="closeEdit()"
          />
        </div>
      </div>
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
        (close)="statusConfirm.set(null)"
      />
    }
  `,
})
export default class ProvidersPage {
  private providerService = inject(ProviderService);
  private toastService = inject(ToastService);

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

  onCreated(provider: Provider): void {
    this.toastService.success('Proveedor creado');
    this.closeCreate();
    this.load();
  }

  openEdit(provider: Provider): void {
    this.editing.set(provider);
  }

  closeEdit(): void {
    this.editing.set(null);
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
    this.statusConfirm.set(provider);
  }

  onStatusConfirm(): void {
    const id = this.statusConfirm()!.id;
    this.saving.set(true);
    this.providerService.updateStatus(id).subscribe({
      next: (isActive) => {
        this.saving.set(false);
        this.items.update((list) => list.map((p) => (p.id === id ? { ...p, isActive } : p)));
        this.toastService.success(isActive ? 'Proveedor activado' : 'Proveedor desactivado');
        this.statusConfirm.set(null);
      },
      error: () => this.saving.set(false),
    });
  }

  closeCreate(): void {
    this.showCreate.set(false);
  }
}
