import { Gender } from '../../interfaces/gender';
import { BaseQueryDto } from '../base-query-dto';

export enum ProductSortBy {
  CreatedAt = 0,
  Stock = 1,
}

export interface ProductQueryParams extends BaseQueryDto {
  filter?: string;
  categoryId?: GUID;
  brandId?: GUID;
  gender?: Gender;
  includeInactive?: boolean;
  sortBy?: ProductSortBy;
  sortDescending?: boolean;
}
