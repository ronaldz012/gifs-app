export interface ProductVariantBySkuDto {
  id: GUID;
  sku: string;
  description: string;
  size: string;
  color: string;
  availableStockInBranch: number;
  productName: string;
}
