import {FormBuilder, Validators} from '@angular/forms';
import {ItemFormGroup, NewProductFormGroup, NewReceptionForm} from './item-form-group';
import {VariantFormGroup} from './variant-form-group';

export class ReceptionFormBuilders {

  static buildReceptionForm(fb: FormBuilder): NewReceptionForm {
    return fb.group<NewReceptionForm['controls']>({
      notes: fb.control('', {nonNullable: true}),
      items: fb.array<ItemFormGroup>([]),
    });
  }

  static buildItemGroup(fb: FormBuilder, mode: 'ex' | 'new'): ItemFormGroup {
    return fb.group<ItemFormGroup['controls']>({
      productId: fb.control<GUID | null>(null, {validators: [Validators.required]}),
      mode: fb.control<string>(mode, {nonNullable: true}),
      newProduct: fb.group<NewProductFormGroup['controls']>({
        name:        fb.control('', {nonNullable: true}),
        description: fb.control('', {nonNullable: true}),
        categoryId:  fb.control<GUID | null>(null),
        brandId:     fb.control<GUID | null>(null),
        gender:      fb.control<number | null>(null),
        basePrice:   fb.control<number>(0, {nonNullable: true}),
      }),
      variants: mode === 'new'
        ? fb.array<VariantFormGroup>([ReceptionFormBuilders.buildVariantGroup(fb, 'new')])
        : fb.array<VariantFormGroup>([]),
    });
  }

  static buildVariantGroup(fb: FormBuilder, mode: 'ex' | 'new'): VariantFormGroup {
    return fb.group({
      productVariantId: fb.control<GUID | null>(null),
      mode:             fb.control<string>(mode, {nonNullable: true}),
      newVariant: fb.group({
        description: fb.control('', {nonNullable: true}),
        size:        fb.control('', {nonNullable: true}),
        colorId:     fb.control<GUID | null>(null),
        price:       fb.control<number | null>(null),
      }),
      quantityReceived: fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
      unitCost:         fb.control<number | null>(null, [Validators.required, Validators.min(0.5)]),
    }) as VariantFormGroup;
  }
}
