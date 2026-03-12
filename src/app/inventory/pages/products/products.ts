import {Component, inject, OnInit, signal} from '@angular/core';
import {Product} from '../../interfaces/product';
import ProductItem from '../../components/product-list/product-item/product-item';
import {ProductList} from '../../components/product-list/product-list';
import {ProductForm} from '../../components/product-form/product-form';
import {CategoryService} from '../../services/category-service';
import {Category} from '../../interfaces/Dtos/category-dto';
import {Brand} from '../../interfaces/Dtos/brand-dto';
import {BrandService} from '../../services/brand-service';

@Component({
  selector: 'app-products',
  imports: [
    ProductList, ProductForm
  ],
  templateUrl: './products.html',
  styles: ``,
})
export default class Products implements OnInit {
  categories = signal<Category[]>([]);
  brands = signal<Brand[]>([]);
  private categoryService = inject(CategoryService);
  private brandService = inject(BrandService);
  ngOnInit(): void {
    this.categoryService.getAll().subscribe(c => this.categories.set(c));
    this.brandService.GetAll().subscribe(b => this.brands.set(b));
  }



  showForm = signal(false);
  product = signal<Product>({
    id:1,
    name:"Pantalon",
    stock:2,
    price:100,
  });
}
