import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ResolveTransferModal } from '../resolve-transfer-modal/resolve-transfer-modal';
import { ConfirmActionModal } from '../confirm-action-modal/confirm-action-modal';
import {TransferList} from './transfer-list/transfer-list';
import {StockTransferListDto} from '../../../dtos/tranfers/stock-transfer-list-dto';
import {TransferService} from '../../../services/transfer-service';

@Component({
  selector: 'app-transfer-list-page',
  imports: [TransferList, ResolveTransferModal, ConfirmActionModal],
  templateUrl: './transfer-list-page.html',
})
export default class TransferListPage implements OnInit {
  private transferService = inject(TransferService);
  readonly router         = inject(Router);

  transfers        = signal<StockTransferListDto[]>([]);
  loadingTransfers = signal(false);

  resolveModalId = signal<number | null>(null);
  cancelModalId  = signal<number | null>(null);
  submitting     = signal(false);

  ngOnInit(): void {
    this.loadTransfers();
  }

  private loadTransfers(): void {
    this.loadingTransfers.set(true);
    this.transferService.getTransfers().subscribe({
      next: data => {
        this.transfers.set(data.items);
        this.loadingTransfers.set(false);
      },
      error: () => this.loadingTransfers.set(false),
    });
  }

  // ── Modal: Resolve ────────────────────────────────────────────────────────
  openResolveModal(id: number): void  { this.resolveModalId.set(id); }
  closeResolveModal(): void           { this.resolveModalId.set(null); }

  onResolveConfirm(action: 'complete' | 'reject'): void {
    const id = this.resolveModalId();
    if (!id) return;
    this.submitting.set(true);
    this.transferService.resolveTransfer(id, action).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeResolveModal();
        this.loadTransfers();
      },
      error: () => this.submitting.set(false),
    });
  }

  // ── Modal: Cancel ─────────────────────────────────────────────────────────
  openCancelModal(id: number): void { this.cancelModalId.set(id); }
  closeCancelModal(): void          { this.cancelModalId.set(null); }

  onCancelConfirm(): void {
    const id = this.cancelModalId();
    if (!id) return;
    this.submitting.set(true);
    this.transferService.cancelTransfer(id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeCancelModal();
        this.loadTransfers();
      },
      error: () => this.submitting.set(false),
    });
  }
}
