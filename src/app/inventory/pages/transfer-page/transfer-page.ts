import { Component, inject, signal} from '@angular/core';
import {TransferForm} from '../../dtos/tranfers/transfer-form';
import {BranchContextService} from '../../../core/auth/branch-context-service';
import {TransferService} from '../../services/transfer-service';
import {BranchDto} from '../../../core/dtos/branch-dto';
import CreateTransfer from './create-transfer/create-transfer';
import {StockTransferListDto} from '../../dtos/tranfers/stock-transfer-list-dto';
import {TransferList} from './transfer-list/transfer-list';
import {TransferDetails} from './transfer-details/transfer-details';


type TransfersView = 'list' | 'create' |'detail';
@Component({
  selector: 'app-transfer-page',
  imports: [
    CreateTransfer,
    TransferList,
    TransferDetails
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

  // ── Handlers lista ────────────────────────────────────────────────────────────
  onResolve(event: { id: number; action: 'complete' | 'reject' }): void {
    this.transferService.resolveTransfer(event.id, event.action).subscribe({
      next: () => this.loadTransfers(),
      error: err => console.error('Error al resolver:', err),
    });
  }

  onCancel(id: number): void {
    this.transferService.cancelTransfer(id).subscribe({
      next: () => this.loadTransfers(),
      error: err => console.error('Error al cancelar:', err),
    });
  }

  // ── Handlers detalle ──────────────────────────────────────────────────────────
  onDetailResolveSuccess(): void {
    this.loadTransfers();
    this.showList();
  }

  onDetailCancelSuccess(): void {
    this.loadTransfers();
    this.showList();
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
