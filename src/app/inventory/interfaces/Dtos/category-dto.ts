
// Define la entidad base
import {QueryBaseDto} from './query-base-dto';

export interface Category {
  id: number;
  name: string;
}
export interface CategoryQuery extends QueryBaseDto {

}


