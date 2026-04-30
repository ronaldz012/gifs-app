import { Component, inject, input, output, signal} from '@angular/core';
import {TransferDirection, TransferStatus} from '../../../dtos/tranfers/transfer-enums';
import {StockTransferDetailDto} from '../../../dtos/tranfers/stock-transfer-detail-dto';
import {TransferService} from '../../../services/transfer-service';
import {DatePipe} from '@angular/common';
import {TotalQtyPipe} from '../../../dtos/tranfers/total-qty-pipe-pipe';

@Component({
  selector: 'app-transfer-details',
  imports: [
    DatePipe,
    TotalQtyPipe
  ],
  templateUrl: './transfer-details.html',
  styles: `
    @keyframes fade-up {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fade-up 240ms ease both; }

    @keyframes confirm-in {
      from { opacity: 0; transform: scaleY(0.9); }
      to   { opacity: 1; transform: scaleY(1); }
    }
    .confirm-enter {
      animation: confirm-in 160ms ease both;
      transform-origin: top;
    }

  `,
})
export class TransferDetails {
  private transferService = inject(TransferService);

  // ── Inputs ────────────────────────────────────────────────────────────────────
  transferId = input.required<number>();

  // ── Outputs ───────────────────────────────────────────────────────────────────
  back           = output<void>();
  resolveSuccess = output<void>();
  cancelSuccess  = output<void>();

  // ── Enums expuestos al template ───────────────────────────────────────────────
  readonly Status    = TransferStatus;
  readonly Direction = TransferDirection;

  // ── Estado ────────────────────────────────────────────────────────────────────
  transfer  = signal<StockTransferDetailDto | null>(null);
  loading   = signal(true);
  error     = signal<string | null>(null);

  /** Controla el panel de confirmación de acción ('resolve' | 'cancel' | null) */
  confirmMode = signal<'resolve' | 'cancel' | null>(null);
  submitting  = signal(false);

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

  // ── Helpers de presentación ───────────────────────────────────────────────────
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
      && t.status    === TransferStatus.Pendiente;
  }

  canCancel(t: StockTransferDetailDto): boolean {
    return t.direction === TransferDirection.Salida
      && t.status    === TransferStatus.Pendiente;
  }

  variantLabel(item: { variantDescription: string; size: string; color: string }): string {
    return [item.variantDescription, item.size, item.color].filter(Boolean).join(' · ');
  }

  // ── Acciones ──────────────────────────────────────────────────────────────────
  openConfirm(mode: 'resolve' | 'cancel'): void {
    this.confirmMode.set(mode);
  }

  closeConfirm(): void {
    this.confirmMode.set(null);
  }

  confirmResolve(action: 'complete' | 'reject'): void {
    this.submitting.set(true);
    this.transferService.resolveTransfer(this.transferId(), action).subscribe({
      next: () => {
        this.submitting.set(false);
        this.resolveSuccess.emit();
      },
      error: () => this.submitting.set(false),
    });
  }

  confirmCancel(): void {
    this.submitting.set(true);
    this.transferService.cancelTransfer(this.transferId()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.cancelSuccess.emit();
      },
      error: () => this.submitting.set(false),
    });
  }

}
