import { Component, inject, OnInit, signal } from '@angular/core';
import SkeletonList from '@shared/ui/skeleton-list/skeleton-list';
import { UserAdminService } from '../services/user-admin-service';
import { BranchListItemDto } from '../dtos/branches/branch-list-item-dto';
import { BranchQueryParams } from '../dtos/branches/branch-query-params';
import BranchItem from './branch-item/branch-item';
import CreateBranchPanel from './create-branch-panel/create-branch-panel';

@Component({
  selector: 'app-branches-page',
  imports: [SkeletonList, BranchItem, CreateBranchPanel],
  template: `
    <div class="flex flex-col gap-4">

      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="material-icons text-2xl text-text-main">business</span>
          <h1 class="text-xl font-semibold text-text-main">Sucursales</h1>
          @if (activeBranches() !== null) {
            <span class="badge-info text-xs">{{ activeBranches() }} activas</span>
          }
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <select
          class="px-3 py-2 text-sm rounded-lg border border-border bg-bg-muted text-text-main outline-none transition-colors focus:border-border-strong"
          [value]="query().isActive ?? ''"
          (change)="onStatusFilter($event)"
        >
          <option value="">Todas</option>
          <option [value]="true">Activo</option>
          <option [value]="false">Inactivo</option>
        </select>
        <button
          type="button"
          (click)="isPanelOpen.set(true)"
          class="btn-primary btn-sm shrink-0"
        >
          <span class="material-icons text-base">add</span>
          Crear sucursal
        </button>
      </div>

      @if (loading()) {
        <app-skeleton-list [rows]="5" [columns]="3" />

      } @else if (branches().length === 0) {
        <div class="flex flex-col items-center gap-3 p-12 rounded-xl border border-border bg-bg-surface shadow-xs">
          <span class="material-icons text-4xl text-text-soft opacity-60">business</span>
          <p class="text-sm font-medium text-text-muted">No se encontraron sucursales.</p>
          @if (query().isActive !== undefined) {
            <button
              class="text-xs font-medium text-accent-ui hover:underline"
              (click)="clearFilter()">
              Limpiar filtros
            </button>
          }
        </div>

      } @else {
        <div class="flex flex-col overflow-hidden rounded-xl border border-border bg-bg-surface shadow-xs">
          <div class="hidden px-4 py-3 border-b border-border bg-bg-muted lg:grid
                      font-inter text-xs font-semibold uppercase tracking-wider text-text-soft"
               style="grid-template-columns: 1fr 1fr 7.5rem 5rem">
            <span>Nombre</span>
            <span>Ubicación</span>
            <span>Estado</span>
            <span></span>
          </div>

          @for (b of branches(); track b.id) {
            <app-branch-item [branch]="b" />
          }
        </div>
      }

    </div>

    @if (isPanelOpen()) {
      <app-create-branch-panel
        (close)="onPanelClose()" />
    }
  `,
})
export default class BranchesPage implements OnInit {
  private userAdminService = inject(UserAdminService);

  isPanelOpen = signal(false);

  branches = signal<BranchListItemDto[]>([]);
  activeBranches = signal<number | null>(null);
  loading = signal(false);

  query = signal<BranchQueryParams>({});

  ngOnInit() {
    this.load();
  }

  onPanelClose() {
    this.isPanelOpen.set(false);
    this.load();
  }

  clearFilter() {
    this.query.set({});
    this.load();
  }

  onStatusFilter(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.query.set({
      ...this.query(),
      isActive: value === '' ? undefined : value === 'true',
    });
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.userAdminService.getAdminBranches(this.query()).subscribe({
      next: data => {
        this.branches.set(data);
        this.activeBranches.set(data.filter(b => b.isActive).length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}