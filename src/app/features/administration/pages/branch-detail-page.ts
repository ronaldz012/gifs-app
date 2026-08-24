import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserAdminService } from '../services/user-admin-service';
import { ToastService } from '@core/services/toast-service';
import { GetBranchDetailsResponse } from '../dtos/branches/get-branch-details-response';
import { ConfirmActionModal } from '@features/inventory/pages/transfer-page/confirm-action-modal/confirm-action-modal';
import CreateBranchPanel from './create-branch-panel/create-branch-panel';

@Component({
  selector: 'app-branch-detail-page',
  imports: [RouterLink, DatePipe, ConfirmActionModal, CreateBranchPanel],
  template: `
    @if (loading()) {
      <div class="flex items-center justify-center py-20 text-sm text-text-muted">
        Cargando...
      </div>

    } @else if (!branch()) {
      <div class="flex flex-col items-center gap-3 p-12 rounded-xl border border-border bg-bg-surface shadow-xs">
        <span class="material-icons text-4xl text-text-soft opacity-60">business</span>
        <p class="text-sm font-medium text-text-muted">Sucursal no encontrada.</p>
        <a routerLink="/admin/branches" class="text-xs font-medium text-accent-ui hover:underline">Volver a sucursales</a>
      </div>

    } @else {
      <div class="flex flex-col gap-4">

        <div class="flex items-center gap-3">
          <a routerLink="/admin/branches" class="btn-icon">
            <span class="material-icons text-base">arrow_back</span>
          </a>
          <h1 class="text-xl font-semibold text-text-main">{{ branch()!.name }}</h1>
          <span class="pill-success text-[10px] font-semibold"
                [class.!hidden]="!branch()!.isActive">Activo</span>
          <span class="pill-neutral text-[10px] font-semibold"
                [class.!hidden]="branch()!.isActive">Inactivo</span>
        </div>

        <div class="bg-bg-surface rounded-xl border border-border-strong px-6 py-5">
          <div class="flex items-start justify-between gap-3 mb-4">
            <p class="section-title mb-0">Información general</p>
            <div class="flex gap-2 shrink-0 flex-wrap">
              <button (click)="showPanel.set(true)" class="btn-primary" title="Editar">
                <span class="material-icons text-base leading-none">edit</span>
                <span class="hidden sm:inline">Editar</span>
              </button>
              <button (click)="showToggleConfirm.set(true)"
                      class="btn-secondary"
                      [class.!bg-feedback-success.!text-white]="branch()!.isActive"
                      title="Cambiar estado">
                <span class="material-icons text-base leading-none">power_settings_new</span>
                <span class="hidden sm:inline">{{ branch()!.isActive ? 'Desactivar' : 'Activar' }}</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <p class="field-label">Nombre</p>
              <p class="field-value">{{ branch()!.name }}</p>
            </div>
            <div>
              <p class="field-label">Ubicación</p>
              <p class="field-value">{{ branch()!.place || '—' }}</p>
            </div>
            <div>
              <p class="field-label">Teléfono</p>
              <p class="field-value">{{ branch()!.phoneNumber || '—' }}</p>
            </div>
            <div>
              <p class="field-label">Estado</p>
              <p class="field-value">{{ branch()!.isActive ? 'Activo' : 'Inactivo' }}</p>
            </div>
            <div>
              <p class="field-label">Creado el</p>
              <p class="field-value">{{ branch()!.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
          </div>
        </div>

      </div>
    }

    @if (showPanel() && branch()) {
      <app-create-branch-panel
        [branchId]="branch()!.id"
        [branchDetails]="branch()!"
        (close)="onPanelClose()" />
    }

    @if (showToggleConfirm()) {
      <app-confirm-action-modal
        [title]="branch()!.isActive ? '¿Desactivar sucursal?' : '¿Activar sucursal?'"
        [description]="'Se cambiará el estado de ' + branch()!.name + '.'"
        [confirmLabel]="branch()!.isActive ? 'Sí, desactivar' : 'Sí, activar'"
        submittingLabel="Cambiando..."
        confirmButtonClass="bg-btn-primary-bg hover:opacity-90"
        [submitting]="submitting()"
        (confirm)="onToggleActive()"
        (close)="showToggleConfirm.set(false)"
      />
    }
  `,
})
export default class BranchDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private userAdminService = inject(UserAdminService);
  private toast = inject(ToastService);

  branch = signal<GetBranchDetailsResponse | null>(null);
  loading = signal(true);
  submitting = signal(false);
  showPanel = signal(false);
  showToggleConfirm = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadBranch(id);
  }

  private loadBranch(id: GUID): void {
    this.loading.set(true);
    this.userAdminService.getBranchDetails(id).subscribe({
      next: (b) => {
        this.branch.set(b);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPanelClose(): void {
    this.showPanel.set(false);
    const b = this.branch();
    if (b) this.loadBranch(b.id);
  }

  onToggleActive(): void {
    const b = this.branch();
    if (!b) return;

    this.submitting.set(true);
    this.userAdminService.toggleBranchStatus(b.id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showToggleConfirm.set(false);
        this.toast.success('Estado de sucursal actualizado');
        this.loadBranch(b.id);
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        const e = err as { error?: { detail?: string; title?: string }; message?: string };
        this.toast.error(e?.error?.detail || e?.error?.title || e?.message || 'Error al cambiar el estado de la sucursal.');
      },
    });
  }
}