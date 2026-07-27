// features/receptions/pages/reception-list-page/reception-list-page.ts
import { Router } from '@angular/router';
import ReceptionList from './reception-list/reception-list';
import { ConfirmActionModal } from '../../transfer-page/confirm-action-modal/confirm-action-modal';
import { ReceptionService } from '../../../services/reception-service';
import {ReceptionQueryParams, StockReceptionListDto } from '../../../dtos/receptions/stock-reception-list-dto';
import {ReceptionFilterBar} from '../reception-filter-bar/reception-filter-bar';
import {Paginator} from '@shared/components/app-paginator/app-paginator';
import { Component, computed, inject, OnInit, signal } from '@angular/core';


@Component({
  selector: 'app-reception-list-page',
  standalone: true,
  imports: [ReceptionList, ConfirmActionModal, ReceptionFilterBar, Paginator],
  templateUrl: './reception-list-page.html',
})
export default class ReceptionListPage implements OnInit {
  private receptionService = inject(ReceptionService);
  readonly router          = inject(Router);

  receptions        = signal<StockReceptionListDto[]>([]);
  totalItems        = signal(0);
  loadingReceptions = signal(false);

  rollbackModalId = signal<GUID | null>(null);
  submitting      = signal(false);

  query = signal<ReceptionQueryParams>({
    page: 1,
    pageSize: 10,
  });

  hasActiveFilters = computed(() => {
    const q = this.query();
    return !!(q.dateFrom || q.dateTo || q.status !== undefined || q.brandId);
  });

  ngOnInit(): void {
    this.load();
  }

  patchQuery(patch: Partial<ReceptionQueryParams>): void {
    this.query.update(q => ({ ...q, ...patch }));
    this.load();
  }

  private load(): void {
    this.loadingReceptions.set(true);
    this.receptionService.getAll(this.query()).subscribe({
      next: data => {
        this.receptions.set(data.items);
        this.totalItems.set(data.totalCount); // ajusta al campo real de tu PagedResult
        this.loadingReceptions.set(false);
      },
      error: () => this.loadingReceptions.set(false),
    });
  }

  // ── Modal: Rollback ──────────────────────────────────────────────────────
  openRollbackModal(id: GUID): void  { this.rollbackModalId.set(id); }
  closeRollbackModal(): void           { this.rollbackModalId.set(null); }

  onRollbackConfirm(): void {
    const id = this.rollbackModalId();
    if (!id) return;
    this.submitting.set(true);
    this.receptionService.rollbackReception(id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeRollbackModal();
        this.load();
      },
      error: () => this.submitting.set(false),
    });
  }
}
