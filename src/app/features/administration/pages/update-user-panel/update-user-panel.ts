import { Component, inject, input, OnInit, output, signal, computed } from '@angular/core';
import { form, FormField, required, minLength } from '@angular/forms/signals';
import { UserAdminService } from '../../services/user-admin-service';
import { UpdateUserRequest } from '../../dtos/users/create-user-request';
import { RoleListItemDto } from '../../dtos/roles/role-list-item-dto';
import { BranchListItemDto } from '../../dtos/branches/branch-list-item-dto';
import { UserType } from '@features/auth/models/LoginResponse';
import { ToastService } from '@core/services/toast-service';

interface BranchRoleEntry {
  branchId: GUID;
  branchName: string;
  selected: boolean;
  roleId: GUID | null;
}

@Component({
  selector: 'app-update-user-panel',
  imports: [FormField],
  templateUrl: './update-user-panel.html',
  styleUrl: './update-user-panel.css',
})
export default class UpdateUserPanel implements OnInit {
  protected readonly UserType = UserType;

  private userAdminService = inject(UserAdminService);
  private toast = inject(ToastService);

  userId = input.required<GUID>();
  initialUserType = input.required<UserType>();

  close = output<void>();

  roles = signal<RoleListItemDto[]>([]);
  loading = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  currentUserType = signal(UserType.Standard);
  initiallyCreatedAsAdmin = computed(() => this.currentUserType() !== UserType.Standard);

  model = signal({
    firstName: '',
    lastName: '',
    ci: '',
    nationality: '',
    birthDate: '',
  });

  branchRoles = signal<BranchRoleEntry[]>([]);

  form = form(this.model, (s) => {
    required(s.firstName, { message: 'Requerido' });
    minLength(s.firstName, 3, { message: 'Mínimo 3 caracteres' });
    required(s.lastName, { message: 'Requerido' });
    minLength(s.lastName, 3, { message: 'Mínimo 3 caracteres' });
  });

  isOwner = computed(() => this.currentUserType() === UserType.Owner);
  isCurrentlyAdmin = computed(() =>
    this.currentUserType() === UserType.TenantAdmin || this.currentUserType() === UserType.Owner
  );

  adminToggleChecked = signal(false);

  isUpgrading = computed(() =>
    this.currentUserType() === UserType.Standard && this.adminToggleChecked()
  );

  isDowngrading = computed(() =>
    this.currentUserType() === UserType.TenantAdmin && this.adminToggleChecked()
  );

  hasValidBranchAssignment = computed(() => {
    if (this.isOwner()) return true;
    if (this.isUpgrading()) return true;
    if (this.isCurrentlyAdmin() && !this.isDowngrading()) return true;
    return this.branchRoles().some(b => b.selected && b.roleId);
  });

  branchSectionInteractive = computed(() =>
    !this.isOwner() && (!this.isCurrentlyAdmin() || this.isDowngrading())
  );

  ngOnInit() {
    this.loading.set(true);
    this.currentUserType.set(this.initialUserType());

    this.userAdminService.getRoles().subscribe({
      next: (roles) => this.roles.set(roles),
    });
    this.userAdminService.getBranches().subscribe({
      next: (branches) => this.loadUserDetails(branches),
      error: () => this.loading.set(false),
    });
  }

