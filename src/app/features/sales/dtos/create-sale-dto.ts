import { PaymentMethod } from '@features/sales/models/payment-method';

export interface CreateSaleDto {
  paymentMethod: PaymentMethod;
  invoiceNumber: number | null;
  documentType: number; // 0=Ticket, 1=Invoice, 2=PendingInvoice
  transactionCode: string | null;
  notes: string | null;
  items: CreateSaleItemDto[];
}

export interface CreateSaleItemDto {
  productVariantId: GUID;
  quantity: number;
  discountAmount: number;
}
