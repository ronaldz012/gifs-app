import { Component, input, output, signal } from '@angular/core';
import {StockTransferListDto} from '../../../../dtos/transfers/stock-transfer-list-dto';
import {TransferListItem} from './transfer-list-item/transfer-list-item';
import SkeletonList from '@shared/ui/skeleton-list/skeleton-list';


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
      <div class="flex flex-col gap-2.5
              lg:gap-0 lg:border lg:border-gray-200 lg:rounded-xl lg:overflow-hidden lg:shadow-sm lg:bg-white">

        <!-- Header — solo desktop -->
        <div
          class="hidden lg:grid px-4 py-2 border-b border-gray-100 bg-gray-50/80
             text-[10px] font-semibold uppercase tracking-wider text-gray-400"
          style="grid-template-columns: 3.5rem 5rem 6rem 1fr 8rem 4.5rem 5.5rem 5.5rem 9rem;"
        >
          <span>ID</span>
          <span>Dirección</span>
          <span>Estado</span>
          <span>Sucursal</span>
          <span>Solicitante</span>
          <span class="text-right pr-4">Uds</span>
          <span class="text-right pr-4">Creado</span>
          <span class="text-right pr-4">Resuelto</span>
          <span></span>
        </div>

        <!-- Items -->
        <ul class="flex flex-col gap-2.5 lg:gap-0 lg:divide-y lg:divide-gray-100">
          @for (t of transfers(); track t.id; let i = $index) {
            <app-transfer-list-item
              [transfer]="t"
              [index]="t.id"
              (viewDetail)="viewDetail.emit($event)"
              (requestResolve)="requestResolve.emit($event)"
              (requestCancel)="requestCancel.emit($event)"
            />
          }
        </ul>
      </div>
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

  viewDetail     = output<GUID>();
  requestResolve = output<GUID>();
  requestCancel  = output<GUID>();

}
