import { Gender } from '../../interfaces/gender';

export interface BranchStockDto {
  branchId: GUID;
  stock: number;
}

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
  totalAvailable: number;
  variants: ProductVariantDto[];
}

export interface ProductVariantDto {
  id: GUID;
  sku: string;
  description: string;
  size: string;
  sizeId: GUID;
  color: string;
  colorId: GUID;
  price: number;
  totalAvailable: number;
  branchStocks: BranchStockDto[];
}
