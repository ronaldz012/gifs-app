export interface GetUserResponse {
  id: GUID;
  username?: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
  userType: number;
  firstName: string;
  lastName: string;
  status: UserStatus;
  isActive: boolean;
}

export enum UserStatus {
  PendingPasswordSetup = 1,
  Ready = 2,
}

export const UserStatusLabel: Record<UserStatus, string> = {
  [UserStatus.PendingPasswordSetup]: 'Pendiente de configuración',
  [UserStatus.Ready]: 'Listo',
};
