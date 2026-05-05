import {Gender} from '../../interfaces/gender';

export interface UpdateProductDto {
  name?:        string,
  description?: string,
  basePrice?:   number,
  gender?:      Gender ,
  categoryId?:  number | null,
  brandId?:     number | null,
}
