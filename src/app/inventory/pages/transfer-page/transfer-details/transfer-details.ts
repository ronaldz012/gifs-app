import { Component, inject, input, output, signal} from '@angular/core';
import {TransferDirection, TransferStatus} from '../../../dtos/tranfers/transfer-enums';
import {StockTransferDetailDto} from '../../../dtos/tranfers/stock-transfer-detail-dto';
import {TransferService} from '../../../services/transfer-service';
import {DatePipe} from '@angular/common';
import {TotalQtyPipe} from '../../../dtos/tranfers/total-qty-pipe-pipe';
import {SkeletonList} from '../../../../core/ui/skeleton-list/skeleton-list';

@Component({
  selector: 'app-transfer-details',
  imports: [
    DatePipe,
    TotalQtyPipe,
    SkeletonList
  ],
  templateUrl: './transfer-details.html',
  styles: `
    @keyframes fade-up {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fade-up 240ms ease both; }


  `,
})
export class TransferDetails {
  private transferService = inject(TransferService);

  transferId = input.required<number>();

  back           = output<void>();
  requestResolve = output<number>();
  requestCancel  = output<number>();

  readonly Status    = TransferStatus;
  readonly Direction = TransferDirection;

  transfer = signal<StockTransferDetailDto | null>(null);
  loading  = signal(true);
  error    = signal<string | null>(null);

  ngOnInit(): void {
    this.loadDetail();
  }

  private loadDetail(): void {
    this.loading.set(true);
    this.error.set(null);
    this.transferService.getTransferDetail(this.transferId()).subscribe({
      next: data => {
        this.transfer.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la transferencia.');
        this.loading.set(false);
      },
    });
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

  canResolve(t: StockTransferDetailDto): boolean {
    return t.direction === TransferDirection.Entrada
      && t.status === TransferStatus.Pendiente;
  }

  canCancel(t: StockTransferDetailDto): boolean {
    return t.direction === TransferDirection.Salida
      && t.status === TransferStatus.Pendiente;
  }

  variantLabel(item: { variantDescription: string; size: string; color: string }): string {
    return [item.variantDescription, item.size, item.color].filter(Boolean).join(' · ');
  }

}
