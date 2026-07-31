import { FormArray, FormControl, FormGroup } from '@angular/forms';

export type ExistingItemFormGroup = FormGroup<{
  id: FormControl<GUID | null>;
  variants: FormArray<VariantFormGroup>;
}>;

export type VariantFormGroup = FormGroup<{
  mode: FormControl<'ex' | 'new'>;
  id: FormControl<GUID | null>;
  size: FormControl<string>; 
  colorId: FormControl<GUID>;
  colorName: FormControl<string>
  quantityReceived: FormControl<number | null>;
  unitCost: FormControl<number | null>
  description: FormControl<string>
  price: FormControl<number | null>;

}>

export type NewProductFormGroup = FormGroup<{
  name: FormControl<string>;
  description: FormControl<string>;
  categoryId: FormControl<GUID | null>;
  brandId: FormControl<GUID | null>;
  gender: FormControl<number | null>;
  variants:FormArray<VariantFormGroup>
}>;


