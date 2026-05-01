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
export interface queryReceptions extends BaseQueryDto {

}
// reception-enums.ts
export enum ReceptionStatus {
  Borrador= 0,
  Confirmado = 1,
  Rechazado = 2,
}
