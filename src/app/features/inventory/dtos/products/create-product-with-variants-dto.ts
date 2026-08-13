import { Gender } from '../../interfaces/gender';
import { CreateProductVariantDto, ProductVariantCreatedDto } from './create-product-variant-dto';

export interface CreateProductWithVariantsDto {
  name: string;
  description: string;
  categoryId: GUID;
  brandId: GUID;
  gender: Gender;
  variants: CreateProductVariantDto[];
}

export interface ProductWithVariantsCreatedDto {
  id: GUID;
  name: string;
  internalCode: string;
  brandName: string;
  categoryName: string;
  isActive?: boolean;
  variants: ProductVariantCreatedDto[];
}
