import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import ReceptionList from './reception-list/reception-list';
import { ConfirmActionModal } from '../../transfer-page/confirm-action-modal/confirm-action-modal';
import {ReceptionService} from '../../../services/reception-service';
import {StockReceptionListDto} from '../../../dtos/Receptions/stock-reception-list-dto';

@Component({
  selector: 'app-reception-list-page',
  imports: [ReceptionList, ConfirmActionModal],
  templateUrl: './reception-list-page.html',
})
export default class ReceptionListPage implements OnInit {
  private receptionService = inject(ReceptionService);
  readonly router          = inject(Router);

  receptions        = signal<StockReceptionListDto[]>([]);
  loadingReceptions = signal(false);

  rollbackModalId = signal<number | null>(null);
  submitting      = signal(false);

  ngOnInit(): void {
    this.loadReceptions();
  }

  private loadReceptions(): void {
    this.loadingReceptions.set(true);
    this.receptionService
      .getReceptions({ isPaged: true, page: 1, pageSize: 10, sortDirection: 'desc', sortBy: 'Id' })
      .subscribe({
        next: data => {
          this.receptions.set(data.items);
          this.loadingReceptions.set(false);
        },
        error: () => this.loadingReceptions.set(false),
      });
  }

  // ── Modal: Rollback ───────────────────────────────────────────────────────
  openRollbackModal(id: number): void { this.rollbackModalId.set(id); }
  closeRollbackModal(): void          { this.rollbackModalId.set(null); }

  onRollbackConfirm(): void {
    const id = this.rollbackModalId();
    if (!id) return;
    this.submitting.set(true);
    this.receptionService.rollbackReception(id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeRollbackModal();
        this.loadReceptions();
      },
      error: () => this.submitting.set(false),
    });
  }
}
