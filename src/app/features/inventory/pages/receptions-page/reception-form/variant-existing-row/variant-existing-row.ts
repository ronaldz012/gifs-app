import { Component, computed, effect, input, output, signal, WritableSignal } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { DecimalPipe } from '@angular/common';
import { ProductVariantOption } from '../../../../components/product-search/product-search-result';
import { VariantForm } from '@features/inventory/models/variant-form.model';


@Component({
  selector: 'app-variant-existing-row',
  imports: [DecimalPipe, FormField],
  templateUrl: './variant-existing-row.html',
  host: { class: 'contents' }
})
export default class VariantExistingRow {
openDropdown() {
  this.showDropdown.set(true)
}
closeDropdown() {
  this.showDropdown.set(false)
  this.formModel().id().markAsTouched();

}
  formModel = input.required<FieldTree<VariantForm>>();
  index     = input.required<number>();
  availableVariants = input<ProductVariantOption[]>([]);
  
  remove    = output<void>();
  createNew = output<string>();

  variantSearch  = signal('');
  showDropdown   = signal(false);

  // Computeds corregidos para acceder al .value() de cada campo
  subtotal = computed(() => {
    const qty = this.formModel().quantityReceived().value() ?? 0;
    const cost = this.formModel().unitCost().value() ?? 0;
    return qty * cost;
  });

  // variant-existing-row.ts — solo filtra por texto
  filteredVariants = computed(() => {
    const q = this.variantSearch().toLowerCase().trim();
    if (!q) return this.availableVariants();
    return this.availableVariants().filter(v =>
      v.sku?.toLowerCase().includes(q));
  });

  private patchModel(partial: VariantForm): void {
    const model = this.formModel();

    // Usamos el acceso como función model.campo() 
    // para obtener el estado y aplicar el cambio.
    if (partial.id !== undefined)               model.id().value.set(partial.id);
    if (partial.size !== undefined)             model.size().value.set(partial.size);
    if (partial.colorId !== undefined)          model.colorId().value.set(partial.colorId);
    if (partial.price !== undefined)            model.price().value.set(partial.price);
    if (partial.mode !== undefined)             model.mode().value.set(partial.mode);
    if (partial.quantityReceived !== undefined) model.quantityReceived().value.set(partial.quantityReceived);
    if (partial.unitCost !== undefined)         model.unitCost().value.set(partial.unitCost);
    if(partial.colorName !==undefined)       model.colorName().value.set(partial.colorName);

  }

selectVariant(variant: ProductVariantOption): void {
    this.patchModel({
      id: variant.id,
      size: variant.size ?? '',
      colorId: variant.colorId,
      colorCode: variant.sku,
      colorName: variant.colorName,
      price: variant.price,
      mode: 'ex',
      quantityReceived: null,
      unitCost: null,
      sku: variant.sku
    });

    this.variantSearch.set(variant.sku);
    this.showDropdown.set(false);
  }

  onSearchInput(value: string): void {
    this.variantSearch.set(value);
    // Si borran el texto, limpiamos el ID
    if (!value) {
      this.patchModel({
        id: '' as GUID,
        mode: 'ex',
        size: '',
        colorId: '0' as GUID,
        colorCode: '',
        colorName: '',
        quantityReceived: null,
        unitCost: 0,
        price: null,
        sku: ''
      });
    }
  }

  onRemove(): void {
    this.remove.emit();
  }
  // En el componente, temporal para debug
debugState = computed(() => {
  const id = this.formModel().id();
  const qty = this.formModel().quantityReceived();
  const cost = this.formModel().unitCost();
  
  console.log('id state:', {
    value: id.value(),
    touched: id.touched(),
    invalid: id.invalid(),
    errors: id.errors(),
  });
  console.log('qty state:', {
    value: qty.value(),
    touched: qty.touched(),
    invalid: qty.invalid(),
    errors: qty.errors(),
  });
  console.log('cost state:', {
    value: cost.value(),
    touched: cost.touched(),
    invalid: cost.invalid(),
    errors: cost.errors(),
  });
  
});
}