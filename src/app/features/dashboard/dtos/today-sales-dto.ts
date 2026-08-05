export interface TodaySalesDto {
  isOpen: boolean;
  closureId?: GUID;
  openingBalance?: number;
  openingAt?: string;
  openedByName?: string;
  salesCount: number;
  totalAmount: number;
  totalItems: number;
  cashAmount: number;
  qrCodeAmount: number;
  ticketCount: number;
  invoiceCount: number;
  averageTicket: number;
}
