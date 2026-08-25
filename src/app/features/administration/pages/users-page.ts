import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Paginator } from '@shared/components/app-paginator/app-paginator';
import SkeletonList from '@shared/ui/skeleton-list/skeleton-list';
import { UserAdminService } from '../services/user-admin-service';
import { GetUserResponse } from '../dtos/users/get-user-response';
import { UserQueryParams } from '../dtos/users/user-query-dto';
import UserItem from './user-item/user-item';
import CreateUserPanel from './create-user-panel/create-user-panel';

@Component({
  selector: 'app-users-page',
  imports: [Paginator, SkeletonList, UserItem, CreateUserPanel],
  template: `
    <div class="flex flex-col gap-4">

      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="material-icons text-2xl text-text-main">people</span>
          <h1 class="text-xl font-semibold text-text-main">Usuarios</h1>
          @if (activeUsers() !== null) {
            <span class="badge-info text-xs">{{ activeUsers() }} activos</span>
          }
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <div class="relative max-w-xs flex-1">
          <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-base text-text-soft pointer-events-none">search</span>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-bg-muted text-text-main placeholder:text-text-soft outline-none transition-colors focus:border-border-strong"
            [value]="query().filter ?? ''"
            (input)="onSearch($event)"
          />
        </div>
        <select
          class="px-3 py-2 text-sm rounded-lg border border-border bg-bg-muted text-text-main outline-none transition-colors focus:border-border-strong"
          [value]="query().isActive ?? ''"
          (change)="onStatusFilter($event)"
        >
          <option value="">Todos</option>
          <option [value]="true">Activo</option>
          <option [value]="false">Inactivo</option>
        </select>
        <button
          type="button"
          (click)="isPanelOpen.set(true)"
          class="btn-primary btn-sm shrink-0"
        >
          <span class="material-icons text-base">add</span>
          Crear usuario
        </button>
      </div>

      @if (loading()) {
        <app-skeleton-list [rows]="5" [columns]="5" />

      } @else if (users().length === 0) {
        <div class="flex flex-col items-center gap-3 p-12 rounded-xl border border-border bg-bg-surface shadow-xs">
          <span class="material-icons text-4xl text-text-soft opacity-60">people_outline</span>
          <p class="text-sm font-medium text-text-muted">No se encontraron usuarios.</p>
          @if (hasActiveFilters()) {
            <button
              class="text-xs font-medium text-accent-ui hover:underline"
              (click)="patchQuery({ filter: undefined, isActive: undefined, page: 1 })">
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
            <span>Email</span>
            <span>Estado</span>
            <span></span>
          </div>

          @for (u of users(); track u.id) {
            <app-user-item [user]="u" />
          }
        </div>
      }

      @if (!loading() && totalItems() > 0) {
        <app-paginator
          [page]="query().page!"
          [pageSize]="query().pageSize!"
          [totalItems]="totalItems()"
          (pageChange)="patchQuery({ page: $event })"
          (pageSizeChange)="patchQuery({ pageSize: $event, page: 1 })" />
      }

    </div>

    @if (isPanelOpen()) {
      <app-create-user-panel
        (close)="onPanelClose()" />
    }
  `,
})
export default class UsersPage implements OnInit {
  private userAdminService = inject(UserAdminService);

  isPanelOpen = signal(false);

  users = signal<GetUserResponse[]>([]);
  totalItems = signal(0);
  activeUsers = signal<number | null>(null);
  loading = signal(false);

  query = signal<UserQueryParams>({
    page: 1,
    pageSize: 10,
  });

  hasActiveFilters = computed(() => {
    const q = this.query();
    return !!(q.filter || q.isActive !== null && q.isActive !== undefined);
  });

  ngOnInit() {
    this.load();
  }

  onPanelClose() {
    this.isPanelOpen.set(false);
    this.load();
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.patchQuery({ filter: value || undefined });
  }

  onStatusFilter(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.patchQuery({
      isActive: value === '' ? undefined : value === 'true',
    });
  }

  patchQuery(patch: Partial<UserQueryParams>) {
    this.query.update(q => ({ ...q, ...patch }));
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.userAdminService.getUsers(this.query()).subscribe({
      next: data => {
        this.users.set(data.items);
        this.totalItems.set(data.totalCount);
        this.activeUsers.set(data.activeUsers);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
