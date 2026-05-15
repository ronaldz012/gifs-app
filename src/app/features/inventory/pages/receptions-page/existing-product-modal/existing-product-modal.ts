import { Component, computed, inject, input, OnInit, output, signal} from '@angular/core';
import {FormArray, FormBuilder} from '@angular/forms';
import {ItemFormGroup} from '../reception-form/common/item-form-group';
import {Color} from '../../../dtos/Colors/color';
import {ProductSearchResult, ProductVariantOption} from '../../../components/product-search/product-search-result';
import {VariantFormGroup} from '../reception-form/common/variant-form-group';
import {ReceptionFormBuilders} from '../reception-form/common/reception-form-builder';
import VariantNewRow from '../reception-form/variant-new-row/variant-new-row';
import VariantExistingRow from '../reception-form/variant-existing-row/variant-existing-row';
import {ExistingProductInfo} from './existing-product-info/existing-product-info';

@Component({
  selector: 'app-existing-product-modal',
  imports: [
    VariantNewRow,
    VariantExistingRow,
    ExistingProductInfo
  ],
  templateUrl: './existing-product-modal.html',
  styles: ``,
})
export class ExistingProductModal  implements OnInit {
  private fb = inject(FormBuilder);

  // ── Inputs ────────────────────────────────────────────────────────────
  /** Null → modo búsqueda/nuevo. Formulario existente → modo edición. */
  itemForm = input<ItemFormGroup | null>(null);
  colors   = input<Color[]>([]);

  // ── Outputs ───────────────────────────────────────────────────────────
  close   = output<void>();
  confirm = output<ItemFormGroup>();

  // ── Estado interno ────────────────────────────────────────────────────
  form            = signal<ItemFormGroup | null>(null);
  selectedProduct = signal<ProductSearchResult | null>(null);

  variantsArray = computed(() =>
    this.form()?.controls.variants as FormArray<VariantFormGroup> | null
  );

  /** IDs de variantes ya usadas en las filas actuales (para evitar duplicados). */
  usedVariantIds = computed<GUID[]>(() => {
    const arr = this.variantsArray();
    if (!arr) return [];
    return arr.controls
      .map(v => v.controls.productVariantId.value)
      .filter((id): id is GUID => id !== null);
  });

  /** Variantes disponibles del producto seleccionado. */
  availableVariants = computed<ProductVariantOption[]>(() =>
    this.selectedProduct()?.productVariants ?? []
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    const existing = this.itemForm();
    if (existing) {
      this.form.set(existing);
      // TODO: restaurar selectedProduct desde el producto ya cargado (modo edición)
    } else {
      this.form.set(ReceptionFormBuilders.buildItemGroup(this.fb, 'ex'));
    }
  }

  // ── Producto seleccionado ─────────────────────────────────────────────
  onProductSelected(product: ProductSearchResult): void {
    this.selectedProduct.set(product);
    this.form()?.controls.productId.setValue(product.id);

    // Limpiar variantes anteriores y agregar una fila vacía para empezar
    const arr = this.variantsArray();
    if (arr) {
      arr.clear();
      arr.push(ReceptionFormBuilders.buildVariantGroup(this.fb, 'ex'));
    }
  }

  onProductCleared(): void {
    this.selectedProduct.set(null);
    this.form()?.controls.productId.setValue(null);
    this.variantsArray()?.clear();
  }

  // ── Variantes ─────────────────────────────────────────────────────────
  addExistingVariant(): void {
    this.variantsArray()?.push(
      ReceptionFormBuilders.buildVariantGroup(this.fb, 'ex')
    );
  }

  addNewVariant(): void {
    this.variantsArray()?.push(
      ReceptionFormBuilders.buildVariantGroup(this.fb, 'new')
    );
  }

  removeVariant(index: number): void {
    this.variantsArray()?.removeAt(index);
  }

  /**
   * Llamado desde variant-existing-row cuando el usuario pulsa "Crear nueva".
   * Convierte esa fila a modo 'new' en lugar de agregar una fila extra,
   * o simplemente agrega una fila nueva al final según prefieras.
   * Por ahora agrega al final — ajusta según UX deseada.
   */
  onVariantCreateNew(index: number): void {
    this.variantsArray()?.push(
      ReceptionFormBuilders.buildVariantGroup(this.fb, 'new')
    );
  }

  // ── Acciones ──────────────────────────────────────────────────────────
  onClose(): void { this.close.emit(); }

  /** TODO: validar y emitir — se implementa en siguiente iteración. */
  onConfirm(): void { }

}
