import { Gender } from "../interfaces/gender";
import { VariantForm } from "./variant-form.model";

export interface NewProductModelForm {
newProduct: newProductDataModel;
variants:VariantForm[];
samePriceForAll: boolean;
uniquePrice: number | null;
}
export interface newProductDataModel{
name: string;
description:string;
categoryId:GUID;
categoryName: string;
brandId: GUID;
brandName: string;
gender: number | null;
}