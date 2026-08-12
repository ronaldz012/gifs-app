import { Component, input, output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { VariantForm } from '@features/inventory/models/variant-form.model';
import { ColorSelectCtrl } from '@features/inventory/components/color-select-ctrl/color-select-ctrl.component';
import { SizeSelectCtrl } from '@features/inventory/components/size-select-ctrl/size-select-ctrl.component';

@Component({
  selector: 'app-create-variant-row',
  imports: [FormField, ColorSelectCtrl, SizeSelectCtrl],
  templateUrl: './create-variant-row.html',
  host: { class: 'contents' },
})
export default class CreateVariantRow {
  formModel = input.required<FieldTree<VariantForm>>();
  index = input.required<number>();
  priceLocked = input(false);
  remove = output<void>();

  onRemove(): void {
    this.remove.emit();
  }
}
