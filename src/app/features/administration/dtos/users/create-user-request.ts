export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  ci: string;
  nationality: string;
  birthDate: string;
  branchRoles: UserBranchRoleDto[];
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  ci?: string;
  nationality?: string;
  birthDate?: string;
  branchRoles?: UserBranchRoleDto[];
}

export interface UserBranchRoleDto {
  branchId: GUID;
  roleId: GUID;
}
