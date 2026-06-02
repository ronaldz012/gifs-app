export interface Reception {
 notes:string;
 items: ReceptionGroup[]
}


export interface ReceptionGroup {             
  productId: GUID;             
  productName: string;         
  internalCode: string;     
  brandName: string;          
  categoryName: string;
  variants: ReceptionVariant[];
}
 
export interface ReceptionVariant {
  productVariantId: GUID;   
  sku: string;
  size: string;
  quantityReceived: number;
  unitCost: number;
}