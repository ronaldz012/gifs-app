export interface SaleDetailDto {
  id: GUID;
  branchId: GUID;
  soldById: GUID;
  soldByName: string;
  type: number;
  totalItems: number;
  documentType: number;
  paymentMethod: number;
  transactionCode: string | null;
  totalAmount: number;
  invoiceNumber: number | null;
  notes: string | null;
  createdAt: string;
  items: SaleItemDetailDto[];
}

export interface SaleItemDetailDto {
  id: GUID;
  productVariantId: GUID;
  productSku: string;
  productDisplayName: string;
  unitPrice: number;
  quantity: number;
  discountAmount: number;
  finalPrice: number;
}
