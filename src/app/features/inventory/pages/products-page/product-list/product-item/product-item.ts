import { Component, input, output } from '@angular/core';
import { ListProductDto } from '../../../../dtos/products/list-product-dto';

@Component({
  selector: 'app-product-item',
  imports: [],
  templateUrl: './product-item.html',
  styles: ``,
})
export default class ProductItem {
  product = input.required<ListProductDto>();
  index = input<number>(0);

  viewDetail = output<GUID>();
  viewMovements = output<GUID>();
}
