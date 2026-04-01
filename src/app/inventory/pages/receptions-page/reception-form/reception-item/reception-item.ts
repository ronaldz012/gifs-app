import { Component, inject, input, OnInit, output, signal, computed, DestroyRef } from '@angular/core';
import { VariantFormGroup } from '../common/variant-form-group';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ProductSearchResult, ProductVariantOption } from '../../../../models/products/product-search-result';
import { ProductService } from '../../../../services/product-service';
import { debounceTime, distinctUntilChanged, startWith, Subject, switchMap } from 'rxjs';
import { ItemFormGroup } from '../common/item-form-group';
import ReceptionVariant from './reception-variant/reception-variant';
import { Category } from '../../../../interfaces/Dtos/category-dto';
import { Brand } from '../../../../interfaces/Dtos/brand-dto';
import { CategoryService } from '../../../../services/category-service';
import { BrandService } from '../../../../services/brand-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-reception-item',
  standalone: true,
  imports: [
    ReceptionVariant,
    ReactiveFormsModule,
    DecimalPipe,
  ],
  templateUrl: './reception-item.html',
})
export default class ReceptionItem implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private brandService = inject(BrandService);
  private destroyRef = inject(DestroyRef);

  form = input.required<ItemFormGroup>();
  index = input<number>(0);
  remove = output<void>();

  isNewProduct = signal(false);
  productSearch = signal('');
  showDropdown = signal(false);
  isSearching = signal(false);
  searchResults = signal<ProductSearchResult[]>([]);
  availableVariants = signal<ProductVariantOption[]>([]);
  brands = signal<Brand[]>([]);
  categories = signal<Category[]>([]);

  // ── SOLUCIÓN AL ERROR NG8118 ──
  // Usamos una señal manual que actualizaremos en el ngOnInit
  // Esto evita acceder al input() en la raíz de la clase
  private variantsValue = signal<any[]>([]);

  // Accessor computado para el FormArray
  variantsArray = computed(() => this.form().controls.variants);

  // IDs usados (ahora depende de la señal manual)
  usedIds = computed(() => {
    return this.variantsValue()
      .map(v => v.productVariantId)
      .filter((id): id is number => id !== null && id !== undefined);
  });

  // Totales (ahora dependen de la señal manual)
  totalUnits = computed(() => {
    return this.variantsValue().reduce((acc, curr) => acc + (curr.quantityReceived ?? 0), 0);
  });

  itemTotalCost = computed(() => {
    return this.variantsValue().reduce((acc, curr) => {
      const qty = curr.quantityReceived ?? 0;
      const cost = curr.unitCost ?? 0;
      return acc + (qty * cost);
    }, 0);
  });

  private searchInput$ = new Subject<string>();

  ngOnInit(): void {
    this.brandService.GetAll().subscribe(x => this.brands.set(x));
    this.categoryService.getAll().subscribe(x => this.categories.set(x));

    // ── SINCRONIZACIÓN DE SEÑALES ──
    // 1. Seteamos el valor inicial (aquí el input ya es seguro de usar)
    this.variantsValue.set(this.variantsArray().value);

    // 2. Nos suscribimos a los cambios para mantener la señal actualizada
    this.variantsArray().valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => this.variantsValue.set(val));

    // Búsqueda con debounce
    this.searchInput$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((q) => {
          if (!q || q.length < 2) {
            this.searchResults.set([]);
            this.isSearching.set(false);
            return [];
          }
          this.isSearching.set(true);
          return this.productService.searchProduct(q);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (results) => {
          this.searchResults.set(results);
          this.isSearching.set(false);
        },
        error: () => {
          this.searchResults.set([]);
          this.isSearching.set(false);
        },
      });
  }

  get productIdCtrl(): FormControl<number | null> {
    return this.form().controls.productId;
  }

  get newProductGroup(): FormGroup {
    return this.form().controls.newProduct;
  }

  onSearchInput(value: string): void {
    this.productSearch.set(value);
    if (!value) this.clearProductSelection();
    this.searchInput$.next(value);
  }

  selectProduct(product: ProductSearchResult): void {
    this.productIdCtrl.setValue(product.id);
    this.productIdCtrl.markAsTouched();
    this.productSearch.set(product.name);
    this.availableVariants.set(product.productVariants ?? []);
    this.showDropdown.set(false);
  }

  clearProductSelection(): void {
    this.productIdCtrl.setValue(null);
    this.availableVariants.set([]);
  }

  openDropdown(): void { this.showDropdown.set(true); }
  closeDropdown(): void { setTimeout(() => this.showDropdown.set(false), 150); }

  switchToNewProduct(): void {
    this.isNewProduct.set(true);
    this.productIdCtrl.setValue(null);
    this.productIdCtrl.clearValidators();
    this.productIdCtrl.updateValueAndValidity();
    this.productSearch.set('');
    this.availableVariants.set([]);

    const np = this.newProductGroup;
    np.get('name')?.setValidators([Validators.required]);
    np.get('categoryId')?.setValidators([Validators.required]);
    np.get('brandId')?.setValidators([Validators.required]);
    np.get('basePrice')?.setValidators([Validators.required]);
    np.updateValueAndValidity();

    this.clearVariants();
    this.addVariant();
  }

  switchToExistingProduct(): void {
    this.isNewProduct.set(false);
    this.newProductGroup.reset();
    this.productIdCtrl.setValidators([Validators.required]);
    this.productIdCtrl.updateValueAndValidity();
    this.clearVariants();
    this.addVariant();
  }

  addVariant(): void {
    this.variantsArray().push(this.buildVariantGroup());
  }

  removeVariant(i: number): void {
    if (this.variantsArray().length === 1) return;
    this.variantsArray().removeAt(i);
  }

  private clearVariants(): void {
    while (this.variantsArray().length > 0) {
      this.variantsArray().removeAt(0);
    }
  }

  private buildVariantGroup(): VariantFormGroup {
    return this.fb.group({
      productVariantId: [null as number | null],
      newVariant: this.fb.group({
        description: ['', { nonNullable: true }],
        size: ['', { nonNullable: true }],
        color: ['', { nonNullable: true }],
        price: [null as number | null],
      }),
      quantityReceived: [null as number | null, [Validators.required, Validators.min(1)]],
      unitCost: [null as number | null, [Validators.required, Validators.min(0.01)]],
    }) as unknown as VariantFormGroup;
  }

  onRemove(): void { this.remove.emit(); }

  hasError(ctrl: AbstractControl | null, error: string = 'required'): boolean {
    return !!(ctrl?.hasError(error) && ctrl.touched);
  }
}
