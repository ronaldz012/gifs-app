export default interface CreateReceptionDto {
  notes?: string;
  items: CreateReceptionItemDto[];
}

export  interface CreateReceptionItemDto {
  productVariantId: string;
  quantityReceived: number;
  unitCost: number;
}