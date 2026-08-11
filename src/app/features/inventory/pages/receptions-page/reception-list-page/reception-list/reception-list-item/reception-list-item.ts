import { Component, inject, input, output} from '@angular/core';
import {ReceptionStatus, StockReceptionListDto} from '../../../../../dtos/receptions/stock-reception-list-dto';
import {CurrencyPipe} from '@angular/common';
import {Router} from '@angular/router';
import ReceptionDetails from '../../../reception-details/reception-details';
import {SmartDatePipe} from '@shared/pipes/smart-date.pipe';

@Component({
  selector: 'app-reception-list-item',
  imports: [
    CurrencyPipe,
    SmartDatePipe
  ],
  templateUrl: './reception-list-item.html',
  styles: ``,
})
export class ReceptionListItem {
  reception = input.required<StockReceptionListDto>();
  index     = input<number>(0);
  viewDetails = output<GUID>();
  readonly Status = ReceptionStatus;
  readonly router = inject(Router);


  statusClasses(s: ReceptionStatus): string {
    const map: Record<ReceptionStatus, string> = {
      [ReceptionStatus.Borrador]:   'bg-feedback-warning text-feedback-warning-text',
      [ReceptionStatus.Confirmado]: 'bg-feedback-success text-feedback-success-text',
      [ReceptionStatus.Rechazado]:  'bg-feedback-error text-feedback-error-text',
      [ReceptionStatus.Revertida]:  'bg-feedback-error text-feedback-error-text',
    };
    return map[s];
  }
}
