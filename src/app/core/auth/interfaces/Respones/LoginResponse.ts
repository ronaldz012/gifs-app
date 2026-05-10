
export default interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  status: string;
  authProvider: string;
  user: User;
  branches: Branch[];
}

export interface User {
  id: GUID;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Branch {
  branchId: GUID;
  branchName: string;
  roles: Role[];
  modules: Module[];
}

export interface Role {
  id: GUID;
  name: string;
}

export interface Module {
  id: number;
  name: string;
  route: string;
  icon : string;
  features: Feature[];
}

export interface Feature {
  id: number;
  name: string;
  route: string;
  icon: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}
