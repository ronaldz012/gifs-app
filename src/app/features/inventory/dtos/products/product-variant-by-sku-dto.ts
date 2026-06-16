export interface ProductVariantBySkuDto {
  id: GUID; // GUID
  sku: string;
  description: string;
  size: string;
  colorId: GUID;
  colorName: string;
  price: number;
  branchId: GUID;
  availableStockInBranch: number;
  productId: GUID;
  productName: string;
  productDescription: string;
  gender: number | string;
  branchName: string;
  categoryName: string;
}