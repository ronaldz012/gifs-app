import { DecimalPipe } from "@angular/common";
import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { Router } from "@angular/router";
import { ReceptionItem } from "./reception-item/reception-item";
import AddFromCatalogueModal from "../add-from-catalogue-modal/add-from-catalogue-modal";
import EditCatalogueItemModal from "../edit-catalogue-item-modal/edit-catalogue-item-modal";
import { NewProductModal } from "../new-product-modal/new-product-modal";
import CreateReceptionDto from "@features/inventory/dtos/receptions/create-reception-dto";
import { ReceptionService } from "@features/inventory/services/reception-service";
import { ColorService } from "@features/inventory/services/color-service";
import { BrandService } from "@features/inventory/services/brand-service";
import { CategoryService } from "@features/inventory/services/category-service";
import { ItemForm, Reception, VariantForm } from "@features/inventory/models/variant-form.model";

@Component({
  selector: 'app-reception-form',
  imports: [ReceptionItem, DecimalPipe, AddFromCatalogueModal, EditCatalogueItemModal, NewProductModal],
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
  private router      = inject(Router);

  isSubmitting          = signal(false);
  submitError           = signal<string | null>(null);
  showAddCatalogueModal = signal(false);
  showEditModal         = signal(false);
  editingItem           = signal<{ index: number; item: ItemForm } | null>(null);

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
    this.showAddCatalogueModal.set(false);
  }

  updateItem(itemToUpdate: { index: number; item: ItemForm }): void {
    this.reception.update(r => {
      const items = [...r.items];
      items[itemToUpdate.index] = itemToUpdate.item;
      return { ...r, items };
    });
    this.showEditModal.set(false);
    this.editingItem.set(null);
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

  editGroup(index: number) {
    const edit = this.reception().items[index];
    this.editingItem.set({ index, item: edit });
    this.showEditModal.set(true);
  }

  showNewProductModal = signal(false);

  onNotFound(): void {
    this.showAddCatalogueModal.set(false);
    this.showNewProductModal.set(true);
  }
}
