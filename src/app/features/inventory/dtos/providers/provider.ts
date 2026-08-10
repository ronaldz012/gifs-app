export interface Provider {
  id: GUID;
  name: string;
  contactName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
}