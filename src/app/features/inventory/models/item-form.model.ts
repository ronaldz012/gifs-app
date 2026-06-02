import { VariantForm } from "./variant-form.model";

export interface ItemForm {
  product: ProductInfo;
  variants: VariantForm[];
}

export interface ProductInfo{
  Id: GUID | null;
  productName: string;
  categoryName: string;
  brandName: string;
  genderName: string;
  description: string;
}