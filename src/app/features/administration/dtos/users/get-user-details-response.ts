import { UserStatus, UserStatusLabel } from './get-user-response';
import { UserType } from '@features/auth/models/LoginResponse';

export interface GetUserDetailsResponse {
  id: GUID;
  username?: string;
  email: string;
  firstName: string;
  lastName: string;
  ci: string;
  nationality: string;
  birthDate: string;
  userType: UserType;
  isAdmin: boolean;
  status: UserStatus;
  isActive: boolean;
  createdAt: string;
  setupUrl?: string | null;
  setupUrlExpiresAt?: string | null;
  branchRoles: UserBranchRoleDetailDto[];
}

export interface UserBranchRoleDetailDto {
  branchId: GUID;
  branchName: string;
  roleId: GUID;
  roleName: string;
}

export const UserTypeLabel: Record<UserType, string> = {
  [UserType.Standard]: 'Estándar',
  [UserType.TenantAdmin]: 'Admin de inquilino',
  [UserType.Owner]: 'Propietario',
};