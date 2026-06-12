import { Component, computed, input, output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { VariantForm } from '@features/inventory/models/variant-form.model';
import { ColorSelectCtrl } from "@features/inventory/components/color-select-ctrl/color-select-ctrl.component";
import { ProductVariantOption } from '@features/inventory/components/product-search/product-search-result.component';

@Component({
  selector: 'app-variant-new-row',
  imports: [FormField, ColorSelectCtrl],
  templateUrl: './variant-new-row.html',
  host: { class: 'contents' }
})
export default class VariantNewRow {

  formModel        = input.required<FieldTree<VariantForm>>();
  index            = input.required<number>();
  existingVariants = input<ProductVariantOption[]>([]);
  remove           = output<void>();

  subtotal = computed(() => {
    const qty   = this.formModel().quantityReceived().value() ?? 0;
    const price = this.formModel().price().value() ?? 0;
    return qty * price;
  });

  onRemove(): void { this.remove.emit(); }
  onFocus(event: FocusEvent) {
  const el = event.target as HTMLElement;
  setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
}
}