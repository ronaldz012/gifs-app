import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { form, required } from '@angular/forms/signals';
import { ReceptionItem } from './reception-item/reception-item';
import CatalogueItemModal from '../catalogue-item-modal/catalogue-item-modal';
import CreateProductModal from '../../products-page/create-product-modal/create-product-modal';
import CreateReceptionDto from '@features/inventory/dtos/receptions/create-reception-dto';
import { ReceptionService } from '@features/inventory/services/reception-service';
import { ColorService } from '@features/inventory/services/color-service';
import { BrandService } from '@features/inventory/services/brand-service';
import { CategoryService } from '@features/inventory/services/category-service';
import { ProviderService } from '@features/inventory/services/provider-service';
import { ItemForm, Reception, VariantForm } from '@features/inventory/models/variant-form.model';
import { ProductSearchResult } from '@features/inventory/components/product-search/product-search-result.component';
import ProviderSelectCtrl from '@features/inventory/components/provider-select-ctrl/provider-select-ctrl';

@Component({
  selector: 'app-reception-form',
  imports: [ReceptionItem, CurrencyPipe, CatalogueItemModal, CreateProductModal, ProviderSelectCtrl],
  templateUrl: './reception-form.html',
})
export default class ReceptionForm implements OnInit {
  ngOnInit(): void {
    this.categoryService.load();
    this.colorService.load();
    this.brandService.load();
    this.providerService.load();
  }

  private receptionService = inject(ReceptionService);
  private categoryService = inject(CategoryService);
  private colorService = inject(ColorService);
  private brandService = inject(BrandService);
  private providerService = inject(ProviderService);
  private router = inject(Router);

  providerModel = signal<{ id: GUID | null; name: string }>({ id: null, name: '' });
  providerForm = form(this.providerModel, (s) => {
    required(s.id, { message: 'Seleccioná un proveedor' });
  });

  isSubmitting = signal(false);
  submitError = signal<string | null>(null);
  showAddCatalogueModal = signal(false);
  showEditModal = signal(false);
  editingItem = signal<{ index: number; item: ItemForm } | null>(null);
  showCreateProductModal = signal(false);
  pendingProduct = signal<ProductSearchResult | null>(null);
  pendingName = signal('');
  creatingFromEdit = signal(false);
  pendingCreated = signal<ProductSearchResult | null>(null);

  reception = signal<Reception>({ notes: '', items: [] });

  existingProductIds = computed(() =>
    this.reception()
      .items.map((i) => i.product.id)
      .filter((id): id is GUID => id !== null),
  );

  totalCost = computed(() =>
    this.reception()
      .items.flatMap((g: ItemForm) => g.variants)
      .reduce(
        (sum: number, v: VariantForm) => sum + (v.quantityReceived ?? 0) * (v.unitCost ?? 0),
        0,
      ),
  );

  updateNotes(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.reception.update((r) => ({ ...r, notes: target.value }));
  }

  addGroup(group: { index: number | null; item: ItemForm }): void {
    const alreadyExists = this.reception().items.some(
      (i) => i.product.id === group.item.product.id,
    );
    if (alreadyExists) {
      this.submitError.set('Este producto ya fue agregado a la recepción.');
      return;
    }
    this.reception.update((r) => ({ ...r, items: [...r.items, group.item] }));
    this.showAddCatalogueModal.set(false);
  }

  updateItem(itemToUpdate: { index: number | null; item: ItemForm }): void {
    this.reception.update((r) => {
      const items = [...r.items];
      items[itemToUpdate.index!] = itemToUpdate.item;
      return { ...r, items };
    });
    this.showEditModal.set(false);
    this.editingItem.set(null);
  }

  removeGroup(index: number): void {
    this.reception.update((r) => ({
      ...r,
      items: r.items.filter((_, i) => i !== index),
    }));
  }

  onSubmit(): void {
    if (!this.reception().items.length) return;

    this.providerForm().markAsTouched();
    if (this.providerForm().invalid()) {
      this.submitError.set('Seleccioná un proveedor antes de guardar.');
      return;
    }

    const payload: CreateReceptionDto = {
      notes: this.reception().notes,
      providerId: this.providerModel().id!,
      items: this.reception().items.flatMap((g) =>
        g.variants.map((v) => ({
          productVariantId: v.id!,
          quantityReceived: v.quantityReceived!,
          unitCost: v.unitCost!,
        })),
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
    this.pendingCreated.set(null);
    this.editingItem.set({ index, item: edit });
    this.showEditModal.set(true);
  }

  onNotFound(query: string): void {
    this.creatingFromEdit.set(this.showEditModal());
    this.showEditModal.set(false);
    this.showAddCatalogueModal.set(false);
    this.pendingName.set(query);
    this.showCreateProductModal.set(true);
  }

  onProductCreated(product: ProductSearchResult): void {
    this.showCreateProductModal.set(false);
    this.pendingProduct.set(product);
    if (this.creatingFromEdit()) {
      this.creatingFromEdit.set(false);
      this.pendingCreated.set(product);
      this.showEditModal.set(true);
    } else {
      this.showAddCatalogueModal.set(true);
    }
  }

  onCreateProductCancelled(): void {
    this.showCreateProductModal.set(false);
    if (this.creatingFromEdit()) {
      this.creatingFromEdit.set(false);
      this.showEditModal.set(true);
    } else {
      this.showAddCatalogueModal.set(true);
    }
  }

  openAddCatalogueModal(): void {
    this.pendingProduct.set(null);
    this.showAddCatalogueModal.set(true);
  }
}
