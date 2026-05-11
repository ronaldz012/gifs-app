import {
  Component,
  computed,
  inject,
  Injector,
  input,
  OnInit,
  output,
  Signal,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { DecimalPipe } from '@angular/common';

import { VariantFormGroup } from '../common/variant-form-group';
import { ItemFormGroup } from '../common/item-form-group';
import {
  ProductSearchResult,
  ProductVariantOption,
} from '../../../../components/product-search/product-search-result';
import { Category } from '../../../../dtos/categories/category-dto';
import { Brand } from '../../../../dtos/brands/brand-dto';
import { CreateEntityEvent } from '../../../../interfaces/types/create-entity-event';

import VariantExistingRow from './variant-existing-row/variant-existing-row';
import VariantNewRow from './variant-new-row/variant-new-row';
import { ExistingProduct } from './existing-product/existing-product';
import NewProduct from './new-product/new-product';
import {Color} from '../../../../dtos/Colors/color';
import {ReceptionFormBuilders} from '../common/reception-form-builder';

@Component({
  selector: 'app-reception-item',
  standalone: true,
  imports: [
    VariantExistingRow,
    VariantNewRow,
    ReactiveFormsModule,
    DecimalPipe,
    ExistingProduct,
    NewProduct,
  ],
  templateUrl: './reception-item.html',
})
export default class ReceptionItem implements OnInit {
  private fb = inject(FormBuilder);
  private injector = inject(Injector);

  // ---------------- INPUTS / OUTPUTS ----------------
  form = input.required<ItemFormGroup>();
  index = input.required<number>();
  categories = input.required<Category[]>();
  colors = input.required<Color[]>();
  brands = input.required<Brand[]>();

  remove = output<number>();
  create = output<CreateEntityEvent>();

  // ---------------- STATE ----------------
  isNewProduct = computed(() => this.formValue()?.mode === 'new');
  availableVariants = signal<ProductVariantOption[]>([]);
  selectedProduct = signal<ProductSearchResult | null>(null);

  // ---------------- FORM GETTERS ----------------
  get vArray() {return this.form().controls.variants;}

  get productIdCtrl() {return this.form().controls.productId;}

  get newProductGroup() {return this.form().controls.newProduct;}

  // En ReceptionItem
  allNewVariantsDuplicated = computed(() => {
    const rows = this.formValue()?.variants || [];

    // Filtramos solo las nuevas que tengan datos completos
    const newOnes = rows.filter((r: any) =>
      r.mode === 'new' &&
      r.newVariant?.size?.trim() &&
      r.newVariant?.colorId
    );

    const combinations = newOnes.map((r: any) =>
      `${r.newVariant.size.trim().toUpperCase()}-${r.newVariant.colorId}`
    );

    return new Set(combinations).size !== combinations.length;
  });

  // ---------------- REACTIVE BRIDGE ----------------
  private formValue!: Signal<any>;

  ngOnInit(): void {
    this.formValue = toSignal(
      this.form().valueChanges.pipe(startWith(this.form().value)),
      { injector: this.injector }
    );
  }
  // ---------------- COMPUTEDS ----------------
  usedIds = computed(() =>
    (this.formValue()?.variants ?? [])
      .map((v: any) => v.productVariantId)
      .filter((id: number | null): id is number => id !== null)
  );

  totalUnits = computed(() =>
    (this.formValue()?.variants ?? []).reduce(
      (acc: number, v: any) => acc + (v.quantityReceived ?? 0),
      0
    )
  );

  itemTotalCost = computed(() =>
    (this.formValue()?.variants ?? []).reduce(
      (acc: number, v: any) =>
        acc + (v.quantityReceived ?? 0) * (v.unitCost ?? 0),
      0
    )
  );

  // ---------------- VARIANTS ----------------
  addVariant(mode: 'new' | 'ex'): void {
    this.vArray.push(ReceptionFormBuilders.buildVariantGroup(this.fb, mode));
  }

  removeVariant(i: number): void {
    if (this.vArray.length > 1) {
      this.vArray.removeAt(i);
    }
  }

  switchVariantMode(i: number, mode: 'new' | 'ex'): void {
    const group = this.form().controls.variants.at(i) as VariantFormGroup;
    group.controls.newVariant.reset();
    group.controls.mode.setValue(mode);
    group.get('mode')?.updateValueAndValidity();
    console.log(group.controls.mode.value);
  }

  private resetVariants(): void {
    this.vArray.clear();
    const mode = this.form().controls.mode.value === 'new' ? 'new' : 'ex';
    queueMicrotask(() => this.vArray.push(ReceptionFormBuilders.buildVariantGroup(this.fb, mode)));
  }

  // ---------------- PRODUCT ----------------
  onProductSelected(product: ProductSearchResult): void {
    this.selectedProduct.set(product);
    this.productIdCtrl.setValue(product.id);
    this.availableVariants.set(product.productVariants);
    this.resetVariants();
  }

  onSelectionCleared(): void {
    this.selectedProduct.set(null);
    this.productIdCtrl.setValue(null);
    this.availableVariants.set([]);
    this.resetVariants();
  }

  switchToNewProduct(): void {
    this.form().controls.mode.setValue('new');
    this.resetVariants();
  }

  switchToExistingProduct(): void {
    this.form().controls.mode.setValue('ex');
    this.form().controls.productId.reset();
    this.vArray.clear();
  }

  private setNewProductValidators(active: boolean): void {
    const np = this.newProductGroup;

    const fields = ['name', 'categoryId', 'brandId', 'basePrice', 'gender'];

    fields.forEach((f) => {
      const control = np.get(f);
        control?.setValidators([Validators.required]);
        control?.clearValidators();
      control?.updateValueAndValidity();
    });

    if (!active) {
      np.reset();
    }
  }

  // ---------------- OUTPUTS ----------------
  onRemove(): void {
    this.remove.emit(this.index());
  }

  handleOpenCreation(event: CreateEntityEvent): void {
    console.log("PETICIÖN DE CREAR: ", event);
    this.create.emit(event);
  }


  onVariantCreateNew(i: number, searchText: string): void {
    this.vArray.removeAt(i);
    const newGroup = ReceptionFormBuilders.buildVariantGroup(this.fb, 'new');
    this.vArray.insert(i, newGroup);
    if (searchText) {
      newGroup.controls.newVariant.controls.description.setValue(searchText);
    }
  }
}
