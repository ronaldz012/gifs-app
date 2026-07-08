import { BaseQueryDto } from '@features/inventory/dtos/base-query-dto';

export interface UserQueryParams extends BaseQueryDto {
  isActive?: boolean | null;
}
