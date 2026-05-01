import { Component, inject, input, output, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ReceptionService } from '../../../services/reception-service';
import { SkeletonList } from '../../../../core/ui/skeleton-list/skeleton-list';
import {ReceptionStatus} from '../../../dtos/Receptions/stock-reception-list-dto';
import {StockReceptionDetailDto, StockReceptionItemDetailDto} from '../../../dtos/Receptions/stock-reception-details-dto';

@Component({
  selector: 'app-reception-details',
  imports: [DatePipe, CurrencyPipe, SkeletonList],
  templateUrl: './reception-details.html',
  styles: `
    @keyframes fade-up {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fade-up 240ms ease both; }
  `,
})
export class ReceptionDetails {
  private receptionService = inject(ReceptionService);

  receptionId = input.required<number>();

  back            = output<void>();
  requestRollback = output<number>();

  readonly Status = ReceptionStatus;

  reception = signal<StockReceptionDetailDto | null>(null);
  loading   = signal(true);
  error     = signal<string | null>(null);

  ngOnInit(): void {
    this.loadDetail();
  }

  private loadDetail(): void {
    this.loading.set(true);
    this.error.set(null);
    this.receptionService.getReceptionDetail(this.receptionId()).subscribe({
      next: data => {
        this.reception.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la recepción.');
        this.loading.set(false);
      },
    });
  }


  statusClasses(s: ReceptionStatus): string {
    const map: Record<ReceptionStatus, string> = {
      [ReceptionStatus.Borrador]:     'bg-amber-50  text-amber-600  ring-1 ring-amber-200',
      [ReceptionStatus.Confirmado]: 'bg-green-50  text-green-600  ring-1 ring-green-200',
      [ReceptionStatus.Rechazado]:  'bg-red-50    text-red-500    ring-1 ring-red-200',
    };
    return map[s];
  }

  variantLabel(item: StockReceptionItemDetailDto): string {
    return [item.variantDescription, item.size, item.color].filter(Boolean).join(' · ');
  }

  get totalQuantity(): number {
    return this.reception()?.items.reduce((sum, i) => sum + i.quantityReceived, 0) ?? 0;
  }
}
