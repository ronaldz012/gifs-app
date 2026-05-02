import { Component, input, output, signal } from '@angular/core';
import {StockTransferListDto} from '../../../../dtos/tranfers/stock-transfer-list-dto';
import {SkeletonList} from '../../../../../core/ui/skeleton-list/skeleton-list';
import {TransferListItem} from './transfer-list-item/transfer-list-item';


@Component({
  selector: 'app-transfer-list',
  imports: [
    SkeletonList,
    TransferListItem
  ],
  template:`
    @if (loading()) {

      <app-skeleton-list [rows]="4" [columns]="3" />

    } @else if (transfers().length === 0) {

      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-12
                  flex flex-col items-center gap-3">
        <span class="text-3xl opacity-30">⇅</span>
        <p class="text-sm text-gray-400">No hay transferencias registradas.</p>
      </div>

    } @else {

      <ul class="flex flex-col gap-2.5">
        @for (t of transfers(); track t.id; let i = $index) {
          <app-transfer-list-item
            [transfer]="t"
            [index]="i"
            (viewDetail)="viewDetail.emit($event)"
            (requestResolve)="requestResolve.emit($event)"
            (requestCancel)="requestCancel.emit($event)"
          />
        }
      </ul>

    }

  `,
  styles: `
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .row-enter { animation: slide-up 220ms ease both; }

    @keyframes confirm-in {
      from { opacity: 0; transform: scaleY(0.9); }
      to   { opacity: 1; transform: scaleY(1); }
    }
    .confirm-enter { animation: confirm-in 160ms ease both; transform-origin: top; }
  `,
})
export class TransferList {
  transfers = input.required<StockTransferListDto[]>();
  loading   = input<boolean>(false);

  viewDetail     = output<number>();
  requestResolve = output<number>();
  requestCancel  = output<number>();

}
