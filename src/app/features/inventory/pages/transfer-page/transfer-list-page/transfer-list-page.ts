// features/transfers/pages/transfer-list-page/transfer-list-page.ts
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ResolveTransferModal } from '../resolve-transfer-modal/resolve-transfer-modal';
import { ConfirmActionModal } from '../confirm-action-modal/confirm-action-modal';
import { TransferList } from './transfer-list/transfer-list';
import { StockTransferListDto, TransferQueryParams} from '../../../dtos/transfers/stock-transfer-list-dto';
import { TransferService } from '../../../services/transfer-service';
import { Paginator } from '@shared/components/app-paginator/app-paginator';
import { TransferFilterBar } from '../transfer-filter-bar/transfer-filter-bar';
import { NavigateButton } from "@shared/components/navigate-button";


@Component({
  selector: 'app-transfer-list-page',
  standalone: true,
  imports: [TransferList, ResolveTransferModal, ConfirmActionModal, TransferFilterBar, Paginator, NavigateButton],
  templateUrl: './transfer-list-page.html',
})
export default class TransferListPage implements OnInit {
  private transferService = inject(TransferService);
  readonly router         = inject(Router);

  transfers        = signal<StockTransferListDto[]>([]);
  totalItems       = signal(0);
  loadingTransfers = signal(false);

  resolveModalId = signal<GUID | null>(null);
  cancelModalId  = signal<GUID | null>(null);
  submitting     = signal(false);

  query = signal<TransferQueryParams>({
    isPaged: true,
    page: 1,
    pageSize: 10,
    sortBy: 'CreatedAt',
    sortDirection: 'desc',
  });

  hasActiveFilters = computed(() => {
    const q = this.query();
    return !!(q.status?.length || q.direction !== undefined || q.dateFrom || q.dateTo);
  });

  ngOnInit(): void {
    this.load();
  }

  patchQuery(patch: Partial<TransferQueryParams>): void {
    this.query.update(q => ({ ...q, ...patch }));
    this.load();
  }

  private load(): void {
    this.loadingTransfers.set(true);
    this.transferService.getTransfers(this.query()).subscribe({
      next: data => {
        this.transfers.set(data.items);
        this.totalItems.set(data.totalCount); // ajusta al campo real de tu PagedResult
        this.loadingTransfers.set(false);
      },
      error: () => this.loadingTransfers.set(false),
    });
  }

  // ── Modal: Resolve ───────────────────────────────────────────────────────
  openResolveModal(id: GUID): void  { this.resolveModalId.set(id); }
  closeResolveModal(): void           { this.resolveModalId.set(null); }

  onResolveConfirm(action: 'complete' | 'reject'): void {
    const id = this.resolveModalId();
    if (!id) return;
    this.submitting.set(true);
    this.transferService.resolveTransfer(id, action).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeResolveModal();
        this.load();
      },
      error: () => this.submitting.set(false),
    });
  }

  // ── Modal: Cancel ────────────────────────────────────────────────────────
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
        this.load();
      },
      error: () => this.submitting.set(false),
    });
  }
}
