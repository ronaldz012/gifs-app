import {inject, Injectable} from '@angular/core';
import {CreateProductDto} from '../dtos/products/create-product-dto';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ProductQueryParams} from '../dtos/products/product-dto';
import {PagedResult} from '../dtos/paged-result';
import {ListProductDto} from '../interfaces/listProductDto';
import {ProductSearchResult} from '../components/product-search/product-search-result';
import {ProductDetailDto} from '../dtos/products/product-detail-dto';
import {ProductVariantBySkuDto} from '../dtos/products/product-variant-by-sku-dto';
import {UpdateProductDto} from '../dtos/products/update-product-dto';
import {UpdateProductVariantDto} from '../dtos/products/update-product-variant-dto';
import {UpdateProductVariantStockDto} from '../dtos/products/update-product-variant-stock-dto';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private product_url = environment.BACKEND_URL + '/api/Product';
  private productVariant_url = environment.BACKEND_URL + '/api/ProductVariant';

  createProduct(dto : CreateProductDto): Observable<boolean> {
    return  this.http.post<boolean>(this.product_url, dto);
  }
  getProducts(query : ProductQueryParams) : Observable<PagedResult<ListProductDto>>{
    let params = new HttpParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params = params.set(key, value.toString());
      }
    });
    return this.http.get<PagedResult<ListProductDto>>(this.product_url, {params});
  }
  searchProduct(query :string )
  {
    let params = new HttpParams();
    params = params.set('request', query);
    return this.http.get<ProductSearchResult[]>(this.product_url+ '/Search', {params});
  }

  getById(number: GUID) {
    return this.http.get<ProductDetailDto>(this.product_url + '/' + number);
  }
  update(productId: GUID, dto: UpdateProductDto) {
    return this.http.put<void>(this.product_url + '/' + productId, dto);
  }

  delete(productId: GUID) {
    return this.http.delete<void>(this.product_url + '/' + productId);
  }


  /////////////VARIANTS/////////////////////////////////////////////////mber) {
  //     return this.http/


  getVariantBySku(code : string) : Observable<ProductVariantBySkuDto>{
    let params = new HttpParams();
    params = params.set('request', code);
    return this.http.get<ProductVariantBySkuDto>(this.productVariant_url,{params});
  }

  deleteVariant(productId: GUID, variantId: GUID) {
    return this.http.delete<void>(this.productVariant_url+'/'+ variantId);
  }

  updateVariant(productId: GUID, variantId: GUID, dto: UpdateProductVariantDto) {

    return this.http.put<void>(this.productVariant_url + '/' + variantId, dto);
  }

  adjustVariantStock(productId: GUID, variantId: GUID, dto: UpdateProductVariantStockDto) {

    return this.http.patch<void>(this.productVariant_url + '/' + variantId, dto);
  }
}
