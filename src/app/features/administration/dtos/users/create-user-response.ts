export interface CreateUserResponse {
  userId: GUID;
  setupUrl: string;
  emailSent: boolean;
}
