import { SaleType } from './sale-detail-dto';

export interface SalesQueryDto {
  dateFrom?: string;
  dateTo?: string;
  type?: SaleType | null;
  hasReturn?: boolean | null;
  page?: number;
  pageSize?: number;
}
