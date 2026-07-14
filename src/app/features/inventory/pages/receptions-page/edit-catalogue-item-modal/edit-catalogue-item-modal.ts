import {
  Component, inject, input, output, signal, DestroyRef, OnInit,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { debounceTime, distinctUntilChanged, finalize, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { applyEach, applyWhen, form, required } from '@angular/forms/signals';

import { ProductSearch } from '../../../components/product-search/product-search.component';
import { ProductSearchResult } from '../../../components/product-search/product-search-result.component';

import { ProductService } from '@features/inventory/services/product-service';
import { Gender } from '@features/inventory/interfaces/gender';
import {
  existingVariantSchema,
  ItemForm,
} from '@features/inventory/models/variant-form.model';

@Component({
  selector: 'app-edit-catalogue-item-modal',
  standalone: true,
  imports: [ProductSearch, DecimalPipe],
  templateUrl: './edit-catalogue-item-modal.html',
})
export default class EditCatalogueItemModal implements OnInit {

  private productService = inject(ProductService);
  private destroyRef     = inject(DestroyRef);
  private searchInput$   = new Subject<string>();

  protected readonly Gender = Gender;

  // ── Inputs ────────────────────────────────────────────────────────────
  item   = input.required<ItemForm>();
  index  = input.required<number>();

  // ── Outputs ───────────────────────────────────────────────────────────
  close  = output<void>();
  update = output<{ index: number; item: ItemForm }>();

  // ── Estado UI ─────────────────────────────────────────────────────────
  isConfirming  = signal(false);
  error         = signal<string | null>(null);
  isSearching   = signal(false);
  searchResults = signal<ProductSearchResult[]>([]);
  selectedProduct = signal<ProductSearchResult | null>(null);

  // ── Form ──────────────────────────────────────────────────────────────
  itemModel = signal<ItemForm>({
    product: {
      id:           null,
      internalCode: '',
      productName:  '',
      categoryName: '',
      brandName:    '',
      genderName:   '',
      description:  '',
    },
    variants: [],
  });

  itemForm = form(this.itemModel, s => {
    required(s.product.id, { message: 'Requerido' });
    applyEach(s.variants, item => {
      applyWhen(item, ({ valueOf }) => valueOf(item.selected) === true, existingVariantSchema);
    });
  });

  // ── Init ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.initFromEdit();
    this.searchInput$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(q => {
        if (!q || q.length < 2) {
          this.searchResults.set([]);
          this.isSearching.set(false);
          return [];
        }
        this.isSearching.set(true);
        return this.productService.searchProduct(q).pipe(
          finalize(() => this.isSearching.set(false))
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(results => this.searchResults.set(results));
  }

  private initFromEdit(): void {
    const editItem = this.item();

    this.productService.getById(editItem.product.id!).subscribe(result => {
      if (!result) return;

      const existingMap = new Map(
        editItem.variants.filter(v => v.id).map(v => [v.id, v])
      );

      this.selectedProduct.set({
        id:           result.id,
        name:         result.name,
        internalCode: result.internalCode,
        description:  result.description,
        basePrice:    result.basePrice,
        brandName:    result.brandName,
        categoryName: result.categoryName,
        gender:       result.gender,
        productVariants: result.variants.map(v => ({
          id:          v.id,
          sku:         v.sku,
          size:        v.size,
          colorId:     v.colorId,
          colorName:   v.color,
          price:       v.price,
        })),
      });

      this.itemModel.set({
        product: {
          id:           result.id,
          productName:  result.name,
          internalCode: result.internalCode,
          categoryName: result.categoryName,
          brandName:    result.brandName,
          genderName:   Gender[result.gender],
          description:  result.description,
        },
        variants: result.variants.map(v => {
          const existing = existingMap.get(v.id);
          return {
            mode:             'ex' as const,
            id:               v.id,
            size:             v.size,
            colorId:          v.colorId,
            colorCode:        '',
            colorName:        v.color,
            price:            v.price,
            quantityReceived: existing?.quantityReceived ?? null,
            unitCost:         existing?.unitCost ?? null,
            sku:              v.sku,
            selected:         !!existing,
          };
        }),
        generalCost: editItem.generalCost ?? null,
      });
    });
  }

  // ── Búsqueda ──────────────────────────────────────────────────────────
  onSearchChanged(query: string): void {
    this.searchInput$.next(query);
  }

  // ── Producto ──────────────────────────────────────────────────────────
  onProductSelected(product: ProductSearchResult | null): void {
    if (!product) {
      this.clearProduct();
      return;
    }

    this.selectedProduct.set(product);

    this.itemModel.set({
      product: {
        id:           product.id,
        productName:  product.name,
        internalCode: product.internalCode,
        categoryName: product.categoryName,
        brandName:    product.brandName,
        genderName:   Gender[product.gender],
        description:  product.description,
      },
      variants: product.productVariants.map(v => ({
        mode:             'ex' as const,
        id:               v.id,
        size:             v.size,
        colorId:          v.colorId,
        colorCode:        '',
        colorName:        v.colorName,
        price:            v.price,
        quantityReceived: null,
        unitCost:         null,
        sku:              v.sku,
        selected:         false,
      })),
      generalCost: null,
    });
  }

  private clearProduct(): void {
    this.selectedProduct.set(null);
    this.itemModel.set({
      product: { id: null, internalCode: '', productName: '', categoryName: '', brandName: '', genderName: '', description: '' },
      variants: [],
      generalCost: null,
    });
  }

  // ── Variantes ─────────────────────────────────────────────────────────
  toggleVariant(index: number): void {
    this.itemModel.update(m => {
      const variants = m.variants.map((v, i) =>
        i === index ? { ...v, selected: !v.selected } : v
      );
      return { ...m, variants };
    });
  }

  updateVariantField(index: number, field: 'quantityReceived' | 'unitCost', event: Event): void {
    const value = parseFloat((event.target as HTMLInputElement).value);
    const cleanValue = isNaN(value) ? null : value;

    this.itemModel.update(m => {
      const variants = m.variants.map((v, i) =>
        i === index ? { ...v, [field]: cleanValue } : v
      );
      return { ...m, variants };
    });
  }

  // ── Submit ────────────────────────────────────────────────────────────
  onConfirm(): void {
    this.itemForm().markAsTouched();

    const selectedVariants = this.itemModel().variants.filter(v => v.selected);
    if (!selectedVariants.length) {
      this.error.set('Seleccioná al menos una variante.');
      return;
    }

    if (this.itemForm().invalid()) return;

    const finalItem: ItemForm = {
      ...this.itemModel(),
      variants: selectedVariants,
    };

    this.update.emit({ index: this.index(), item: finalItem });
    this.close.emit();
  }

  applyMassiveCost(value: string): void {
    const cost = parseFloat(value);
    const cleanCost = isNaN(cost) ? null : cost;

    this.itemModel.update(current => ({
      ...current,
      generalCost: cleanCost,
      variants: current.variants.map(variant => ({
        ...variant,
        unitCost: cleanCost,
      })),
    }));
  }

  // ── Navegación ────────────────────────────────────────────────────────
  onClose(): void { this.close.emit(); }
}