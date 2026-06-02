import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ConfirmActionModal } from '../../transfer-page/confirm-action-modal/confirm-action-modal';

import {ReceptionService} from '../../../services/reception-service';
import {ReceptionStatus} from '../../../dtos/Receptions/stock-reception-list-dto';
import {StockReceptionDetailDto, StockReceptionItemDetailDto} from '../../../dtos/Receptions/stock-reception-details-dto';
import SkeletonList from '@shared/ui/skeleton-list/skeleton-list';


@Component({
  selector: 'app-reception-details',
  imports: [DatePipe, CurrencyPipe, SkeletonList, ConfirmActionModal],
  templateUrl: './reception-details.html',
  styles: `
    @keyframes fade-up {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fade-up 240ms ease both; }
  `,
})
export default class ReceptionDetails implements OnInit {
  private receptionService = inject(ReceptionService);
  private route            = inject(ActivatedRoute);
  readonly router          = inject(Router);

  readonly Status = ReceptionStatus;

  reception = signal<StockReceptionDetailDto | null>(null);
  loading   = signal(true);
  error     = signal<string | null>(null);

  rollbackModalId = signal<GUID | null>(null);
  submitting      = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadDetail(id);
  }

  private loadDetail(id: GUID): void {
    this.loading.set(true);
    this.error.set(null);
    this.receptionService.getReceptionDetail(id).subscribe({
      next: data => {
        this.reception.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la recepción.');
        this.loading.set(false);
      },
    });
  }

  // ── Modal: Rollback ───────────────────────────────────────────────────────
  openRollbackModal(id: GUID): void { this.rollbackModalId.set(id); }
  closeRollbackModal(): void          { this.rollbackModalId.set(null); }

  onRollbackConfirm(): void {
    const id = this.rollbackModalId();
    if (!id) return;
    this.submitting.set(true);
    this.receptionService.rollbackReception(id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeRollbackModal();
        this.router.navigate(['receptions']);
      },
      error: () => this.submitting.set(false),
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
statusClasses(s: ReceptionStatus): string {
  const map: Record<ReceptionStatus, string> = {
    [ReceptionStatus.Borrador]:   'badge-warning',
    [ReceptionStatus.Confirmado]: 'badge-success',
    [ReceptionStatus.Rechazado]:  'badge-error',
    [ReceptionStatus.Revertida]:  'badge-error',
  };
  return map[s];
}

  variantLabel(item: StockReceptionItemDetailDto): string {
    return [item.variantDescription, item.size, item.color].filter(Boolean).join(' · ');
  }

  get totalQuantity(): number {
    return this.reception()?.items.reduce((sum, i) => sum + i.quantityReceived, 0) ?? 0;
  }

  openLabels(): void {
    const id = this.reception()?.id;
    console.log(id);
    if (!id) return;
    this.router.navigate(
      ['/print/receptions', id],
      { queryParams: { back: `/inventory/receptions/${id}` } }
    );
  }


  protected readonly print = print;
}
