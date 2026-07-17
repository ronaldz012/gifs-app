import {Component, input, output} from '@angular/core';
import {ListProductDto} from '../../../../dtos/products/list-product-dto';
import {CurrencyPipe} from '@angular/common';

@Component({
  selector: 'app-product-item',
  imports: [
    CurrencyPipe
  ],
  templateUrl: './product-item.html',
  styles: ``,
})
export default class ProductItem {
  product       = input.required<ListProductDto>();
  index         = input<number>(0);

  viewDetail    = output<GUID>();
  viewMovements = output<GUID>();


}
