import {inject, Injectable } from '@angular/core';
import {CreateColorDto} from '../dtos/Colors/create-color-dto';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {Color} from '../dtos/Colors/color';
import {Brand, BrandQuery} from '../dtos/brands/brand-dto';
import {PagedResult} from '../dtos/paged-result';

@Injectable({
  providedIn: 'root',
})
export class ColorService {

  private  url = environment.BACKEND_URL + '/api/Color';
  private http = inject(HttpClient)
  create(body: CreateColorDto):Observable<Color> {
    return this.http.post<Color>(this.url, body);
  }
  getColors(query : BrandQuery ): Observable<PagedResult<Color>>
  {
    let params = new HttpParams()

    Object.entries(query).forEach(([key, value]) => {
      if(value !==null && value !== undefined) {
        params = params.set(key, value.toString());
      }
    })
    return this.http.get<PagedResult<Color>>(this.url, {params});
  }

  getAll(): Observable<Color[]>
  {
    return this.getColors({isPaged:false}).pipe(
      map(result => result.items)
    )
  }
}
