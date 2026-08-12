import { ReceptionStatus } from './stock-reception-list-dto';

export interface StockReceptionDetailDto {
  id: GUID;
  branchId: GUID;
  providerId: GUID;
  providerName: string;
  receivedAt: string;
  notes?: string;
  status: ReceptionStatus;
  totalCost: number;
  items: StockReceptionItemDetailDto[];
}

export interface StockReceptionItemDetailDto {
  id: GUID;
  productVariantId: number;
  sku: string;
  productName: string;
  variantDescription: string;
  size: string;
  color: string;
  quantityReceived: number;
  unitCost: number;
  subtotal: number;
}
