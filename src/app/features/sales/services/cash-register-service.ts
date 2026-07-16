import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { CurrentRegisterDto } from '@features/sales/dtos/current-register-dto';
import { OpenCashRegisterDto } from '@features/sales/dtos/open-cash-register-dto';
import { CloseCashRegisterDto } from '@features/sales/dtos/close-cash-register-dto';

@Injectable({ providedIn: 'root' })
export class CashRegisterService {
  private http = inject(HttpClient);
  private baseUrl = environment.BACKEND_URL + '/api/CashRegister';

  getCurrentRegister(): Observable<CurrentRegisterDto> {
    return this.http.get<CurrentRegisterDto>(`${this.baseUrl}/Current`);
  }

  openRegister(dto: OpenCashRegisterDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/Open`, dto);
  }

  closeRegister(dto: CloseCashRegisterDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/Close`, dto);
  }
}
