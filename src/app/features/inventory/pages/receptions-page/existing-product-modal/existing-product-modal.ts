import {
  Component, inject, output, signal, computed, DestroyRef, OnInit
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { debounceTime, distinctUntilChanged, finalize, of, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { applyEach, applyWhen, form, required } from '@angular/forms/signals';

import { ProductSearch } from '../../../components/product-search/product-search';
import { ProductSearchResult } from '../../../components/product-search/product-search-result';
import VariantNewRow from '../reception-form/variant-new-row/variant-new-row';
import VariantExistingRow from '../reception-form/variant-existing-row/variant-existing-row';

import { ProductService } from '@features/inventory/services/product-service';
import { ReceptionGroup } from '@features/inventory/models/reception-model';
import { ItemForm } from '@features/inventory/models/item-form.model';
import { Gender } from '@features/inventory/interfaces/gender';
import { CreateProductVariantDto } from '@features/inventory/dtos/products/create-product-variant-dto';
import { mapProductSearchToGroup } from '../reception-form/common/mapper';
import {
  buildExistingVariant,
  buildNewVariant,
  existingVariantSchema,
  newVariantSchema,
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

  // ── Outputs ───────────────────────────────────────────────────────────
  close    = output<void>();
  confirm  = output<ReceptionGroup>();
  notFound = output<string>();

  // ── Búsqueda ──────────────────────────────────────────────────────────
  searchResults = signal<ProductSearchResult[]>([]);
  isSearching   = signal(false);

  // ── Form ──────────────────────────────────────────────────────────────
  itemModel = signal<ItemForm>({
    product: {
      Id: null,
      productName: '',
      categoryName: '',
      brandName: '',
      genderName: '',
      description: '',
    },
    variants: [],
  });

  itemForm = form(this.itemModel, s => {
    required(s.product.Id, { message: 'Requerido' });
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

  // ── Estado UI ─────────────────────────────────────────────────────────
  isConfirming = signal(false);
  error        = signal<string | null>(null);

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
  selectedProduct = signal<ProductSearchResult | null>(null);
  onProductSelected(product: ProductSearchResult | null): void {
    if (!product) {
      this.clearProduct();
      return;
    }
    this.selectedProduct.set(product);
    this.itemModel.set({
      product: {
        Id:           product.id,
        productName:  product.name,
        categoryName: product.categoryName,
        brandName:    product.brandName,
        genderName:   Gender[product.gender],
        description:  product.description,
      },
      variants: [],
    });
  }
    availableVariantsForRow(index: number) {
    const product = this.selectedProduct();
    if (!product) return [];

    const usedIds = new Set(
      this.itemModel().variants
        .filter((v, i) => v.mode === 'ex' && v.id && i !== index) // excluye la fila actual
        .map(v => v.id as GUID)
    );

    return product.productVariants.filter(v => !usedIds.has(v.id as GUID));
  }

  private clearProduct(): void {
    this.itemModel.set({
      product: { Id: null, productName: '', categoryName: '', brandName: '', genderName: '', description: '' },
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
          this.itemModel().product.Id!,
          newVariants.map(v => ({
            description: v.description,
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
        const group = mapProductSearchToGroup(this.itemModel(), exVariants, newVariants, createdVariants);
        this.isConfirming.set(false);
        this.confirm.emit(group);
      },
      error: err => {
        this.isConfirming.set(false);
        this.error.set('Error al crear variantes. Intentá de nuevo.');
        console.error(err);
      },
    });
  }

  // ── Navegación ────────────────────────────────────────────────────────
  onClose(): void    { this.close.emit(); }
  onNotFound(query: string): void { this.notFound.emit(query); }


createNewProduct($event: string) {
throw new Error('Method not implemented.');
}
}