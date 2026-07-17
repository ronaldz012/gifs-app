export interface SaleListDto {
  id: GUID;
  createdAt: string;
  totalAmount: number;
  paymentMethod: number;
  documentType: string;
  invoiceNumber: number | null;
  transactionCode: string | null;
  itemCount: number;
}
