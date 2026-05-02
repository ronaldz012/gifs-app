import {Component, inject, input, OnInit, output, signal} from '@angular/core';
import {CurrencyPipe, DatePipe, KeyValuePipe} from '@angular/common';
import {StockReceptionListDto} from '../../../../dtos/Receptions/stock-reception-list-dto';
import {ReceptionListItem} from './reception-list-item/reception-list-item';
import {SkeletonList} from '../../../../../core/ui/skeleton-list/skeleton-list';
import {ReceptionService} from '../../../../services/reception-service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-reception-list',
  imports: [ReceptionListItem,SkeletonList],
  template: `
    @if (loading()) {

      <app-skeleton-list [rows]="4" [columns]="3"/>

    } @else if (receptions().length === 0) {

      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-12
                  flex flex-col items-center gap-3">
        <span class="text-3xl opacity-30">📦</span>
        <p class="text-sm text-gray-400">No hay recepciones registradas.</p>
      </div>

    } @else {

      <ul class="flex flex-col gap-2.5">
        @for (r of receptions(); track r.id; let i = $index) {
          <app-reception-list-item
            [reception]="r"
            [index]="i"
            (viewDetails)="goToDetails.emit($event)"
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
  `,
})
export default class ReceptionList {

  router = inject(Router);
  receptions = input.required<StockReceptionListDto[]>();
  loading    = input<boolean>(false);
  goToDetails = output<number>();
}
