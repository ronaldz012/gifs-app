import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListStockMovementDto, StockMovementParams } from '@features/inventory/dtos/products/list-stock-movements-dto';
import { MovementType, movementTypeToSpanish } from '@features/inventory/interfaces/movement-type';
import { ProductService } from '@features/inventory/services/product-service';
import SkeletonList from "../../../../../shared/ui/skeleton-list/skeleton-list";
import { Paginator } from "@shared/components/app-paginator/app-paginator";
import { NgClass } from '@angular/common';
import { SmartDatePipe } from '@shared/pipes/smart-date.pipe';

@Component({
  selector: 'app-stock-movements-list',
  imports: [SkeletonList, Paginator, NgClass, SmartDatePipe],
  templateUrl: './stock-movements-list.html',
  styles: [`
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .row-enter { animation: slide-up 220ms ease both; }
  `],
})
export default class StockMovementsList {


  private router = inject(Router);
  private service = inject(ProductService);
  private route = inject(ActivatedRoute); // <-- Inyectamos la ruta activa

  protected readonly movementTypeToSpanish = movementTypeToSpanish;

  movements = signal<ListStockMovementDto[]>([]);
  totalItems = signal(0);
  loading = signal(false);
variantId = signal<string>('');
  query = signal<StockMovementParams>({
    page: 1,
    pageSize: 20,
  });

  ngOnInit() {
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    if (idFromRoute) {
      this.variantId.set(idFromRoute);
      this.load();
    } else {
      this.router.navigate(['inventory', 'products']);
    }
    this.load();
  }

  patchQuery(patch: Partial<{ page: number; pageSize: number }>) {
    this.query.update(q => ({ ...q, ...patch }));
    this.load();
  }
  load() {
    this.loading.set(true);
    
    this.service.getVariantMovementsById(this.variantId(),this.query()).subscribe({
      next: data => {
        this.movements.set(data.items);
        this.totalItems.set(data.totalCount);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    
  }
  goToReference(type: MovementType, referenceId: GUID) {
    if (!referenceId) return;

    switch (type) {
      case MovementType.Reception:
        this.router.navigate(['inventory', 'receptions', referenceId, 'detail']);
        break;
      case MovementType.Sale:
        this.router.navigate(['sales', referenceId, 'detail']);
        break;
      case MovementType.Adjustment:
        this.router.navigate(['inventory', 'adjustments', referenceId, 'detail']);
        break;
      case MovementType.TransferIn:
      case MovementType.TransferOut:
        this.router.navigate(['inventory', 'transfers', referenceId, 'detail']);
        break;
    }
  }
  getMovementColorClass(type: MovementType, element: 'badge' | 'text' | 'border'): string {
    const maps = {
      badge: {
        [MovementType.Reception]: 'bg-feedback-success/15 text-feedback-success-text border border-feedback-success/30',
        [MovementType.Sale]: 'bg-feedback-info/15 text-feedback-info-text border border-feedback-info/30',
        [MovementType.Adjustment]: 'bg-feedback-warning/15 text-feedback-warning-text border border-feedback-warning/30',
        [MovementType.TransferOut]: 'bg-bg-muted text-text-soft border border-border',
        [MovementType.TransferIn]: 'bg-accent-ui/10 text-accent-ui border border-accent-ui/20',
      },
      text: {
        [MovementType.Reception]: 'text-feedback-success-text',
        [MovementType.Sale]: 'text-feedback-error-text', // Rojo al ser egreso
        [MovementType.Adjustment]: 'text-feedback-warning-text',
        [MovementType.TransferOut]: 'text-feedback-error-text', // Rojo al ser egreso
        [MovementType.TransferIn]: 'text-feedback-success-text',
      },
      border: {
        [MovementType.Reception]: 'bg-feedback-success-text',
        [MovementType.Sale]: 'bg-feedback-info-text',
        [MovementType.Adjustment]: 'bg-feedback-warning-text',
        [MovementType.TransferOut]: 'bg-text-soft',
        [MovementType.TransferIn]: 'bg-accent-ui',
      }
    };
    return maps[element][type] || '';
  }

}
