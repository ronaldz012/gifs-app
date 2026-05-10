import { Gender } from '../../interfaces/gender';
import { BaseQueryDto } from '../base-query-dto';

export interface ProductQueryParams extends BaseQueryDto {
  categoryId?: GUID;
  brandId?: GUID;
  gender?: Gender;
  lowStock?: boolean;
}
