import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Observable, map, throwError } from 'rxjs';
import {
  CheckActionResult,
  VerifyActionModal,
} from '@shared/components/verify-action-modal/verify-action-modal';

import { ReceptionService } from '../../../services/reception-service';
import { LabelData } from '../../../interfaces/reception-labels';
import { LabelPrintService } from '../../../services/print-label-service';
import { ReceptionLabelsDto } from '../../../dtos/receptions/reception-labels-dto';
import { ReceptionStatus } from '../../../dtos/receptions/stock-reception-list-dto';
import {
  StockReceptionDetailDto,
  StockReceptionItemDetailDto,
} from '../../../dtos/receptions/stock-reception-details-dto';
import SkeletonList from '@shared/ui/skeleton-list/skeleton-list';

@Component({
  selector: 'app-reception-details',
  imports: [DatePipe, CurrencyPipe, SkeletonList, VerifyActionModal],
  templateUrl: './reception-details.html',
  styles: `
    @keyframes fade-up {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .fade-up {
      animation: fade-up 240ms ease both;
    }
  `,
})
export default class ReceptionDetails implements OnInit {
  private receptionService = inject(ReceptionService);
  private route = inject(ActivatedRoute);
  readonly router = inject(Router);

  readonly Status = ReceptionStatus;

  reception = signal<StockReceptionDetailDto | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  rollbackModalOpen = signal(false);
  private printService = inject(LabelPrintService);

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['inventory', 'receptions']);
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadDetail(id);
  }

  private loadDetail(id: GUID): void {
    this.loading.set(true);
    this.error.set(null);
    this.receptionService.getReceptionDetail(id).subscribe({
      next: (data) => {
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
  openRollbackModal(): void {
    this.rollbackModalOpen.set(true);
  }
  closeRollbackModal(): void {
    this.rollbackModalOpen.set(false);
  }

  onRollbackSuccess(): void {
    this.closeRollbackModal();
    this.router.navigate(['inventory', 'receptions']);
  }

  readonly rollbackReasonMessages: Record<string, string> = {
    ALREADY_REVERTED: 'Esta recepción ya fue revertida anteriormente.',
    OUTDATED: 'No se puede revertir: la recepción supera las 24 horas.',
    NOT_ENOUGH_STOCK: 'No se puede revertir: stock insuficiente en la sucursal.',
  };

  readonly checkRollback = (): Observable<CheckActionResult> => {
    const id = this.reception()?.id;
    if (!id) return throwError(() => new Error('Sin recepción'));
    return this.receptionService
      .checkCanRevert(id)
      .pipe(map((r) => ({ canProceed: r.canRevert, reason: r.reason || undefined })));
  };

  readonly executeRollback = (): Observable<void> => {
    const id = this.reception()?.id;
    if (!id) return throwError(() => new Error('Sin recepción'));
    return this.receptionService.rollbackReception(id).pipe(map(() => void 0));
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  statusClasses(s: ReceptionStatus): string {
    const map: Record<ReceptionStatus, string> = {
      [ReceptionStatus.Borrador]: 'badge-warning',
      [ReceptionStatus.Confirmado]: 'badge-success',
      [ReceptionStatus.Rechazado]: 'badge-error',
      [ReceptionStatus.Revertida]: 'badge-error',
    };
    return map[s];
  }

  variantLabel(item: StockReceptionItemDetailDto): string {
    return [item.variantDescription, item.size, item.color].filter(Boolean).join(' · ');
  }

  get totalQuantity(): number {
    return this.reception()?.items.reduce((sum, i) => sum + i.quantityReceived, 0) ?? 0;
  }

  async generarEtiquetas(): Promise<void> {
    const id = this.reception()?.id;
    if (!id) return;

    this.loading.set(true);

    this.receptionService.getReceptionLabels(id).subscribe({
      next: async (data: ReceptionLabelsDto) => {
        try {
          const labels: LabelData[] = data.items.flatMap((item) =>
            Array.from({ length: item.quantity }, (): LabelData => ({
              variantId: item.variantId,
              sku: item.sku,
              productName: item.productName,
              brandName: item.brandName,
              size: item.size,
              color: item.color,
              gender: item.gender,
              price: item.price,
              receptionId: data.receptionId,
            })),
          );
          const doc = await this.printService.generatePdf(labels);
          doc.save(`etiquetas-recepcion-${data.receptionId}.pdf`);
        } catch (e) {
          console.error('Error generando PDF de etiquetas', e);
        } finally {
          this.loading.set(false);
        }
      },
      error: () => {
        this.loading.set(false);
        console.error('No se pudieron obtener las etiquetas.');
      },
    });
  }

  protected readonly print = print;
}
