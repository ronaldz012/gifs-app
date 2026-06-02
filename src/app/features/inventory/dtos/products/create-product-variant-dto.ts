export interface CreateProductVariantDto {

  size: string;
  price: number;
  description: string;
  colorId: GUID;
  variants: ProductVariantDto[];

}

export interface ProductVariantDto {
  id: GUID;
  description: string;
  size: string;
  price: number;
  colorId: GUID;
}
export interface ProductVariantCreatedDto {
  productVariantId: GUID;
  sku: string;
  size: string;
  colorName: string;
}
