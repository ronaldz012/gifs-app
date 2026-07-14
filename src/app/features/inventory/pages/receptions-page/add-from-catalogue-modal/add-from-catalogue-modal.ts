import {
  Component, inject, output, signal, DestroyRef, OnInit,
} from '@angular/core';
import { debounceTime, distinctUntilChanged, finalize, of, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { applyEach, applyWhen, form, required } from '@angular/forms/signals';

import { ProductSearch } from '../../../components/product-search/product-search.component';
import { ProductSearchResult } from '../../../components/product-search/product-search-result.component';
import VariantNewRow from '../reception-form/variant-new-row/variant-new-row';
import VariantExistingRow from '../reception-form/variant-existing-row/variant-existing-row';

import { ProductService } from '@features/inventory/services/product-service';
import { Gender } from '@features/inventory/interfaces/gender';
import { CreateProductVariantDto } from '@features/inventory/dtos/products/create-product-variant-dto';
import {
  buildExistingVariant,
  buildNewVariant,
  existingVariantSchema,
  ItemForm,
  newVariantSchema,
  VariantForm,
} from '@features/inventory/models/variant-form.model';

@Component({
  selector: 'app-add-from-catalogue-modal',
  standalone: true,
  imports: [ProductSearch, VariantNewRow, VariantExistingRow],
  templateUrl: './add-from-catalogue-modal.html',
})
export default class AddFromCatalogueModal implements OnInit {

  private productService = inject(ProductService);
  private destroyRef     = inject(DestroyRef);
  private searchInput$   = new Subject<string>();

  protected readonly Gender = Gender;

  // ── Outputs ───────────────────────────────────────────────────────────
  close    = output<void>();
  confirm  = output<ItemForm>();
  notFound = output<string>();

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
      applyWhen(item, ({ valueOf }) => valueOf(item.mode) === 'ex', existingVariantSchema);
      applyWhen(item, ({ valueOf }) => valueOf(item.mode) === 'new', newVariantSchema);
    });
  });

  // ── Init ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
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
      variants: [],
      generalCost: null,
    });
  }

  availableVariantsForRow(index: number) {
    const product = this.selectedProduct();
    if (!product) return [];

    const usedIds = new Set(
      this.itemModel().variants
        .filter((v, i) => v.mode === 'ex' && v.id && i !== index)
        .map(v => v.id as GUID)
    );

    return product.productVariants.filter(v => !usedIds.has(v.id as GUID));
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
  addExistingVariant(): void {
    const generalCost = this.itemModel().generalCost;
    const variant = { ...buildExistingVariant(), unitCost: generalCost ?? null };
    this.itemModel.update(m => ({ ...m, variants: [...m.variants, variant] }));
  }

  addNewVariant(): void {
    const generalCost = this.itemModel().generalCost;
    const variant = { ...buildNewVariant(), unitCost: generalCost ?? null };
    this.itemModel.update(m => ({ ...m, variants: [...m.variants, variant] }));
  }

  removeVariant(index: number): void {
    this.itemModel.update(m => ({ ...m, variants: m.variants.filter((_, i) => i !== index) }));
  }

  replaceVariantForNew($event: string, index: number) {
    this.removeVariant(index);
    this.addNewVariant();
  }

  // ── Submit ────────────────────────────────────────────────────────────
  onConfirm(): void {
    this.itemForm().markAsTouched();

    const { variants } = this.itemModel();
    if (this.itemForm().invalid() || !variants.length) return;

    const newVariants = variants.filter(v => v.mode === 'new');
    const exVariants  = variants.filter(v => v.mode === 'ex');

    const creates$ = newVariants.length
      ? this.productService.createVariants(
          this.itemModel().product.id!,
          newVariants.map(v => ({
            size:        v.size,
            colorId:     v.colorId,
            price:       v.price,
          } as CreateProductVariantDto))
        )
      : of([]);

    this.isConfirming.set(true);
    this.error.set(null);

    creates$.subscribe({
      next: createdVariants => {
        const newAsEx: VariantForm[] = createdVariants.map((cv, i) => ({
          ...newVariants[i],
          mode: 'ex' as const,
          id:   cv.productVariantId,
          sku:  cv.sku,
          size: cv.size,
        }));

        const finalItem: ItemForm = {
          ...this.itemModel(),
          variants: [...exVariants, ...newAsEx],
        };

        this.isConfirming.set(false);
        this.confirm.emit(finalItem);
        this.close.emit();
      },
      error: err => {
        this.isConfirming.set(false);
        this.error.set('Error al crear variantes. Intentá de nuevo.');
        console.error(err);
      },
    });
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
  onClose(): void                { this.close.emit(); }
  onNotFound(query: string): void { this.notFound.emit(query); }
}
