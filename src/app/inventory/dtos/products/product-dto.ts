import { Gender } from '../../interfaces/gender';
import { BaseQueryDto } from '../base-query-dto';

export interface ProductQueryParams extends BaseQueryDto {
  categoryId?: number;
  brandId?: number;
  gender?: Gender;
  lowStock?: boolean;
}
