import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ResolveTransferModal } from '../resolve-transfer-modal/resolve-transfer-modal';
import { ConfirmActionModal } from '../confirm-action-modal/confirm-action-modal';
import {TotalQtyPipe} from '../../../dtos/transfers/total-qty.pipe';
import {TransferService} from '../../../services/transfer-service';
import {TransferDirection, TransferStatus} from '../../../dtos/transfers/transfer-enums';
import {StockTransferDetailDto} from '../../../dtos/transfers/stock-transfer-detail-dto';
import SkeletonList from '@shared/ui/skeleton-list/skeleton-list';

@Component({
  selector: 'app-transfer-details',
  imports: [DatePipe, TotalQtyPipe, SkeletonList, ResolveTransferModal, ConfirmActionModal],
  templateUrl: './transfer-details.html',
  styles: `
    @keyframes fade-up {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fade-up 240ms ease both; }
  `,
})
export default class  TransferDetails implements OnInit {
  private transferService = inject(TransferService);
  private route           = inject(ActivatedRoute);
  readonly router         = inject(Router);

  readonly Status    = TransferStatus;
  readonly Direction = TransferDirection;

  transfer = signal<StockTransferDetailDto | null>(null);
  loading  = signal(true);
  error    = signal<string | null>(null);

  resolveModalId = signal<GUID | null>(null);
  cancelModalId  = signal<GUID | null>(null);
  submitting     = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadDetail(id);
  }

  private loadDetail(id: GUID): void {
    this.loading.set(true);
    this.error.set(null);
    this.transferService.getTransferDetail(id).subscribe({
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

  // ── Modal: Resolve ────────────────────────────────────────────────────────
  openResolveModal(id: GUID): void { this.resolveModalId.set(id); }
  closeResolveModal(): void          { this.resolveModalId.set(null); }

  onResolveConfirm(action: 'complete' | 'reject'): void {
    const id = this.resolveModalId();
    if (!id) return;
    this.submitting.set(true);
    this.transferService.resolveTransfer(id, action).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeResolveModal();
        this.router.navigate(['transfers']);
      },
      error: () => this.submitting.set(false),
    });
  }

  // ── Modal: Cancel ─────────────────────────────────────────────────────────
  openCancelModal(id: GUID): void { this.cancelModalId.set(id); }
  closeCancelModal(): void          { this.cancelModalId.set(null); }

  onCancelConfirm(): void {
    const id = this.cancelModalId();
    if (!id) return;
    this.submitting.set(true);
    this.transferService.cancelTransfer(id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeCancelModal();
        this.router.navigate(['transfers']);
      },
      error: () => this.submitting.set(false),
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
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
