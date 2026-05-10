import { FormArray, FormGroup } from '@angular/forms';
import createReceptionDto, {CreateReceptionItem, NewProductDto, NewProductVariantDto} from '../../../../dtos/Receptions/create-reception-dto';

export function buildReceptionPayload(
  form: FormGroup,
  itemsArray: FormArray,
  branchId: string
): createReceptionDto {

  const raw = form.getRawValue();

  return {
    branchId,
    notes: raw.notes,

    items: itemsArray.controls.map((itemCtrl: any) => {
      const item = itemCtrl.getRawValue();
      const isNewProduct = !item.productId;

      return {
        productId: isNewProduct
          ? null
          : item.productId,

        newProduct: isNewProduct
          ? ({
            name: item.newProduct.name,
            description: item.newProduct.description,
            categoryId: item.newProduct.categoryId,
            brandId: item.newProduct.brandId,
            basePrice: item.newProduct.basePrice,
            gender: item.newProduct.gender,
          } as NewProductDto)
          : null,

        variants: itemCtrl.controls.variants.controls.map((varCtrl: any) => {
          const variant = varCtrl.getRawValue();
          const isNewVariant = !variant.productVariantId;

          return {
            productVariantId: isNewVariant
              ? null
              : variant.productVariantId,

            quantityReceived: variant.quantityReceived,
            unitCost: variant.unitCost,

            newVariant: isNewVariant
              ? ({
                description: variant.newVariant.description,
                size: variant.newVariant.size,
                colorId: variant.newVariant.colorId ?? 'hola',
                price: variant.newVariant.price,
              } as NewProductVariantDto)
              : null,
          };
        }),
      } as CreateReceptionItem;
    }),
  };
}
