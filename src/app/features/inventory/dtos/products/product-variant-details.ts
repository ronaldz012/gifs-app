export interface ProductVariantDetailsDto {
  id: string;

  productId: string;

  productName: string;

  productCategory: string;

  productBrand: string;

  sku: string;

  description: string;

  size: string;

  color: string;

  price: number;

  currentStock: number;
}