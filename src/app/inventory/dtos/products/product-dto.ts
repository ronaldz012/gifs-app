import {BaseQueryDto} from '../base-query-dto';

export interface ProductQueryParams extends  BaseQueryDto{
  categoryId?: number;
  brandId?: number;
  gender?: 'Unisex' | 'Male' | 'Female';
  lowStock?: boolean;
}
