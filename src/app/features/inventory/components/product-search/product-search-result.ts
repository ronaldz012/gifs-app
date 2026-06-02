import {Gender} from '../../interfaces/gender';

export interface ProductSearchResult {
  id: GUID;
  name: string;
  internalCode : string;
  description: string;
  basePrice: number;
  brandName: string;
  categoryName: string;
  productVariants: ProductVariantOption[];
  gender: Gender;
}
export interface ProductVariantOption {
  id: GUID;
  sku: string;
  description: string;
  size: string;
  colorId: GUID;
  colorName: string;
  price: number;
}
