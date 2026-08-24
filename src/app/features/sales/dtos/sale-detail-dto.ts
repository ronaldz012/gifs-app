export enum SaleType {
  Sale = 0,
  Return = 1,
}

export enum PaymentMethod {
  Cash = 0,
  QrCode = 1,
}

export enum DocumentType {
  Ticket = 0,
  Invoice = 1,
  PendingInvoice = 2,
}

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
  returnNumber?: string | null;
}

export interface SaleDetailDto {
  id: GUID;
  branchId: GUID;
  soldById: GUID;
  soldByName: string;
  type: SaleType;
  totalItems: number;
  documentType: DocumentType;
  paymentMethod: PaymentMethod;
  transactionCode: string | null;
  totalAmount: number;
  invoiceNumber: number | null;
  notes: string | null;
  createdAt: string;
  originalSaleId?: GUID | null;
  items: SaleItemDetailDto[];
  returns: SaleRefundDto[];
}
