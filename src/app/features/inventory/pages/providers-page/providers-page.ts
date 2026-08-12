import { Component, computed, inject, signal } from '@angular/core';
import { ProviderService } from '@features/inventory/services/provider-service';
import CreateProvider from '@features/inventory/components/create-provider/create-provider';
import { Provider } from '@features/inventory/dtos/providers/provider';
import { ToastService } from '@core/services/toast-service';

@Component({
  selector: 'app-providers-page',
  imports: [CreateProvider],
  template: `
    <div class="flex flex-col gap-4 w-full">
      <!-- Header -->
      <div class="flex items-center justify-between gap-3">
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
        <button
          type="button"
          (click)="showCreate.set(true)"
          class="btn btn-primary btn-sm shrink-0 flex items-center gap-1"
        >
          <span class="material-icons text-base">add</span>
          Nuevo proveedor
        </button>
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
            class="hidden lg:grid grid-cols-[1.2fr_1fr_1fr_1fr] px-4 py-3 bg-bg-muted border-b border-border"
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
          </div>
          @for (p of filteredProviders(); track p.id) {
            <div
              class="hidden lg:grid grid-cols-[1.2fr_1fr_1fr_1fr] px-4 py-3 border-b border-border last:border-0 hover:bg-accent-ui/5 transition-colors"
            >
              <span class="text-sm font-medium text-text-main truncate">{{ p.name }}</span>
              <span class="text-sm text-text-muted truncate">{{ p.contactName || '—' }}</span>
              <span class="text-sm text-text-muted truncate">{{ p.email || '—' }}</span>
              <span class="text-sm text-text-muted truncate">{{ p.phoneNumber || '—' }}</span>
            </div>
          }
        </div>

        <!-- Mobile -->
        <div class="lg:hidden flex flex-col gap-3">
          @for (p of filteredProviders(); track p.id) {
            <div class="bg-bg-surface rounded-xl border border-border p-4">
              <div class="flex items-center justify-between gap-2">
                <span class="text-sm font-semibold text-text-main truncate">{{ p.name }}</span>
                @if (p.phoneNumber) {
                  <span class="tag-neutral shrink-0">{{ p.phoneNumber }}</span>
                }
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

    <!-- Modal -->
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
  `,
})
export default class ProvidersPage {
  private providerService = inject(ProviderService);
  private toastService = inject(ToastService);

  providers = this.providerService.providers;
  loading = this.providerService.loading;

  query = signal('');
  showCreate = signal(false);

  filteredProviders = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.providers();
    return this.providers().filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.contactName ?? '').toLowerCase().includes(q) ||
        (p.email ?? '').toLowerCase().includes(q),
    );
  });

  constructor() {
    this.providerService.load();
  }

  onCreated(provider: Provider): void {
    this.providerService.add(provider);
    this.toastService.success('Proveedor creado');
    this.closeCreate();
  }

  onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  closeCreate(): void {
    this.showCreate.set(false);
  }
}
