export interface CreateTenantAdminRequest {
  username: string;
  email?: string;
  firstName: string;
  lastName: string;
  ci: string;
  nationality: string;
  birthDate: string;
}