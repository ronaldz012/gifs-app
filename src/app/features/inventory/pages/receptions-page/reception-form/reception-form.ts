import { DecimalPipe } from "@angular/common";
import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { Router } from "@angular/router";

import { ReceptionItem } from "./reception-item/reception-item";
import { ExistingProductModal } from "../existing-product-modal/existing-product-modal";
import { NewProductModal } from "../new-product-modal/new-product-modal";
import CreateReceptionDto from "@features/inventory/dtos/Receptions/create-reception-dto";
import { Reception, ReceptionGroup } from "@features/inventory/models/reception-model";
import { ReceptionService } from "@features/inventory/services/reception-service";
import { ColorService } from "@features/inventory/services/color-service";
import { BrandService } from "@features/inventory/services/brand-service";
import { CategoryService } from "@features/inventory/services/category-service";

@Component({
  selector: 'app-reception-form',
  imports: [ReceptionItem, DecimalPipe, ExistingProductModal, NewProductModal],
  templateUrl: './reception-form.html',
})
export default class ReceptionForm implements OnInit {
  ngOnInit(): void {
    this.categoryService.load();
    this.colorService.load();
    this.brandService.load();
  }

  private receptionService = inject(ReceptionService);
  private categoryService = inject(CategoryService);
  private colorService = inject(ColorService)
  private brandService = inject(BrandService)
  private router           = inject(Router);

  isSubmitting          = signal(false);
  submitError           = signal<string | null>(null);
  showCatalogueModal    = signal(false);

  reception = signal<Reception>({ notes: '', items: [] });

  totalCost = computed(() =>
    this.reception().items
      .flatMap(g => g.variants)
      .reduce((sum, v) => sum + v.quantityReceived * v.unitCost, 0)
  );

  updateNotes(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.reception.update(r => ({ ...r, notes: target.value }));
  }

  addGroup(group: ReceptionGroup): void {
    this.reception.update(r => ({ ...r, items: [...r.items, group] }));
    this.showCatalogueModal.set(false);
  }

  removeGroup(productId: GUID): void {
    this.reception.update(r => ({
      ...r,
      items: r.items.filter(g => g.productId !== productId)
    }));
  }

  onSubmit(): void {
    if (!this.reception().items.length) return;

    const payload: CreateReceptionDto = {
      notes: this.reception().notes,
      items: this.reception().items.flatMap(g =>
        g.variants.map(v => ({
          productVariantId: v.productVariantId,
          quantityReceived: v.quantityReceived,
          unitCost:         v.unitCost,
        }))
      ),
    };

    this.isSubmitting.set(true);
    this.submitError.set(null);

    this.receptionService.create(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['inventory', 'receptions']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.submitError.set('Error al guardar la recepción. Intentá de nuevo.');
        console.error(err);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['inventory', 'receptions']);
  }


  showNewProductModal = signal(false);

  onNotFound(): void {
    this.showCatalogueModal.set(false);
    this.showNewProductModal.set(true);
  }
}