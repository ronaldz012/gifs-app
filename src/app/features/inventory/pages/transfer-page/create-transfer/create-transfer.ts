import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {ProductVariantSearch} from '../../../components/product-variant-search/product-variant-search.component';
import {CreateTransferItemList} from './create-transfer-item-list/create-transfer-item-list';
import {TransferService} from '../../../services/transfer-service';

import {TransferItem} from '../../../interfaces/transfer-item';
import {TransferForm} from '../../../dtos/transfers/transfer-form';
import {ProductVariantBySkuDto} from '../../../dtos/products/product-variant-by-sku-dto';
import { BranchContextService } from '@core/services/branch-context-service';
import { BranchDto } from '@core/interfaces/branch.model';
import { BranchSelectorDestination } from '@shared/components/branch-selector-destination/branch-selector-destination';


@Component({
  selector: 'app-create-transfer',
  imports: [ProductVariantSearch, CreateTransferItemList, FormsModule, BranchSelectorDestination],
  templateUrl: './create-transfer.html',
})
export default class CreateTransfer implements OnInit {
  private transferService = inject(TransferService);
  private branchService   = inject(BranchContextService);
  readonly router         = inject(Router);

  branches        = signal<BranchDto[]>([]);
  loadingBranches = signal(false);

  items = signal<TransferItem[]>([]);

  form = signal<TransferForm>({
    toBranchId: null,
    notes: '',
    items: [],
  });

  canSubmit = computed(() =>
    this.form().toBranchId !== null && this.items().length > 0
  );

  totalUnits = computed(() =>
    this.items().reduce((sum, i) => sum + i.quantity, 0)
  );

  ngOnInit(): void {
    this.loadBranches();
  }

  private loadBranches(): void {
    this.loadingBranches.set(true);
    this.branchService.getBranches().subscribe({
      next: branches => {
        const currentId = this.branchService.active()?.branchId ?? 0;
        this.branches.set(branches.filter(b => b.id !== currentId));
        this.loadingBranches.set(false);
      },
      error: () => this.loadingBranches.set(false),
    });
  }

  onBranchSelected(branch: BranchDto): void {
    this.form.update(f => ({ ...f, toBranchId: branch.id }));
  }

  patchNotes(notes: string): void {
    this.form.update(f => ({ ...f, notes }));
  }

  onProductFound(variant: ProductVariantBySkuDto): void {
    const existing = this.items().find(i => i.variantId === variant.id);

    if (existing) {
      if (existing.quantity >= variant.availableStockInBranch) return;
      this.items.update(items =>
        items.map(i =>
          i.variantId === variant.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      this.items.update(items => [
        ...items,
        {
          variantId:    variant.id,
          sku:          variant.sku,
          productName:  variant.productName,
          variantLabel: [variant.description, variant.size, variant.color]
            .filter(Boolean)
            .join(' · '),
          quantity:    1,
          maxQuantity: variant.availableStockInBranch,
        },
      ]);
    }
  }

  submit(): void {
    if (!this.canSubmit()) return;

    const payload: TransferForm = {
      ...this.form(),
      items: this.items().map(i => ({
        productVariantId:  i.variantId,
        quantityRequested: i.quantity,
      })),
    };

    this.transferService.createTransfer(payload).subscribe({
      next: ()  => this.router.navigate(['inventory','transfers']),
      error: err => console.error('Error al crear transferencia:', err),
    });
  }

  cancel(): void {
    this.router.navigate(['inventory','transfers']);
  }
}
