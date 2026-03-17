import {Component, input} from '@angular/core';
import {ListProduct} from '../../../../interfaces/listProduct';

@Component({
  selector: 'app-product-item',
  imports: [],
  templateUrl: './product-item.html',
  styles: ``,
})
export default class ProductItem {
  product = input.required<ListProduct>();
}
