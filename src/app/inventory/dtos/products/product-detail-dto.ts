import {Gender} from '../../interfaces/gender';

export interface ProductDetailDto {
  id: number;
  name: string;
  internalCode: string;
  description: string;
  basePrice: number;
  gender: Gender;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  totalStock: number;
  variants: ProductVariantDto[];
}

export interface ProductVariantDto {
  id: number;
  sku: string;
  description: string;
  size: string;
  color: string;
  price: number;
  stock: number
}
