
// Define la entidad base
import {BaseQueryDto} from './base-query-dto';

export interface Category {
  id: number;
  name: string;
}
export interface CategoryQuery extends BaseQueryDto {

}


