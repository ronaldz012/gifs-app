import {BaseQueryDto} from '../base-query-dto';

export interface ProductQuery  extends  BaseQueryDto{
  categoryId?:number |null;
}
