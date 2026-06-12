import { Component, input, output} from '@angular/core';
import {StockTransferListDto} from '../../../../../dtos/transfers/stock-transfer-list-dto';
import {TransferDirection, TransferStatus} from '../../../../../dtos/transfers/transfer-enums';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-transfer-list-item',
  imports: [
    DatePipe
  ],
  templateUrl: './transfer-list-item.html',
  styles: ``,
})
export class TransferListItem {
  transfer = input.required<StockTransferListDto>();
  index    = input<GUID>('');

  viewDetail     = output<GUID>();
  requestResolve = output<GUID>();
  requestCancel  = output<GUID>();

  readonly Status    = TransferStatus;
  readonly Direction = TransferDirection;

  canResolve(): boolean {
    return this.transfer().direction === TransferDirection.Entrada
      && this.transfer().status === TransferStatus.Pendiente;
  }

  canCancel(): boolean {
    return this.transfer().direction === TransferDirection.Salida
      && this.transfer().status === TransferStatus.Pendiente;
  }

  statusLabel(s: TransferStatus): string {
    return ['Pendiente', 'En tránsito', 'Completada', 'Rechazada', 'Cancelada'][s];
  }

  statusClasses(s: TransferStatus): string {
    const map: Record<TransferStatus, string> = {
      [TransferStatus.Pendiente]:  'bg-amber-50  text-amber-600  ring-1 ring-amber-200',
      [TransferStatus.Transito]:   'bg-blue-50   text-blue-600   ring-1 ring-blue-200',
      [TransferStatus.Completada]: 'bg-green-50  text-green-600  ring-1 ring-green-200',
      [TransferStatus.Rechazada]:  'bg-red-50    text-red-500    ring-1 ring-red-200',
      [TransferStatus.Cancelada]:  'bg-gray-100  text-gray-400   ring-1 ring-gray-200',
    };
    return map[s];
  }

  directionLabel(d: TransferDirection): string {
    return d === TransferDirection.Entrada ? 'Entrada' : 'Salida';
  }

  directionClasses(d: TransferDirection): string {
    return d === TransferDirection.Entrada ? 'text-emerald-600' : 'text-orange-500';
  }

  directionArrow(d: TransferDirection): string {
    return d === TransferDirection.Entrada ? '↓' : '↑';
  }


}
