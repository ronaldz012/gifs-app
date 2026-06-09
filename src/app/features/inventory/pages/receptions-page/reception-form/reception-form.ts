import { DecimalPipe } from "@angular/common";
import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { Router } from "@angular/router";
import { ReceptionItem } from "./reception-item/reception-item";
import { ExistingProductModal } from "../existing-product-modal/existing-product-modal";
import { NewProductModal } from "../new-product-modal/new-product-modal";
import CreateReceptionDto from "@features/inventory/dtos/Receptions/create-reception-dto";
import { ReceptionService } from "@features/inventory/services/reception-service";
import { ColorService } from "@features/inventory/services/color-service";
import { BrandService } from "@features/inventory/services/brand-service";
import { CategoryService } from "@features/inventory/services/category-service";
import { ItemForm, Reception, VariantForm } from "@features/inventory/models/variant-form.model";

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

  itemToEdit = signal<{index:number; item:ItemForm} | null>(null);

  isSubmitting          = signal(false);
  submitError           = signal<string | null>(null);
  showCatalogueModal    = signal(false);

  reception = signal<Reception>({ notes: '', items: [] });


totalCost = computed(() =>
  this.reception().items
    .flatMap((g: ItemForm) => g.variants)
    .reduce((sum: number, v: VariantForm) => sum + (v.quantityReceived ?? 0) * (v.unitCost ?? 0), 0)
);
  updateNotes(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.reception.update(r => ({ ...r, notes: target.value }));
  }

  addGroup(group: ItemForm): void {
    console.log("VARIANTE RECIBIADA: ", group);
    this.reception.update(r => ({ ...r, items: [...r.items, group] }));
    this.showCatalogueModal.set(false);
  }

  updateItem(itemToUpdate: { index: number; item: ItemForm }): void {
    this.reception.update(r => {
      const items = [...r.items];
      items[itemToUpdate.index] = itemToUpdate.item;
      return { ...r, items };
    });
    this.itemToEdit.set(null);
  
  }

removeGroup(productId: GUID): void {
  this.reception.update(r => ({
    ...r,
    items: r.items.filter((g: ItemForm) => g.product.id !== productId)
  }));
}


  onSubmit(): void {
    if (!this.reception().items.length) return;

    const payload: CreateReceptionDto = {
      notes: this.reception().notes,
      items: this.reception().items.flatMap(g =>
        g.variants.map(v => ({
          productVariantId: v.id!,
          quantityReceived: v.quantityReceived!,
          unitCost:         v.unitCost!,
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
  editGroup(_t13: number) {
    const edit = this.reception().items[_t13];
    this.itemToEdit.set({index: _t13, item: edit});
    this.showCatalogueModal.set(true);
  }


  showNewProductModal = signal(false);

  onNotFound(): void {
    this.showCatalogueModal.set(false);
    this.showNewProductModal.set(true);
  }
}