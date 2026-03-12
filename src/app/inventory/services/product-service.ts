import {inject, Injectable} from '@angular/core';
import {CreateProductDto} from '../interfaces/Dtos/create-product-dto';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private url = environment.BACKEND_URL + '/api/Product';

  CreateProduct(dto : CreateProductDto): Observable<boolean> {
    return  this.http.post<boolean>(this.url, dto);
  }
}
