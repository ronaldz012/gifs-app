
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
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  deletedAt: string | null;
}

export interface Branch {
  branchId: string;
  branchName: string;
  role: string;
  modules: Module[];
}

export interface Module {
  name: string;
  route: string;
  features: Feature[];
}

export interface Feature {
  key: string;
  displayName: string;
  route: string;
  icon: string;
  isMenu: boolean;
  permission: string[];
}
