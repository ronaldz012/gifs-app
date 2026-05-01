import {ReceptionStatus} from './stock-reception-list-dto';

export interface StockReceptionDetailDto {
  id: number;
  branchId: number;
  receivedAt: string;
  notes?: string;
  status: ReceptionStatus;
  canRollback: boolean;
  totalCost: number;
  items: StockReceptionItemDetailDto[];
}

export interface StockReceptionItemDetailDto {
  id: number;
  productVariantId: number;
  productName: string;
  variantDescription: string;
  size: string;
  color: string;
  quantityReceived: number;
  unitCost: number;
  subtotal: number;
}
