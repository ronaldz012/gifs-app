
import { FormBuilder, Validators } from '@angular/forms';
import { ExistingItemFormGroup, NewProductFormGroup, VariantFormGroup } from './variant-form-group';
import { Gender } from '@features/inventory/interfaces/gender';
export class ReceptionFormBuilders {

  // ── Existing Item ─────────────────────────────────────────────────────
 static buildExistingItemGroup(fb: FormBuilder): ExistingItemFormGroup {
  return fb.group<ExistingItemFormGroup['controls']>({
    id:       fb.control<GUID | null>(null, [Validators.required]),
    variants: fb.array<VariantFormGroup>([]),
  });
}

  // ── New Product ───────────────────────────────────────────────────────
  static buildNewProductGroup(fb: FormBuilder): NewProductFormGroup {
  return fb.group<NewProductFormGroup['controls']>({
    name:        fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2), Validators.maxLength(120)] }),
    description: fb.control('', { nonNullable: true }),
    categoryId:  fb.control<GUID | null>(null, [Validators.required]),
    brandId:     fb.control<GUID | null>(null, [Validators.required]),
    gender:      fb.control<Gender | null>(null, [Validators.required]),
    variants:    fb.array<VariantFormGroup>([]),
  });
}


  // ── Existing Variant (tiene mode e id — para ExistingProductModal) ────
  static buildExistingVariantGroup(fb: FormBuilder): VariantFormGroup {
    return fb.group<VariantFormGroup['controls']>({
      mode:             fb.control<'ex' | 'new'>('ex', { nonNullable: true }),
      id:               fb.control<GUID | null>(null , [Validators.required]),
      size:             fb.control('', { nonNullable: true }),
      colorId:          fb.control<GUID>('' as GUID, { nonNullable: true }),
      colorName:        fb.control<string>('', {nonNullable:true}),
      price:            fb.control<number | null>(null),
      quantityReceived: fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
      unitCost:         fb.control<number | null>(null, [Validators.required, Validators.min(0.5)]),
      description:      fb.control('', { nonNullable: true }),
    });
  }

  // ── New Variant en producto existente (mode = 'new') ──────────────────
  static buildNewVariantGroup(fb: FormBuilder): VariantFormGroup {
    return fb.group<VariantFormGroup['controls']>({
      mode:             fb.control<'ex' | 'new'>('new', { nonNullable: true }),
      id:               fb.control<GUID>('' as GUID, { nonNullable: true }),
      size:             fb.control('', { nonNullable: true, validators: [Validators.required] }),
      colorId:          fb.control<GUID>('' as GUID, { nonNullable: true, validators: [Validators.required] }),
      colorName:        fb.control('', { nonNullable: true }),
      quantityReceived: fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
      unitCost:         fb.control<number | null>(null, [Validators.required, Validators.min(0.5)]),
      price:            fb.control<number | null>(null, [Validators.required, Validators.min(0.5)]),
      description:      fb.control('', { nonNullable: true }),
    });
  }


}