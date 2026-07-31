import { Component, computed, inject, input, output, signal, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { applyEach, applyWhen, form, min, required, schema } from '@angular/forms/signals';

import { ProductSearch } from '../../../components/product-search/product-search.component';
import { ProductSearchResult } from '../../../components/product-search/product-search-result.component';

import { ProductService } from '@features/inventory/services/product-service';
import { Gender } from '@features/inventory/interfaces/gender';
import { existingVariantSchema, ItemForm } from '@features/inventory/models/variant-form.model';

interface CatalogueItemModel extends ItemForm {
  sameCostForAll: boolean;
  uniqueCost: number | null;
}

const uniqueCostSchema = schema<number | null>((c) => {
  required(c, { message: 'Requerido' });
  min(c, 0.5, { message: 'Mín Bs 0.50' });
});

@Component({
  selector: 'app-catalogue-item-modal',
  standalone: true,
  imports: [ProductSearch, DecimalPipe],
  templateUrl: './catalogue-item-modal.html',
})
export default class CatalogueItemModal implements OnInit {
  private productService = inject(ProductService);

  // ── Inputs ────────────────────────────────────────────────────────────
  mode = input<'add' | 'edit'>('add');
  initialProduct = input<ProductSearchResult | null>(null);
  item = input<ItemForm | null>(null);
  index = input<number | null>(null);
  existingProductIds = input<GUID[]>([]);

  // ── Outputs ───────────────────────────────────────────────────────────
  close = output<void>();
  confirm = output<{ index: number | null; item: ItemForm }>();
  notFound = output<string>();

  // ── Estado UI ─────────────────────────────────────────────────────────
  error = signal<string | null>(null);
  selectedProduct = signal<ProductSearchResult | null>(null);

  costLocked = computed(() => this.itemModel().sameCostForAll ?? false);

  selectedVariants = computed(() => this.itemModel().variants.filter((v) => v.selected));

  totalUnits = computed(() =>
    this.selectedVariants().reduce((sum, v) => sum + (v.quantityReceived ?? 0), 0),
  );

  totalInvestment = computed(() =>
    this.selectedVariants().reduce(
      (sum, v) => sum + (v.quantityReceived ?? 0) * (v.unitCost ?? 0),
      0,
    ),
  );

  totalSales = computed(() =>
    this.selectedVariants().reduce((sum, v) => sum + (v.quantityReceived ?? 0) * (v.price ?? 0), 0),
  );

  expectedProfit = computed(() => this.totalSales() - this.totalInvestment());

  hasSummary = computed(() => this.selectedVariants().length > 0 && this.totalUnits() > 0);

  // ── Form ──────────────────────────────────────────────────────────────
  itemModel = signal<CatalogueItemModel>({
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
    applyWhen(s.uniqueCost, ({ valueOf }) => valueOf(s.sameCostForAll) === true, uniqueCostSchema);
    applyEach(s.variants, (item) => {
      applyWhen(item, ({ valueOf }) => valueOf(item.selected) === true, existingVariantSchema);
    });
  });

  // ── Init ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    if (this.mode() === 'edit') {
      const created = this.initialProduct();
      if (created) this.loadProduct(created);
      else if (this.item()) this.initFromEdit(this.item()!);
    } else {
      const initial = this.initialProduct();
      if (initial) this.loadProduct(initial);
    }
  }

  private initFromEdit(editItem: ItemForm): void {
    this.productService.getById(editItem.product.id!).subscribe((result) => {
      if (!result) return;

      const existingMap = new Map(editItem.variants.filter((v) => v.id).map((v) => [v.id, v]));

      this.selectedProduct.set({
        id: result.id,
        name: result.name,
        internalCode: result.internalCode,
        description: result.description,
        basePrice: result.basePrice,
        brandName: result.brandName,
        categoryName: result.categoryName,
        gender: result.gender,
        productVariants: result.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          size: v.size,
          colorId: v.colorId,
          colorName: v.color,
          price: v.price,
        })),
      });

      this.itemModel.set({
        product: {
          id: result.id,
          productName: result.name,
          internalCode: result.internalCode,
          categoryName: result.categoryName,
          brandName: result.brandName,
          genderName: Gender[result.gender],
          description: result.description,
        },
        variants: result.variants.map((v) => {
          const existing = existingMap.get(v.id);
          return {
            mode: 'ex' as const,
            id: v.id,
            size: v.size,
            colorId: v.colorId,
            colorCode: '',
            colorName: v.color,
            price: v.price,
            quantityReceived: existing?.quantityReceived ?? null,
            unitCost: existing?.unitCost ?? null,
            sku: v.sku,
            selected: !!existing,
          };
        }),
        generalCost: editItem.generalCost ?? null,
        sameCostForAll: editItem.sameCostForAll ?? false,
        uniqueCost: editItem.uniqueCost ?? null,
      });
    });
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
      sameCostForAll: this.mode() === 'add',
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

    if (this.mode() === 'add') {
      const productId = this.itemModel().product.id;
      if (productId && this.existingProductIds().includes(productId)) {
        this.error.set('Este producto ya fue agregado a la recepción.');
        return;
      }
    }

    if (this.itemForm().invalid()) return;

    const finalItem: ItemForm = {
      ...this.itemModel(),
      variants: selectedVariants,
    };

    this.confirm.emit({ index: this.mode() === 'edit' ? this.index() : null, item: finalItem });
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
