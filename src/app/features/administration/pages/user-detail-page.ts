import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserAdminService } from '../services/user-admin-service';
import { GetUserDetailsResponse, UserTypeLabel } from '../dtos/users/get-user-details-response';
import { UserStatusLabel } from '../dtos/users/get-user-response';
import { ConfirmActionModal } from '@features/inventory/pages/transfer-page/confirm-action-modal/confirm-action-modal';

@Component({
  selector: 'app-user-detail-page',
  imports: [RouterLink, DatePipe, ConfirmActionModal],
  template: `
    @if (loading()) {
      <div class="flex items-center justify-center py-20 text-sm text-text-muted">
        Cargando...
      </div>

    } @else if (!user()) {
      <div class="flex flex-col items-center gap-3 p-12 rounded-xl border border-border bg-bg-surface shadow-xs">
        <span class="material-icons text-4xl text-text-soft opacity-60">person_off</span>
        <p class="text-sm font-medium text-text-muted">Usuario no encontrado.</p>
        <a routerLink="/admin/users" class="text-xs font-medium text-accent-ui hover:underline">Volver a usuarios</a>
      </div>

    } @else {
      <div class="flex flex-col gap-4">

        <div class="flex items-center gap-3">
          <a routerLink="/admin/users" class="btn-icon">
            <span class="material-icons text-base">arrow_back</span>
          </a>
          <h1 class="text-xl font-semibold text-text-main">{{ user()!.firstName }} {{ user()!.lastName }}</h1>
          @if (user()!.isAdmin) {
            <span class="tag-warning text-[10px] uppercase">Admin</span>
          }
          <span class="pill-success text-[10px] font-semibold"
                [class.!hidden]="!user()!.isActive">Activo</span>
          <span class="pill-neutral text-[10px] font-semibold"
                [class.!hidden]="user()!.isActive">Inactivo</span>
        </div>

        <div class="bg-bg-surface rounded-xl border border-border-strong px-6 py-5">
          <div class="flex items-start justify-between gap-3 mb-4">
            <p class="section-title mb-0">Información general</p>
            <div class="flex gap-2 shrink-0">
              <button disabled class="btn-primary opacity-40 cursor-not-allowed" title="Editar">
                <span class="material-icons text-base leading-none">edit</span>
                <span class="hidden sm:inline">Editar</span>
              </button>
              <button (click)="showToggleConfirm.set(true)"
                      class="btn-secondary"
                      [class.!bg-feedback-success.!text-white]="user()!.isActive"
                      title="Cambiar estado">
                <span class="material-icons text-base leading-none">power_settings_new</span>
                <span class="hidden sm:inline">{{ user()!.isActive ? 'Desactivar' : 'Activar' }}</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <p class="field-label">Usuario</p>
              <p class="field-value">{{ user()!.username }}</p>
            </div>
            <div>
              <p class="field-label">Email</p>
              <p class="field-value">{{ user()!.email || '—' }}</p>
            </div>
            <div>
              <p class="field-label">Nombre</p>
              <p class="field-value">{{ user()!.firstName }}</p>
            </div>
            <div>
              <p class="field-label">Apellido</p>
              <p class="field-value">{{ user()!.lastName }}</p>
            </div>
            <div>
              <p class="field-label">CI</p>
              <p class="field-value">{{ user()!.ci || '—' }}</p>
            </div>
            <div>
              <p class="field-label">Nacionalidad</p>
              <p class="field-value">{{ user()!.nationality || '—' }}</p>
            </div>
            <div>
              <p class="field-label">Fecha de nacimiento</p>
              <p class="field-value">{{ (user()!.birthDate | date:'dd/MM/yyyy') || '—' }}</p>
            </div>
            <div>
              <p class="field-label">Tipo de usuario</p>
              <p class="field-value">{{ UserTypeLabel[user()!.userType] }}</p>
            </div>
            <div>
              <p class="field-label">Estado</p>
              <p class="field-value">{{ UserStatusLabel[user()!.status] }}</p>
            </div>
            <div>
              <p class="field-label">Creado el</p>
              <p class="field-value">{{ user()!.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
          </div>
        </div>

        @if (user()!.branchRoles.length > 0) {
          <div class="bg-bg-surface rounded-xl border border-border-strong px-6 py-5">
            <p class="section-title mb-4">Acceso a sucursales</p>
            <div class="border border-border rounded-xl overflow-hidden">
              <div class="hidden sm:grid grid-cols-2 gap-4 px-4 py-2 bg-bg-muted text-[10px] font-bold uppercase tracking-wider text-text-soft">
                <span>Sucursal</span>
                <span>Rol</span>
              </div>
              <div class="divide-y divide-border">
                @for (br of user()!.branchRoles; track br.branchId) {
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-4 px-4 py-3 text-sm">
                    <span class="text-text-main font-medium">{{ br.branchName }}</span>
                    <span class="text-text-muted">{{ br.roleName }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        }

      </div>
    }

    @if (showToggleConfirm()) {
      <app-confirm-action-modal
        [title]="user()!.isActive ? '¿Desactivar usuario?' : '¿Activar usuario?'"
        [description]="'Se cambiará el estado de ' + user()!.firstName + ' ' + user()!.lastName + '.'"
        [confirmLabel]="user()!.isActive ? 'Sí, desactivar' : 'Sí, activar'"
        submittingLabel="Cambiando..."
        confirmButtonClass="bg-btn-primary-bg hover:opacity-90"
        [submitting]="submitting()"
        (confirm)="onToggleActive()"
        (close)="showToggleConfirm.set(false)"
      />
    }
  `,
})
export default class UserDetailPage implements OnInit {
  protected readonly UserTypeLabel = UserTypeLabel;
  protected readonly UserStatusLabel = UserStatusLabel;

  private route = inject(ActivatedRoute);
  private userAdminService = inject(UserAdminService);

  user = signal<GetUserDetailsResponse | null>(null);
  loading = signal(true);
  submitting = signal(false);
  showToggleConfirm = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadUser(id);
  }

  private loadUser(id: GUID): void {
    this.loading.set(true);
    this.userAdminService.getUserDetails(id).subscribe({
      next: (u) => {
        this.user.set(u);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onToggleActive(): void {
    const u = this.user();
    if (!u) return;

    this.submitting.set(true);
    this.userAdminService.toggleActive(u.id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showToggleConfirm.set(false);
        this.loadUser(u.id);
      },
      error: () => this.submitting.set(false),
    });
  }
}