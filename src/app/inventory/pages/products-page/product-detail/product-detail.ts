import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { ProductService } from '../../../services/product-service';
import { ProductDetailDto, ProductVariantDto } from '../../../dtos/products/product-detail-dto';
import { ProductDetailInfo } from './product-detail-info';
import {ProductDetailVariant} from './product-detail-variant';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-product-detail',
  imports: [ProductDetailInfo, ProductDetailVariant],
  template: `
    @if (loading()) {
      <div class="flex items-center justify-center py-20 text-gray-400 text-sm">
        Cargando...
      </div>
    }

    @if (!loading() && product(); as p) {
      <div class="flex flex-col gap-4">

        <app-product-detail-info
          [product]="p"

        />

        <app-product-detail-variant
          [product]="p"
        />

      </div>
    }
  `,
  styles: ``,
})
export default class ProductDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);


  productId = signal<number | null>(null);
  product = signal<ProductDetailDto | null>(null);
  loading = signal(true);

  ngOnInit(): void {

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.productId.set(id);
      this.productService.getById(id).subscribe({
        next: (p) => {
          this.product.set(p);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }
}
