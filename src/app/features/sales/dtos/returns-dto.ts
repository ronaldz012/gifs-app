type GUID = string;

export interface SkuSearchQuery {
  sku?: string;
  days?: number;
  page?: number;
  pageSize?: number;
}

export interface MatchedItemDto {
  saleItemId: GUID;
  productDisplayName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
}

export interface SaleSkuSearchDto {
  id: GUID;
  createdAt: string;
  totalAmount: number;
  soldByName: string;
  totalItems: number;
  totalUnitsSold: number;
  matchedItems: MatchedItemDto;
}

export interface CreateReturnItemDto {
  originalSaleItemId: GUID;
  quantity: number;
}

export interface CreateReturnDto {
  items: CreateReturnItemDto[];
}

export interface CreateReturnResponse {
  returnSaleId: GUID;
  returnNumber: string;
  totalRefundAmount: number;
}

export interface ReturnableItemDto {
  saleItemId: GUID;
  productDisplayName: string;
  productSku: string;
  quantity: number;
  returnableQuantity: number;
  unitPrice: number;
}

export interface SaleForReturnDto {
  id: GUID;
  createdAt: string;
  totalAmount: number;
  soldByName: string;
  type: number | string;
  items: ReturnableItemDto[];
}
