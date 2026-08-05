export interface LastClosureSummaryDto {
  hasData: boolean;
  closureId?: GUID;
  openedAt?: string;
  closedAt?: string;
  totalSales: number;
  salesCount: number;
  itemsSold: number;
  restockCount: number;
}
