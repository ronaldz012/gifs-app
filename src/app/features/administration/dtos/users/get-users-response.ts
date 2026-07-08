import { GetUserResponse } from './get-user-response';

export interface GetUsersResponse {
  items: GetUserResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  activeUsers: number;
}
