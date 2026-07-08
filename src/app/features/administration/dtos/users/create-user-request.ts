export interface CreateUserRequest {
  username: string;
  email?: string;
  firstName: string;
  lastName: string;
  ci: string;
  nationality: string;
  birthDate: string;
  branchRoles: UserBranchRoleDto[];
}

export interface UserBranchRoleDto {
  branchId: GUID;
  roleId: GUID;
}
