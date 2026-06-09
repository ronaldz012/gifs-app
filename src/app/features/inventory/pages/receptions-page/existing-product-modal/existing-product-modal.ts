import {
  Component, inject, output, signal, computed, DestroyRef, OnInit,
  input} from '@angular/core';
import { debounceTime, distinctUntilChanged, finalize, of, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { applyEach, applyWhen, form, required } from '@angular/forms/signals';

import { ProductSearch } from '../../../components/product-search/product-search';
import { ProductSearchResult } from '../../../components/product-search/product-search-result';
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
  selector: 'app-existing-product-modal',
  standalone: true,
  imports: [ProductSearch, VariantNewRow, VariantExistingRow],
  templateUrl: './existing-product-modal.html',
})
export class ExistingProductModal implements OnInit {

  private productService = inject(ProductService);
  private destroyRef     = inject(DestroyRef);
  private searchInput$   = new Subject<string>();

  protected readonly Gender = Gender;

  itemToEdit = input<{ index: number; item: ItemForm } | null>(null);

  // ── Outputs ───────────────────────────────────────────────────────────
  close    = output<void>();
  confirm  = output<ItemForm>();
  update   = output<{ index: number; item: ItemForm }>();
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

  usedVariantIds = computed<GUID[]>(() =>
    this.itemModel().variants
      .filter(v => v.mode === 'ex' && v.id)
      .map(v => v.id as GUID)
  );

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
    const edit = this.itemToEdit();
    if (edit === null) return;

    this.itemModel.set(edit.item);

    this.productService.getById(edit.item.product.id!).subscribe(result => {
      if (!result) return;
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

    const isEditing = this.itemToEdit() !== null;

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
      variants: isEditing ? this.itemModel().variants : [],
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
    });
  }

  // ── Variantes ─────────────────────────────────────────────────────────
  addExistingVariant(): void {
    this.itemModel.update(m => ({ ...m, variants: [...m.variants, buildExistingVariant()] }));
  }

  addNewVariant(): void {
    this.itemModel.update(m => ({ ...m, variants: [...m.variants, buildNewVariant()] }));
  }

  removeVariant(index: number): void {
    this.itemModel.update(m => ({ ...m, variants: m.variants.filter((_, i) => i !== index) }));
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

        if (this.itemToEdit() !== null) {
          this.update.emit({ index: this.itemToEdit()!.index, item: finalItem });
        } else {
          this.confirm.emit(finalItem);
        }

        this.close.emit();
      },
      error: err => {
        this.isConfirming.set(false);
        this.error.set('Error al crear variantes. Intentá de nuevo.');
        console.error(err);
      },
    });
  }

  // ── Navegación ────────────────────────────────────────────────────────
  onClose(): void               { this.close.emit(); }
  onNotFound(query: string): void { this.notFound.emit(query); }
}