import { Component, input, output} from '@angular/core';
import {ReceptionStatus, StockReceptionListDto} from '../../../../dtos/Receptions/stock-reception-list-dto';
import {CurrencyPipe, DatePipe} from '@angular/common';

@Component({
  selector: 'app-reception-list-item',
  imports: [
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './reception-list-item.html',
  styles: ``,
})
export class ReceptionListItem {
  reception = input.required<StockReceptionListDto>();
  index     = input<number>(0);

  viewDetail = output<number>();

  readonly Status = ReceptionStatus;


  statusClasses(s: ReceptionStatus): string {
    const map: Record<ReceptionStatus, string> = {
      [ReceptionStatus.Borrador]:     'bg-amber-50  text-amber-600  ring-1 ring-amber-200',
      [ReceptionStatus.Confirmado]: 'bg-green-50  text-green-600  ring-1 ring-green-200',
      [ReceptionStatus.Rechazado]:  'bg-red-50    text-red-500    ring-1 ring-red-200',
    };
    return map[s];
  }
}
