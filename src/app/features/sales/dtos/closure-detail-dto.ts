export interface ClosureSaleItemDto {
  id: GUID;
  createdAt: string;
  soldByName: string;
  totalAmount: number;
  paymentMethod: string;
  documentType: string;
  invoiceNumber: number | null;
  transactionCode: string | null;
  itemsCount: number;
}

export interface ClosureMovementDto {
  id: GUID;
  createdAt: string;
  amount: number;
  description: string;
  type: string;
}

export interface ClosureDetailDto {
  id: GUID;
  branchId: GUID;
  openedAt: string;
  closedAt: string | null;
  openedByName: string;
  closedByName: string | null;
  openingBalance: number;
  systemSalesAmount: number;
  realCountedAmount: number;
  difference: number;
  totalSales: number;
  cashSales: number;
  totalExpenses: number;
  sales: ClosureSaleItemDto[];
  movements: ClosureMovementDto[];
}
