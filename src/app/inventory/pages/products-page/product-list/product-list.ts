import {Component, input, signal} from '@angular/core';
import ProductItem from './product-item/product-item';
import {ListProduct} from '../../../interfaces/listProduct';

@Component({
  selector: 'app-product-list',
  imports: [
    ProductItem
  ],
  templateUrl: './product-list.html',
  styles: ``,
})
export class ProductList {
  products = input<ListProduct[]>([]);
}
