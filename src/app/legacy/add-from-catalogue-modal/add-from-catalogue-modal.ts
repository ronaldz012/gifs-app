import { Component, input, output, signal, OnInit, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { applyEach, applyWhen, form, required } from '@angular/forms/signals';

import { ProductSearch } from '@features/inventory/components/product-search/product-search.component';
import { ProductSearchResult } from '@features/inventory/components/product-search/product-search-result.component';

import { Gender } from '@features/inventory/interfaces/gender';
import { existingVariantSchema, ItemForm } from '@features/inventory/models/variant-form.model';

@Component({
  selector: 'app-add-from-catalogue-modal',
  standalone: true,
  imports: [ProductSearch, DecimalPipe],
  templateUrl: './add-from-catalogue-modal.html',
})
export default class AddFromCatalogueModal implements OnInit {
  // ── Outputs ───────────────────────────────────────────────────────────
  close = output<void>();
  confirm = output<ItemForm>();
  notFound = output<string>();

  // ── Inputs ────────────────────────────────────────────────────────────
  initialProduct = input<ProductSearchResult | null>(null);

  // ── Estado UI ─────────────────────────────────────────────────────────
  error = signal<string | null>(null);
  selectedProduct = signal<ProductSearchResult | null>(null);

  costLocked = computed(() => this.itemModel().sameCostForAll ?? true);

  // ── Form ──────────────────────────────────────────────────────────────
  itemModel = signal<ItemForm>({
    product: {
      id: null,
      internalCode: '',
      productName: '',
      categoryName: '',
      brandName: '',
      genderName: '',
      description: '',
    },
    variants: [],
    sameCostForAll: true,
    uniqueCost: null,
  });

  itemForm = form(this.itemModel, (s) => {
    required(s.product.id, { message: 'Requerido' });
    applyEach(s.variants, (item) => {
      applyWhen(item, ({ valueOf }) => valueOf(item.selected) === true, existingVariantSchema);
    });
  });

  // ── Init ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    const initial = this.initialProduct();
    if (initial) this.loadProduct(initial);
  }

  // ── Producto ──────────────────────────────────────────────────────────
  onProductSelected(product: ProductSearchResult | null): void {
    if (!product) {
      this.clearProduct();
      return;
    }
    this.loadProduct(product);
  }

  private loadProduct(product: ProductSearchResult): void {
    this.selectedProduct.set(product);

    this.itemModel.set({
      product: {
        id: product.id,
        productName: product.name,
        internalCode: product.internalCode,
        categoryName: product.categoryName,
        brandName: product.brandName,
        genderName: Gender[product.gender],
        description: product.description,
      },
      variants: product.productVariants.map((v) => ({
        mode: 'ex' as const,
        id: v.id,
        size: v.size,
        colorId: v.colorId,
        colorCode: '',
        colorName: v.colorName,
        price: v.price,
        quantityReceived: null,
        unitCost: null,
        sku: v.sku,
        selected: false,
      })),
      generalCost: null,
      sameCostForAll: true,
      uniqueCost: null,
    });
  }

  private clearProduct(): void {
    this.selectedProduct.set(null);
    this.itemModel.set({
      product: {
        id: null,
        internalCode: '',
        productName: '',
        categoryName: '',
        brandName: '',
        genderName: '',
        description: '',
      },
      variants: [],
      generalCost: null,
      sameCostForAll: true,
      uniqueCost: null,
    });
  }

  // ── Variantes ─────────────────────────────────────────────────────────
  toggleVariant(index: number): void {
    this.itemModel.update((m) => {
      const variants = m.variants.map((v, i) =>
        i === index ? { ...v, selected: !v.selected } : v,
      );
      return { ...m, variants };
    });
  }

  updateVariantField(index: number, field: 'quantityReceived' | 'unitCost', event: Event): void {
    const value = parseFloat((event.target as HTMLInputElement).value);
    const cleanValue = isNaN(value) ? null : value;

    this.itemModel.update((m) => {
      const variants = m.variants.map((v, i) => (i === index ? { ...v, [field]: cleanValue } : v));
      return { ...m, variants };
    });
  }

  onToggleSameCost(enabled: boolean): void {
    this.itemModel.update((current) => {
      if (enabled) {
        return {
          ...current,
          sameCostForAll: true,
          variants: current.variants.map((v) => ({
            ...v,
            unitCost: current.uniqueCost ?? null,
          })),
        };
      }
      return { ...current, sameCostForAll: false };
    });
  }

  onUniqueCostChange(value: string): void {
    const parsed = parseFloat(value);
    const cost = isNaN(parsed) ? null : parsed;

    this.itemModel.update((current) => ({
      ...current,
      uniqueCost: cost,
      variants:
        (current.sameCostForAll ?? true)
          ? current.variants.map((v) => ({ ...v, unitCost: cost }))
          : current.variants,
    }));
  }

  // ── Submit ────────────────────────────────────────────────────────────
  onConfirm(): void {
    this.itemForm().markAsTouched();

    const selectedVariants = this.itemModel().variants.filter((v) => v.selected);
    if (!selectedVariants.length) {
      this.error.set('Seleccioná al menos una talla/color.');
      return;
    }

    if (this.itemForm().invalid()) return;

    const finalItem: ItemForm = {
      ...this.itemModel(),
      variants: selectedVariants,
    };

    this.confirm.emit(finalItem);
    this.close.emit();
  }

  // ── Navegación ────────────────────────────────────────────────────────
  onClose(): void {
    this.close.emit();
  }
  onNotFound(query: string): void {
    this.notFound.emit(query);
  }
}
