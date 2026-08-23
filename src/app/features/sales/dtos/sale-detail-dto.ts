export interface SaleItemDetailDto {
  id: GUID;
  productVariantId: GUID;
  productSku: string;
  productDisplayName: string;
  unitPrice: number;
  unitCost?: number;
  quantity: number;
  returnedQuantity: number;
  discountAmount: number;
  finalPrice: number;
}

export interface SaleRefundDto {
  id: GUID;
  createdAt: string;
  totalAmount: number;
}

export interface SaleDetailDto {
  id: GUID;
  branchId: GUID;
  soldById: GUID;
  soldByName: string;
  type: number | string;
  totalItems: number;
  documentType: number | string;
  paymentMethod: number | string;
  transactionCode: string | null;
  totalAmount: number;
  invoiceNumber: number | null;
  notes: string | null;
  createdAt: string;
  originalSaleId?: GUID | null;
  items: SaleItemDetailDto[];
  returns: SaleRefundDto[];
}
