import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { TodaySalesDto } from '../dtos/today-sales-dto';
import { LastClosureSummaryDto } from '../dtos/last-closure-summary-dto';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private baseUrl = environment.BACKEND_URL + '/api/Dashboard';

  getTodaySales(): Observable<TodaySalesDto> {
    return this.http.get<TodaySalesDto>(`${this.baseUrl}/today-sales`);
  }

  getLastClosure(): Observable<LastClosureSummaryDto> {
    return this.http.get<LastClosureSummaryDto>(`${this.baseUrl}/last-closure`);
  }
}
