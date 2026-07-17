import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { PagedResult } from '@features/inventory/dtos/paged-result';
import { SaleListDto } from '@features/sales/dtos/sale-list-dto';
import { SalesQueryDto } from '@features/sales/dtos/sales-query-dto';
import { SaleDetailDto } from '@features/sales/dtos/sale-detail-dto';
import { CreateSaleDto } from '@features/sales/dtos/create-sale-dto';

@Injectable({ providedIn: 'root' })
export class SaleService {
  private http = inject(HttpClient);
  private baseUrl = environment.BACKEND_URL + '/api/Sale';

  getSales(query: SalesQueryDto): Observable<PagedResult<SaleListDto>> {
    let params = new HttpParams();
    if (query.dateFrom) params = params.set('dateFrom', query.dateFrom);
    if (query.dateTo) params = params.set('dateTo', query.dateTo);
    if (query.page) params = params.set('page', query.page);
    if (query.pageSize) params = params.set('pageSize', query.pageSize);
    return this.http.get<PagedResult<SaleListDto>>(this.baseUrl, { params });
  }

  createSale(dto: CreateSaleDto): Observable<void> {
    return this.http.post<void>(this.baseUrl, dto);
  }

  getSaleDetail(id: GUID): Observable<SaleDetailDto> {
    return this.http.get<SaleDetailDto>(`${this.baseUrl}/${id}/details`);
  }
}
