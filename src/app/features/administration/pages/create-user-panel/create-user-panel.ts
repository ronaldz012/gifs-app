import { Component, inject, OnInit, output, signal, computed } from '@angular/core';
import { form, FormField, required, minLength, maxLength, email, validate } from '@angular/forms/signals';
import { UserAdminService } from '../../services/user-admin-service';
import { CreateUserRequest } from '../../dtos/users/create-user-request';
import { RoleListItemDto } from '../../dtos/roles/role-list-item-dto';
import { BranchListItemDto } from '../../dtos/branches/branch-list-item-dto';
import { CreateUserResponse } from '../../dtos/users/create-user-response';
import { CreateTenantAdminRequest } from '../../dtos/users/create-tenant-admin-request';

interface BranchRoleEntry {
  branchId: GUID;
  branchName: string;
  selected: boolean;
  roleId: GUID | null;
}

@Component({
  selector: 'app-create-user-panel',
  imports: [FormField],
  templateUrl: './create-user-panel.html',
  styleUrl: './create-user-panel.css',
})
export default class CreateUserPanel implements OnInit {
  private userAdminService = inject(UserAdminService);

  close = output<void>();

  roles = signal<RoleListItemDto[]>([]);
  loading = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  result = signal<CreateUserResponse | null>(null);
  copied = signal(false);
  isAdmin = signal(false);

  model = signal({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
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
    required(s.username, { message: 'Requerido' });
    minLength(s.username, 3, { message: 'Mínimo 3 caracteres' });
    maxLength(s.username, 50, { message: 'Máximo 50 caracteres' });
    validate(s.username, ({ value }) => {
      if (!/^[a-zA-Z0-9]+$/.test(value())) {
        return { kind: 'pattern', message: 'Solo letras y números' };
      }
      return null;
    });
    email(s.email, { message: 'Email inválido' });
  });

  hasValidBranchAssignment = computed(() =>
    this.isAdmin() || this.branchRoles().some(b => b.selected && b.roleId)
  );

  ngOnInit() {
    this.loading.set(true);
    this.userAdminService.getRoles().subscribe({
      next: (roles) => this.roles.set(roles),
    });
    this.userAdminService.getBranches().subscribe({
      next: (branches) => {
        this.branchRoles.set(
          branches.map(b => ({
            branchId: b.id,
            branchName: b.name,
            selected: false,
            roleId: null,
          }))
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

  onSubmit(): void {
    this.form().markAsTouched();
    this.form().markAsDirty();
    if (this.form().invalid()) return;
    if (!this.hasValidBranchAssignment()) return;

    this.isSubmitting.set(true);
    this.error.set(null);

    const m = this.model();
    const base = {
      username: m.username,
      firstName: m.firstName,
      lastName: m.lastName,
      ci: m.ci,
      nationality: m.nationality,
      birthDate: m.birthDate
        ? new Date(m.birthDate).toISOString()
        : new Date(0).toISOString(),
    };

    if (m.email) (base as any).email = m.email;

    const request$ = this.isAdmin()
      ? this.userAdminService.createTenantAdmin(base as CreateTenantAdminRequest)
      : this.userAdminService.createUser({
          ...base,
          branchRoles: this.branchRoles()
            .filter(b => b.selected && b.roleId)
            .map(b => ({ branchId: b.branchId, roleId: b.roleId! })),
        });

    request$.subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.result.set(res);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.error.set('Error al crear el usuario.');
      },
    });
  }

  copyUrl(): void {
    const url = this.result()?.setupUrl;
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
