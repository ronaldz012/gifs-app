import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { VariantFormGroup } from './variant-form-group'; // si está en el mismo archivo, ignorá este import

export type ItemFormGroup = FormGroup<{
  productId: FormControl<number | null>;
  newProduct: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
    categoryId: FormControl<number | null>;
    brandId: FormControl<number | null>;
    unitMeasurementSin: FormControl<number | null>;
    economicActivity: FormControl<string>;
    productCodeSin: FormControl<number | null>;
  }>;
  variants: FormArray<VariantFormGroup>;
}>;
