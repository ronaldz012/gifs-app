import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { CurrentRegisterDto } from '@features/sales/dtos/current-register-dto';
import { OpenCashRegisterDto } from '@features/sales/dtos/open-cash-register-dto';
import { CloseCashRegisterDto } from '@features/sales/dtos/close-cash-register-dto';
import { MovementListDto } from '@features/sales/dtos/movement-list-dto';
import { CreateMovementDto } from '@features/sales/dtos/create-movement-dto';
import { UpdateMovementDto } from '@features/sales/dtos/update-movement-dto';
import { ClosureListDto } from '@features/sales/dtos/closure-list-dto';
import { ClosureDetailDto } from '@features/sales/dtos/closure-detail-dto';
import { BaseQueryDto } from '@features/inventory/dtos/base-query-dto';
import { PagedResult } from '@features/inventory/dtos/paged-result';

@Injectable({ providedIn: 'root' })
export class CashRegisterService {
  private http = inject(HttpClient);
  private baseUrl = environment.BACKEND_URL + '/api/CashRegister';
  private movementUrl = environment.BACKEND_URL + '/api/CashRegisterMovement';

  getCurrentRegister(): Observable<CurrentRegisterDto> {
    return this.http.get<CurrentRegisterDto>(`${this.baseUrl}/Current`);
  }

  getCurrentDetails(): Observable<ClosureDetailDto> {
    return this.http.get<ClosureDetailDto>(`${this.baseUrl}/Current/details`);
  }

  openRegister(dto: OpenCashRegisterDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/Open`, dto);
  }

  closeRegister(dto: CloseCashRegisterDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/Close`, dto);
  }

  getMovements(): Observable<MovementListDto[]> {
    return this.http.get<MovementListDto[]>(this.movementUrl);
  }

  createMovement(dto: CreateMovementDto): Observable<void> {
    return this.http.post<void>(this.movementUrl, dto);
  }

  updateMovement(id: GUID, dto: UpdateMovementDto): Observable<void> {
    return this.http.put<void>(`${this.movementUrl}/${id}`, dto);
  }

  deleteMovement(id: GUID): Observable<void> {
    return this.http.delete<void>(`${this.movementUrl}/${id}`);
  }

  getClosures(params: BaseQueryDto): Observable<PagedResult<ClosureListDto>> {
    let httpParams = new HttpParams().set('page', params.page).set('pageSize', params.pageSize);
    return this.http.get<PagedResult<ClosureListDto>>(`${this.baseUrl}`, { params: httpParams });
  }

  getClosureDetail(id: GUID, includeStock = false): Observable<ClosureDetailDto> {
    let params = new HttpParams();
    if (includeStock) {
      params = params.set('includeStock', true);
    }
    return this.http.get<ClosureDetailDto>(`${this.baseUrl}/${id}`, { params });
  }
}
