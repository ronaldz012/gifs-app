// reception-mappers.ts
import { ProductSearchResult, ProductVariantOption } from '@features/inventory/components/product-search/product-search-result';
import { ReceptionGroup, ReceptionVariant } from '@features/inventory/models/reception-model';
import { VariantFormGroup } from './variant-form-group';
import { ProductVariantCreatedDto } from '@features/inventory/dtos/products/create-product-variant-dto';
import { VariantForm } from '@features/inventory/models/variant-form.model';
import { ItemForm } from '@features/inventory/models/item-form.model';

export function mapExistingVariantToReceptionVariant(
  option: VariantForm,
  v: VariantForm
): ReceptionVariant {
  return {
    productVariantId: option.id!,
    sku:              option.sku!,
    size:             option.size!,
    quantityReceived: v.quantityReceived!,
    unitCost:         v.unitCost!,
  };
}

export function mapCreatedVariantToReceptionVariant(
  created: ProductVariantCreatedDto,
  v: VariantForm
): ReceptionVariant {
  return {
    productVariantId: created.productVariantId,
    sku:              created.sku,
    size:             created.size,
    quantityReceived: v.quantityReceived!,
    unitCost:         v.unitCost!,
  };
}
export function mapProductSearchToGroup(
  product: ItemForm,
  exVariants: VariantForm[],
  newVariants: VariantForm[],
  createdVariants: ProductVariantCreatedDto[]
): ReceptionGroup {
  const variantMap = new Map(product.variants.map(v => [v.id, v]));

  const ex: ReceptionVariant[] = exVariants.map(v => {
    const option = variantMap.get(v.id!)!;
    return mapExistingVariantToReceptionVariant(option, v);
  });

  const created: ReceptionVariant[] = createdVariants.map((cv, i) =>
    mapCreatedVariantToReceptionVariant(cv, newVariants[i])
  );

  return {
  productId: product.product?.Id!,
  productName: product.product.productName,
  brandName: product.product.brandName,
  categoryName: product.product.categoryName,
  variants: [...ex, ...created],
  internalCode:'',

};
}