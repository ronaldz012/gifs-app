import { FormGroup, FormControl } from '@angular/forms';

// Definís el tipo del form de variante
export type VariantFormGroup = FormGroup<{
    mode: FormControl<string>;
    productVariantId: FormControl<GUID | null>;
    newVariant: FormGroup<{
    description: FormControl<string>;
    size: FormControl<string>;
    colorId: FormControl<GUID>;
    price: FormControl<number | null>;
  }>;
  quantityReceived: FormControl<number | null>;
  unitCost: FormControl<number | null>;
}>;
