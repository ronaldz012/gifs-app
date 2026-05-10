export default interface createReceptionDto {
   branchId: GUID;
   notes: string;
   items: Item[];
}

export interface Item {
   productId: GUID | null;
   newProduct: NewProduct | null;
   variants: Variants[];
}

export interface NewProduct {
   name: string;
   description: string;
   categoryId: GUID;
   brandId: GUID;
   basePrice: number;
   gender : number;
   unitMeasurementSin?: number;
   economicActivity?: string;
   productCodeSin?: number;
}

export interface Variants {
   productVariantId: GUID | null;
   newVariant: NewVariant | null;
   quantityReceived: number;
   unitCost: number;
}

export interface NewVariant {
   productId: number;
   description: string;
   size: string;
   color: string;
   price: number;
}
