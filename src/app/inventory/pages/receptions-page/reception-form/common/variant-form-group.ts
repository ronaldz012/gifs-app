import { FormGroup, FormControl } from '@angular/forms';

// Definís el tipo del form de variante
export type VariantFormGroup = FormGroup<{
  productVariantId: FormControl<number | null>;
  newVariant: FormGroup<{
    description: FormControl<string>;
    size: FormControl<string>;
    color: FormControl<string>;
    price: FormControl<number | null>;
  }>;
  quantityReceived: FormControl<number | null>;
  unitCost: FormControl<number | null>;
}>;
