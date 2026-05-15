import { Component, computed, input, output } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, startWith } from 'rxjs';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { ItemFormGroup } from '../common/item-form-group';
import { Category } from '../../../../dtos/categories/category-dto';
import { Brand } from '../../../../dtos/brands/brand-dto';
import { Color } from '../../../../dtos/Colors/color';

@Component({
  selector: 'app-reception-item',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './reception-item.html',
  styles: ``,
})
export class ReceptionItem {
  // Inputs
  form = input.required<ItemFormGroup>();
  categories = input<Category[]>([]);
  brands = input<Brand[]>([]);
  colors = input<Color[]>([]);
  index = input<number>(0);

  // Outputs
  remove = output<number>();
  edit = output<ItemFormGroup>();

  // Signal que reacciona a cambios de valor dentro del form
  private formValue = toSignal(
    toObservable(this.form).pipe(
      switchMap(f => f.valueChanges.pipe(startWith(f.value)))
    )
  );

  // Computed
  mode = computed(() => this.form().controls.mode.value);

  productName = computed(() => {
    const val = this.formValue();
    const name = val?.newProduct?.name;
    return name || (this.mode() === 'ex' ? 'Producto del catálogo' : 'Sin nombre');
  });

  variantsSummary = computed(() => {
    const val = this.formValue();
    const variants = val?.variants || [];
    const colorMap = new Map(this.colors().map(c => [c.id, c.name]));

    return variants.map((v: any) => {
      const colorName = colorMap.get(v.newVariant?.colorId as any) || 'S/C';
      const size = v.newVariant?.size || 'S/T';
      return `${colorName}#${size}`;
    });
  });

  totalUnits = computed(() => {
    const val = this.formValue();
    const variants = val?.variants || [];
    return variants.reduce((acc: number, v: any) => acc + (v.quantityReceived || 0), 0);
  });

  totalCost = computed(() => {
    const val = this.formValue();
    const variants = val?.variants || [];
    return variants.reduce((acc: number, v: any) => acc + ((v.quantityReceived || 0) * (v.unitCost || 0)), 0);
  });

  onEdit() {
    this.edit.emit(this.form());
  }

  onRemove() {
    this.remove.emit(this.index());
  }
}
