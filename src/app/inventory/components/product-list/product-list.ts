import {Component, input, signal} from '@angular/core';
import ProductItem from './product-item/product-item';
import {Product} from '../../interfaces/product';

@Component({
  selector: 'app-product-list',
  imports: [
    ProductItem
  ],
  templateUrl: './product-list.html',
  styles: ``,
})
export class ProductList {
  products = input<Product[]>([]);
}
