export default interface CreateReceptionDto {
  notes?: string;
  providerId: GUID;
  items: CreateReceptionItemDto[];
}

export  interface CreateReceptionItemDto {
  productVariantId: string;
  quantityReceived: number;
  unitCost: number;
}
