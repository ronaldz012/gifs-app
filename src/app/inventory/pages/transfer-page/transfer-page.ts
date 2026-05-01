import { Component, inject, signal} from '@angular/core';
import {TransferForm} from '../../dtos/tranfers/transfer-form';
import {BranchContextService} from '../../../core/auth/branch-context-service';
import {TransferService} from '../../services/transfer-service';
import {BranchDto} from '../../../core/dtos/branch-dto';
import CreateTransfer from './create-transfer/create-transfer';
import {StockTransferListDto} from '../../dtos/tranfers/stock-transfer-list-dto';
import {TransferList} from './transfer-list/transfer-list';
import {TransferDetails} from './transfer-details/transfer-details';
import {Breadcrumb, PageHeader} from '../../../core/ui/page-header/page-header';
import {ResolveTransferModal} from './resolve-transfer-modal/resolve-transfer-modal';
import {ConfirmActionModal} from './confirm-action-modal/confirm-action-modal';


type TransfersView = 'list' | 'create' |'detail';
@Component({
  selector: 'app-transfer-page',
  imports: [
    CreateTransfer,
    TransferList,
    TransferDetails,
    ResolveTransferModal,
    ConfirmActionModal,
    PageHeader
  ],
  templateUrl: './transfer-page.html',
  styles: ``,
})
export default class TransferPage {

  private branchService   = inject(BranchContextService);
  private transferService = inject(TransferService);

  // ── Vista activa ──────────────────────────────────────────────────────────────
  view               = signal<TransfersView>('list');
  selectedTransferId = signal<number | null>(null);

  // ── Branches ──────────────────────────────────────────────────────────────────
  branches        = signal<BranchDto[]>([]);
  loadingBranches = signal(false);

  // ── Transferencias ────────────────────────────────────────────────────────────
  transfers        = signal<StockTransferListDto[]>([]);
  loadingTransfers = signal(false);

  // ── Modal state (owned by the page) ──────────────────────────────────────────
  /** Id of the transfer pending resolve action, or null if modal is closed. */
  resolveModalId  = signal<number | null>(null);
  /** Id of the transfer pending cancel action, or null if modal is closed. */
  cancelModalId   = signal<number | null>(null);
  submitting      = signal(false);

  // ── Breadcrumbs ───────────────────────────────────────────────────────────────
  get headerCrumbs(): Breadcrumb[] {
    switch (this.view()) {
      case 'list':
        return [{ label: 'Transferencias' }];
      case 'create':
        return [
          { label: 'Transferencias', action: true },
          { label: 'Nueva transferencia' },
        ];
      case 'detail':
        return [
          { label: 'Transferencias', action: true },
          { label: this.selectedTransferId() ? `#${this.selectedTransferId()}` : 'Detalle' },
        ];
    }
  }

  ngOnInit(): void {
    this.loadBranches();
    this.loadTransfers();
  }

  private loadBranches(): void {
    this.loadingBranches.set(true);
    this.branchService.getBranches().subscribe({
      next: branches => {
        const currentBranchId = this.branchService.active()?.branchId ?? 0;
        this.branches.set(branches.filter(b => b.id !== currentBranchId));
        this.loadingBranches.set(false);
      },
      error: () => this.loadingBranches.set(false),
    });
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

  // ── Navegación ────────────────────────────────────────────────────────────────
  showCreate(): void { this.view.set('create'); }
  showList():   void { this.view.set('list');   }

  showDetail(id: number): void {
    this.selectedTransferId.set(id);
    this.view.set('detail');
  }

  /** Called when a breadcrumb with action=true is clicked (index 0 = root). */
  onCrumbClick(_index: number): void {
    this.showList();
  }

  // ── Modal: Resolve ────────────────────────────────────────────────────────────
  openResolveModal(id: number): void {
    this.resolveModalId.set(id);
  }

  closeResolveModal(): void {
    this.resolveModalId.set(null);
  }

  onResolveConfirm(action: 'complete' | 'reject'): void {
    const id = this.resolveModalId();
    if (!id) return;
    this.submitting.set(true);
    this.transferService.resolveTransfer(id, action).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeResolveModal();
        this.loadTransfers();
        if (this.view() === 'detail') this.showList();
      },
      error: () => this.submitting.set(false),
    });
  }

  // ── Modal: Cancel ─────────────────────────────────────────────────────────────
  openCancelModal(id: number): void {
    this.cancelModalId.set(id);
  }

  closeCancelModal(): void {
    this.cancelModalId.set(null);
  }

  onCancelConfirm(): void {
    const id = this.cancelModalId();
    if (!id) return;
    this.submitting.set(true);
    this.transferService.cancelTransfer(id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeCancelModal();
        this.loadTransfers();
        if (this.view() === 'detail') this.showList();
      },
      error: () => this.submitting.set(false),
    });
  }

  // ── Handler create ────────────────────────────────────────────────────────────
  onTransferCreated(payload: TransferForm): void {
    this.transferService.createTransfer(payload).subscribe({
      next: () => {
        this.showList();
        this.loadTransfers();
      },
      error: err => console.error('Error al crear transferencia:', err),
    });
  }


}
