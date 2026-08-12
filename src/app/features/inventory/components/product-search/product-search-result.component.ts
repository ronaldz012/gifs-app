import { Gender } from '../../interfaces/gender';

export interface ProductSearchResult {
  id: GUID;
  name: string;
  internalCode: string;
  description: string;
  basePrice: number;
  brandName: string;
  categoryName: string;
  gender: Gender;
  productVariants: ProductVariantOption[];
}
export interface ProductVariantOption {
  id: GUID;
  sku: string;
  size: string;
  sizeId: GUID;
  colorId: GUID;
  colorName: string;
  price: number;
}
