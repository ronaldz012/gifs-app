export default interface createReceptionDto {
   branchId: GUID;
   notes: string;
   items: CreateReceptionItem[];
}

export interface CreateReceptionItem {
   productId: GUID | null;
   newProduct: NewProductDto | null;
   variants: StockReceptionVariantsDto[];
}

export interface NewProductDto {
   name: string;
   description: string;
   categoryId: GUID;
   brandId: GUID;
   gender : number;
   unitMeasurementSin?: number;
   economicActivity?: string;
   productCodeSin?: number;
}

export interface StockReceptionVariantsDto {
   productVariantId: GUID | null;
   newVariant: NewProductVariantDto | null;
   quantityReceived: number;
   unitCost: number;
}

export interface NewProductVariantDto {
   description: string;
   size: string;
   colorId: GUID;
   price: number;
}
