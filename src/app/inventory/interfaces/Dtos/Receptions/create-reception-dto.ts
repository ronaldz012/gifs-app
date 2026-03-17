export default interface createReceptionDto {
   branchId: number;
   notes: string;
   items: Item[];
}

export interface Item {
   productId?: number;
   newProduct?: NewProduct;
   variants: Variants[];
}

export interface NewProduct {
   name: string;
   description: string;
   categoryId: number;
   brandId: number;
   unitMeasurementSin?: number;
   economicActivity?: string;
   productCodeSin?: number;
}

export interface Variants {
   productVariantId?: number;
   newVariant?: NewVariant;
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
