import { Component, inject, OnInit, signal } from '@angular/core';
import { ReceptionService } from '../../services/reception-service';
import { StockReceptionListDto } from '../../dtos/Receptions/stock-reception-list-dto';
import { Breadcrumb, PageHeader } from '../../../core/ui/page-header/page-header';
import ReceptionForm from './reception-form/reception-form';
import {ConfirmActionModal} from '../transfer-page/confirm-action-modal/confirm-action-modal';
import ReceptionList from './reception-list/reception-list';
import {ReceptionDetails} from './reception-details/reception-details';

type ReceptionsView = 'list' | 'create' | 'detail';

@Component({
  selector: 'app-receptions-page',
  imports: [
    PageHeader,
    ReceptionList,
    ReceptionForm,
    ConfirmActionModal,
    ReceptionDetails,
  ],
  templateUrl: './receptions-page.html',
  styles: ``,
})
export default class ReceptionsPage implements OnInit {

  private receptionService = inject(ReceptionService);

  // ── Vista activa ──────────────────────────────────────────────────────────────
  view               = signal<ReceptionsView>('list');
  selectedReceptionId = signal<number | null>(null);

  // ── Recepciones ───────────────────────────────────────────────────────────────
  receptions        = signal<StockReceptionListDto[]>([]);
  loadingReceptions = signal(false);

  // ── Modal: Rollback ───────────────────────────────────────────────────────────
  rollbackModalId = signal<number | null>(null);
  submitting      = signal(false);

  // ── Breadcrumbs ───────────────────────────────────────────────────────────────
  get headerCrumbs(): Breadcrumb[] {
    switch (this.view()) {
      case 'list':
        return [{ label: 'Recepciones' }];
      case 'create':
        return [
          { label: 'Recepciones', action: true },
          { label: 'Nueva recepción' },
        ];
      case 'detail':
        return [
          { label: 'Recepciones', action: true },
          { label: this.selectedReceptionId() ? `#${this.selectedReceptionId()}` : 'Detalle' },
        ];
    }
  }

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

  // ── Navegación ────────────────────────────────────────────────────────────────
  showList():   void { this.view.set('list');   }
  showCreate(): void { this.view.set('create'); }

  showDetail(id: number): void {
    this.selectedReceptionId.set(id);
    this.view.set('detail');
  }

  onCrumbClick(_index: number): void {
    this.showList();
  }

  // ── Modal: Rollback ───────────────────────────────────────────────────────────
  openRollbackModal(id: number): void  { this.rollbackModalId.set(id);   }
  closeRollbackModal(): void           { this.rollbackModalId.set(null);  }

  onRollbackConfirm(): void {
    const id = this.rollbackModalId();
    if (!id) return;
    this.submitting.set(true);
    this.receptionService.rollbackReception(id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeRollbackModal();
        this.loadReceptions();
        if (this.view() === 'detail') this.showList();
      },
      error: () => this.submitting.set(false),
    });
  }

  // ── Handler create ────────────────────────────────────────────────────────────
  onReceptionSaved(): void {
    this.showList();
    this.loadReceptions();
  }
}
