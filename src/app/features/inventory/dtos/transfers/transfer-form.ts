export interface TransferForm {
  toBranchId: GUID | null;
  notes: string;
  items: TransferItemForm[];
}
export interface TransferItemForm {
  productVariantId: GUID;
  quantityRequested: number;
}
