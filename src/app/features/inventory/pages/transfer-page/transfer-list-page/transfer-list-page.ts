import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TransferList } from './transfer-list/transfer-list';
import {
  StockTransferListDto,
  TransferQueryParams,
} from '../../../dtos/transfers/stock-transfer-list-dto';
import { TransferService } from '../../../services/transfer-service';
import { Paginator } from '@shared/components/app-paginator/app-paginator';
import { TransferFilterBar } from '../transfer-filter-bar/transfer-filter-bar';

@Component({
  selector: 'app-transfer-list-page',
  standalone: true,
  imports: [TransferList, TransferFilterBar, Paginator],
  templateUrl: './transfer-list-page.html',
})
export default class TransferListPage implements OnInit {
  private transferService = inject(TransferService);
  readonly router = inject(Router);

  transfers = signal<StockTransferListDto[]>([]);
  totalItems = signal(0);
  loadingTransfers = signal(false);
  error = signal<string | null>(null);

  query = signal<TransferQueryParams>({
    page: 1,
    pageSize: 10,
  });

  hasActiveFilters = computed(() => {
    const q = this.query();
    return !!(q.status?.length || q.direction !== undefined || q.dateFrom || q.dateTo);
  });

  ngOnInit(): void {
    this.load();
  }

  patchQuery(patch: Partial<TransferQueryParams>): void {
    this.query.update((q) => ({ ...q, ...patch }));
    this.load();
  }

  load(): void {
    this.loadingTransfers.set(true);
    this.error.set(null);
    this.transferService.getTransfers(this.query()).subscribe({
      next: (data) => {
        this.transfers.set(data.items);
        this.totalItems.set(data.totalCount);
        this.loadingTransfers.set(false);
      },
      error: (err: any) => { this.loadingTransfers.set(false); const e = err as { error?: { detail?: string; title?: string }; message?: string }; this.error.set(e?.error?.detail || e?.error?.title || e?.message || 'Error al cargar transferencias.'); },
    });
  }
}