  private loadUserDetails(branches: BranchListItemDto[]) {
    this.userAdminService.getUserDetails(this.userId()).subscribe({
      next: (u) => {
        this.currentUserType.set(u.userType);
        this.model.set({
          firstName: u.firstName,
          lastName: u.lastName,
          ci: u.ci,
          nationality: u.nationality,
          birthDate: u.birthDate ? u.birthDate.substring(0, 10) : '',
        });

        this.branchRoles.set(
          branches.map(b => {
            const existing = u.branchRoles.find(br => br.branchId === b.id);
            return {
              branchId: b.id,
              branchName: b.name,
              selected: !!existing,
              roleId: existing?.roleId ?? null,
            };
          })
        );

        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onBranchToggle(branchId: GUID, checked: boolean) {
    this.branchRoles.update(list =>
      list.map(b =>
        b.branchId === branchId
          ? { ...b, selected: checked, roleId: checked ? b.roleId : null }
          : b
      )
    );
  }

  onRoleChange(branchId: GUID, roleId: string) {
    this.branchRoles.update(list =>
      list.map(b => (b.branchId === branchId ? { ...b, roleId } : b))
    );
  }

  private buildUpdatePayload(downgrading: boolean): UpdateUserRequest {
    const m = this.model();
    const payload: UpdateUserRequest = {
      firstName: m.firstName,
      lastName: m.lastName,
      ci: m.ci,
      nationality: m.nationality,
      birthDate: m.birthDate
        ? new Date(m.birthDate).toISOString()
        : new Date(0).toISOString(),
    };

    if (downgrading || (!this.isCurrentlyAdmin() && !this.isUpgrading())) {
      payload.branchRoles = this.branchRoles()
        .filter(b => b.selected && b.roleId)
        .map(b => ({ branchId: b.branchId, roleId: b.roleId! }));
    }

    return payload;
  }

  onSubmit(): void {
    this.form().markAsTouched();
    this.form().markAsDirty();
    if (this.form().invalid()) return;
    if (!this.hasValidBranchAssignment()) return;

    this.isSubmitting.set(true);
    this.error.set(null);

    if (this.isUpgrading()) {
      this.userAdminService.updateUser(this.userId(), this.buildUpdatePayload(false)).subscribe({
        next: () => {
          this.userAdminService.toggleAdminType(this.userId()).subscribe({
            next: () => {
              this.isSubmitting.set(false);
              this.close.emit();
            },
            error: (err: unknown) => {
              this.isSubmitting.set(false);
              const e = err as { error?: { detail?: string; title?: string }; message?: string };
              const msg = e?.error?.detail || e?.error?.title || e?.message || 'Error al cambiar el tipo de usuario.';
              this.error.set(msg);
              this.toast.error(msg);
            },
          });
        },
        error: (err: unknown) => {
          this.isSubmitting.set(false);
          const e = err as { error?: { detail?: string; title?: string }; message?: string };
          const msg = e?.error?.detail || e?.error?.title || e?.message || 'Error al actualizar el usuario.';
          this.error.set(msg);
          this.toast.error(msg);
        },
      });
      return;
    }

    if (this.isDowngrading()) {
      this.userAdminService.updateUser(this.userId(), this.buildUpdatePayload(true)).subscribe({
        next: () => {
          this.userAdminService.toggleAdminType(this.userId()).subscribe({
            next: () => {
              this.isSubmitting.set(false);
              this.close.emit();
            },
            error: (err: unknown) => {
              this.isSubmitting.set(false);
              const e = err as { error?: { detail?: string; title?: string }; message?: string };
              const msg = e?.error?.detail || e?.error?.title || e?.message || 'Error al cambiar el tipo de usuario.';
              this.error.set(msg);
              this.toast.error(msg);
            },
          });
        },
        error: (err: unknown) => {
          this.isSubmitting.set(false);
          const e = err as { error?: { detail?: string; title?: string }; message?: string };
          const msg = e?.error?.detail || e?.error?.title || e?.message || 'Error al actualizar el usuario.';
          this.error.set(msg);
          this.toast.error(msg);
        },
      });
      return;
    }

    this.userAdminService.updateUser(this.userId(), this.buildUpdatePayload(false)).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.close.emit();
      },
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        const e = err as { error?: { detail?: string; title?: string }; message?: string };
        const msg = e?.error?.detail || e?.error?.title || e?.message || 'Error al actualizar el usuario.';
        this.error.set(msg);
        this.toast.error(msg);
      },
    });
  }

  onClose(): void {
    this.close.emit();
  }
}