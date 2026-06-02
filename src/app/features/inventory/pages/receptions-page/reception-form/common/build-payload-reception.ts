import { FormArray, FormGroup } from '@angular/forms';
import CreateReceptionDto, { CreateReceptionItemDto } from '@features/inventory/dtos/Receptions/create-reception-dto';

export function buildReceptionPayload(
  form: FormGroup,
  itemsArray: FormArray
): CreateReceptionDto {
  return {
    notes: form.getRawValue().notes,
    items: itemsArray.controls.map((itemCtrl: any): CreateReceptionItemDto => {
      const item = itemCtrl.getRawValue();
      return {
        productVariantId: item.productVariantId,
        quantityReceived: item.quantityReceived,
        unitCost: item.unitCost,
      };
    }),
  };
}