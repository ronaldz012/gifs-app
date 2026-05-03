import {BaseQueryDto} from '../base-query-dto';

export interface StockReceptionListDto {
  id: number;
  branchId: number;
  receivedAt: Date;
  canRollback: boolean;
  status: ReceptionStatus;
  totalItems: number;
  productVariantsCount: number;
  totalCost: number;
  brandNames: string[];
  categoryNames: string[];
}
export interface ReceptionQueryParams extends BaseQueryDto {
  dateFrom?: string;
  dateTo?: string;
  status?: ReceptionStatus;
  brandId?: number;

}
// reception-enums.ts
export enum ReceptionStatus {
  Borrador= 0,
  Confirmado = 1,
  Rechazado = 2,
  Revertida= 3,
}
