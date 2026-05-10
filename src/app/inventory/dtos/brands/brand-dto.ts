import {BaseQueryDto} from '../base-query-dto';

export interface Brand {
  id: GUID;
  name: string;
  description: string;
}
export interface BrandQuery extends BaseQueryDto {

}
