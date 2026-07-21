import {inject, Injectable} from '@angular/core';
import {CreateProductDto} from '../dtos/products/create-product-dto';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ProductQueryParams} from '../dtos/products/product-dto';
import {PagedResult} from '../dtos/paged-result';
import {ListProductDto} from '../dtos/products/list-product-dto';
import {ProductSearchResult} from '../components/product-search/product-search-result.component';
import {ProductDetailDto} from '../dtos/products/product-detail-dto';
import {ProductVariantBySkuDto} from '../dtos/products/product-variant-by-sku-dto';
import {UpdateProductDto} from '../dtos/products/update-product-dto';
import {UpdateProductVariantDto} from '../dtos/products/update-product-variant-dto';
import {UpdateProductVariantStockDto} from '../dtos/products/update-product-variant-stock-dto';
import { environment } from 'environments/environment';
import { CreateProductVariantDto, ProductVariantCreatedDto } from '../dtos/products/create-product-variant-dto';
import { CreateProductWithVariantsDto, ProductWithVariantsCreatedDto } from '../dtos/products/create-product-with-variants-dto';
import { ProductVariantDetailsDto } from '../dtos/products/product-variant-details';
import { ListStockMovementDto, StockMovementParams } from '../dtos/products/list-stock-movements-dto';
import { BranchContextService } from '@core/services/branch-context-service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {

  private http = inject(HttpClient);
  private branchContext = inject(BranchContextService);
  private product_url = environment.BACKEND_URL + '/api/Product';
  private productVariant_url = environment.BACKEND_URL + '/api/ProductVariant';


  createProductWithVariants(dto: CreateProductWithVariantsDto): Observable<ProductWithVariantsCreatedDto> {
  return this.http.post<ProductWithVariantsCreatedDto>(`${this.product_url}`, dto);
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
    const branchIds = this.branchContext.available().map(b => b.branchId).join(',');
    const headers = new HttpHeaders({ 'X-Branch-Id': branchIds });
    return this.http.get<ProductDetailDto>(this.product_url + '/' + number, { headers });
  }
  update(productId: GUID, dto: UpdateProductDto) {
    return this.http.put<void>(this.product_url + '/' + productId, dto);
  }

  delete(productId: GUID) {
    return this.http.delete<void>(this.product_url + '/' + productId);
  }


  /////////////VARIANTS/////////////////////////////////////////////////mber) {
  //     return this.http/

  

  createVariants(productId: string, dto: CreateProductVariantDto[]): Observable<ProductVariantCreatedDto[]> {
  return this.http.post<ProductVariantCreatedDto[]>(`${this.productVariant_url}/${productId}`, dto);
  }

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

  getVariantDetails(productVariantId: GUID): Observable<ProductVariantDetailsDto> {
    return this.http.get<ProductVariantDetailsDto>(this.productVariant_url+'/'+productVariantId+'/details');
  }
  getVariantMovementsById(productVariantId: GUID, query: StockMovementParams):Observable<PagedResult<ListStockMovementDto>>{
    let params = new HttpParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params = params.set(key, value.toString());
      }
    });
    return this.http.get<PagedResult<ListStockMovementDto>>(this.productVariant_url+'/'+productVariantId+'/movements', {params: params})
  }
}
