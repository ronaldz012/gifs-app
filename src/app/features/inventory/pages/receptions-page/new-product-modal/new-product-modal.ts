import { Component, computed, inject, input, output, signal, ViewChildren, QueryList, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {ReceptionFormBuilders} from '../reception-form/common/reception-form-builder';
import {VariantFormGroup} from '../reception-form/common/variant-form-group';
import {FormArray, FormBuilder} from '@angular/forms';
import {ItemFormGroup} from '../reception-form/common/item-form-group';
import {Category} from '../../../dtos/categories/category-dto';
import {Brand} from '../../../dtos/brands/brand-dto';
import {Color} from '../../../dtos/Colors/color';
import VariantNewRow from '../reception-form/variant-new-row/variant-new-row';
import {NewProductForm} from './new-product-form/new-product-form';

@Component({
  selector: 'app-new-product-modal',
  imports: [
    VariantNewRow,
    NewProductForm,
    CurrencyPipe
  ],
  templateUrl: './new-product-modal.html',
  styles: ``,
})
export class NewProductModal implements OnInit {
  private fb = inject(FormBuilder);

  // ── Inputs ────────────────────────────────────────────────────────────
  /** Null → modo nuevo. Formulario existente → modo edición (pendiente). */
  itemForm = input<ItemFormGroup | null>(null);

  categories = input<Category[]>([]);
  brands     = input<Brand[]>([]);
  colors     = input<Color[]>([]);

  // ── Outputs ───────────────────────────────────────────────────────────
  close = output<void>();
  /** Emite el ItemFormGroup completo y válido cuando el usuario confirma. */
  confirm = output<ItemFormGroup>();

  // ── Estado interno ────────────────────────────────────────────────────
  form = signal<ItemFormGroup | null>(null);

  variantsArray = computed(() =>
    this.form()?.controls.variants as FormArray<VariantFormGroup> | null
  );

  summary = signal({ units: 0, cost: 0, sales: 0, margin: 0 });

  @ViewChildren(VariantNewRow) variantRows!: QueryList<VariantNewRow>;

  // ── Lifecycle ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    const existing = this.itemForm();
    const currentForm = existing ? existing : ReceptionFormBuilders.buildNewItemGroup(this.fb);
    this.form.set(currentForm);

    currentForm.controls.variants.valueChanges.subscribe(variants => {
      this.updateSummary(variants as any[]);
    });
    this.updateSummary(currentForm.controls.variants.value as any[]);
  }

  private updateSummary(variants: any[]): void {
    let units = 0;
    let cost = 0;
    let sales = 0;

    for (const v of variants || []) {
      const q = Number(v.quantityReceived) || 0;
      const c = Number(v.unitCost) || 0;
      const p = Number(v.newVariant?.price) || 0;

      units += q;
      cost += q * c;
      sales += q * p;
    }

    this.summary.set({ units, cost, sales, margin: sales - cost });
  }

  // ── Variants ──────────────────────────────────────────────────────────
  addVariant(): void {
    this.variantsArray()?.push(
      ReceptionFormBuilders.buildNewVariantGroup(this.fb)
    );
    setTimeout(() => {
      this.variantRows.last?.focusFirst();
    }, 50);
  }

  removeVariant(index: number): void {
    this.variantsArray()?.removeAt(index);
  }

  // ── Acciones ──────────────────────────────────────────────────────────
  onClose(): void {
    this.close.emit();
  }

  /** Por ahora no hace nada funcional; se implementará en la siguiente iteración. */
  onConfirm(): void {
    if(this.form()){
      this.confirm.emit(this.form()!);
    }
  }
}

