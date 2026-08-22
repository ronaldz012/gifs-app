import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { closeModal, getModalId, openModal } from '@shared/utils/modal-query';

@Component({
  selector: 'app-reception-form',
  imports: [
    ReceptionItem,
    CurrencyPipe,
    CatalogueItemModal,
    CreateProductModal,
    ProviderSelectCtrl,
  ],
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
  private route = inject(ActivatedRoute);
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

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const modal = params.get('modal');
      this.showAddCatalogueModal.set(modal === 'catalogue');
      this.showCreateProductModal.set(modal === 'product');

      const editId = getModalId(modal, 'edit');
      if (editId) {
        const idx = parseInt(editId, 10);
        const item = this.reception().items[idx] ?? null;
        this.editingItem.set(item ? { index: idx, item } : null);
        this.showEditModal.set(!!item);
      } else {
        this.editingItem.set(null);
        this.showEditModal.set(false);
      }
    });
  }

  closeModal(): void {
    closeModal(this.router, this.route);
  }

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
    this.pendingProduct.set(null);
    this.closeModal();
  }

  updateItem(itemToUpdate: { index: number | null; item: ItemForm }): void {
    this.reception.update((r) => {
      const items = [...r.items];
      items[itemToUpdate.index!] = itemToUpdate.item;
      return { ...r, items };
    });
    this.pendingCreated.set(null);
    this.closeModal();
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
    this.pendingCreated.set(null);
    openModal(this.router, this.route, `edit:${index}`);
  }

  onNotFound(query: string): void {
    this.creatingFromEdit.set(this.showEditModal());
    this.pendingName.set(query);
    openModal(this.router, this.route, 'product');
  }

  onProductCreated(product: ProductSearchResult): void {
    this.pendingProduct.set(product);
    if (this.creatingFromEdit()) {
      this.creatingFromEdit.set(false);
      this.pendingCreated.set(product);
      openModal(this.router, this.route, 'edit:' + this.editingItem()!.index);
    } else {
      openModal(this.router, this.route, 'catalogue');
    }
  }

  onCreateProductCancelled(): void {
    if (this.creatingFromEdit()) {
      this.creatingFromEdit.set(false);
      openModal(this.router, this.route, 'edit:' + this.editingItem()!.index);
    } else {
      openModal(this.router, this.route, 'catalogue');
    }
  }

  openAddCatalogueModal(): void {
    this.pendingProduct.set(null);
    openModal(this.router, this.route, 'catalogue');
  }
}
