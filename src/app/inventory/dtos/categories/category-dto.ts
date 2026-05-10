
// Define la entidad base
import {BaseQueryDto} from '../base-query-dto';

export interface Category {
  id: GUID;
  name: string;
  description: string;
}
export interface CategoryQuery extends BaseQueryDto {

}


