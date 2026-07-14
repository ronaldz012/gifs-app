import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { GetUsersResponse } from '../dtos/users/get-users-response';
import { UserQueryParams } from '../dtos/users/user-query-dto';
import { CreateUserRequest, UpdateUserRequest } from '../dtos/users/create-user-request';
import { CreateTenantAdminRequest } from '../dtos/users/create-tenant-admin-request';
import { RoleListItemDto } from '../dtos/roles/role-list-item-dto';
import { BranchListItemDto } from '../dtos/branches/branch-list-item-dto';
import { GetUserResponse } from '../dtos/users/get-user-response';
import { CreateUserResponse } from '../dtos/users/create-user-response';
import { GetUserDetailsResponse } from '../dtos/users/get-user-details-response';
import { BranchQueryParams } from '../dtos/branches/branch-query-params';
import { CreateBranchRequest } from '../dtos/branches/create-branch-request';
import { GetBranchDetailsResponse } from '../dtos/branches/get-branch-details-response';
import { UserType } from '@features/auth/models/LoginResponse';

@Injectable({ providedIn: 'root' })
export class UserAdminService {
  private http = inject(HttpClient);
  private userUrl = environment.BACKEND_URL + '/api/User';
  private roleUrl = environment.BACKEND_URL + '/api/Role';
  private branchUrl = environment.BACKEND_URL + '/api/Branch';

  getUsers(query: UserQueryParams): Observable<GetUsersResponse> {
    let params = new HttpParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    return this.http.get<GetUsersResponse>(this.userUrl, { params });
  }

  toggleActive(userId: GUID): Observable<void> {
    return this.http.patch<void>(`${this.userUrl}/${userId}/status`, {});
  }

  createUser(dto: CreateUserRequest): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(this.userUrl, dto);
  }

  createTenantAdmin(dto: CreateTenantAdminRequest): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(`${this.userUrl}/tenant-admin`, dto);
  }

  getRoles(): Observable<RoleListItemDto[]> {
    return this.http.get<RoleListItemDto[]>(this.roleUrl);
  }

  getBranches(): Observable<BranchListItemDto[]> {
    return this.http.get<BranchListItemDto[]>(this.branchUrl);
  }

  createBranch(dto: CreateBranchRequest): Observable<void> {
    return this.http.post<void>(this.branchUrl, dto);
  }

  getAdminBranches(query: BranchQueryParams): Observable<BranchListItemDto[]> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    return this.http.get<BranchListItemDto[]>(this.branchUrl, { params });
  }

  getUserDetails(id: GUID): Observable<GetUserDetailsResponse> {
    return this.http.get<GetUserDetailsResponse>(`${this.userUrl}/${id}/details`);
  }

  updateUser(id: GUID, dto: UpdateUserRequest): Observable<void> {
    return this.http.put<void>(`${this.userUrl}/${id}`, dto);
  }

  toggleAdminType(id: GUID): Observable<void> {
    return this.http.patch<void>(`${this.userUrl}/${id}/type`, {});
  }

  getBranchDetails(id: GUID): Observable<GetBranchDetailsResponse> {
    return this.http.get<GetBranchDetailsResponse>(`${this.branchUrl}/${id}/details`);
  }

  toggleBranchStatus(id: GUID): Observable<void> {
    return this.http.patch<void>(`${this.branchUrl}/${id}/status`, {});
  }

  updateBranch(id: GUID, dto: CreateBranchRequest): Observable<void> {
    return this.http.put<void>(`${this.branchUrl}/${id}`, dto);
  }
}
