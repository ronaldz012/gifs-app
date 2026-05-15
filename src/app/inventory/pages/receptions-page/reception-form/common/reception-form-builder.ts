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
      productId: fb.control<GUID | null>(null,),
      mode: fb.control<string>(mode, {nonNullable: true}),
      newProduct: fb.group<NewProductFormGroup['controls']>({
        name:        fb.control('', {nonNullable: true}),
        description: fb.control('', {nonNullable: true}),
        categoryId:  fb.control<GUID | null>(null),
        brandId:     fb.control<GUID | null>(null),
        gender:      fb.control<number | null>(null),
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
  static buildNewItemGroup(fb: FormBuilder): ItemFormGroup {
    return fb.group<ItemFormGroup['controls']>({
      productId:  fb.control<GUID | null>(null),
      mode:       fb.control('new', { nonNullable: true }),
      newProduct: fb.group<NewProductFormGroup['controls']>({
        name:        fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2), Validators.maxLength(120)] }),
        description: fb.control('', { nonNullable: true }),
        categoryId:  fb.control<GUID | null>(null, { validators: [Validators.required] }),
        brandId:     fb.control<GUID | null>(null, { validators: [Validators.required] }),
        gender:      fb.control<number | null>(null, { validators: [Validators.required] }),
      }),
      variants: fb.array<VariantFormGroup>([
        ReceptionFormBuilders.buildNewVariantGroup(fb)
      ]),
    });
  }

  static buildNewVariantGroup(fb: FormBuilder): VariantFormGroup {
    return fb.group({
      productVariantId: fb.control<GUID | null>(null), // No obligatorio
      mode: fb.control<'new'>('new', { nonNullable: true }),
      newVariant: fb.group({
        description: fb.control(''), // No obligatorio
        size: fb.control('', [Validators.required]),
        colorId: fb.control<GUID | null>(null, [Validators.required]),
        price: fb.control<number | null>(null, [Validators.required, Validators.min(0.5)]),
      }),
      quantityReceived: fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
      unitCost: fb.control<number | null>(null, [Validators.required, Validators.min(0.5)]),
    }) as VariantFormGroup;
  }

  static buildExistingVariantGroup(fb: FormBuilder): VariantFormGroup {
    return fb.group({
      productVariantId: fb.control<GUID | null>(null, [Validators.required]),
      mode: fb.control<'ex'>('ex', { nonNullable: true }),
      newVariant: fb.group({
        description: fb.control(''),
        size: fb.control(''),
        colorId: fb.control<GUID | null>(null),
        price: fb.control<number | null>(null),
      }),
      quantityReceived: fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
      unitCost: fb.control<number | null>(null, [Validators.required, Validators.min(0.5)]),
    }) as VariantFormGroup;
  }
}
