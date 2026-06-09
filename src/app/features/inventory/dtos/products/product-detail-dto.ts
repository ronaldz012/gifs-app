import {Gender} from '../../interfaces/gender';

export interface ProductDetailDto {
  id: GUID;
  name: string;
  internalCode: string;
  description: string;
  basePrice: number;
  gender: Gender;
  categoryId: GUID;
  categoryName: string;
  brandId: GUID;
  brandName: string;
  totalStock: number;
  variants: ProductVariantDto[];
}

export interface ProductVariantDto {
  id: GUID;
  sku: string;
  description: string;
  size: string;
  color: string;
  colorId: GUID;
  price: number;
  stock: number
}
