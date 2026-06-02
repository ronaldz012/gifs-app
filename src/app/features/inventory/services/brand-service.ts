import { inject, Injectable, signal } from '@angular/core';
import { Brand, BrandQuery } from '../dtos/brands/brand-dto';
import { PagedResult } from '../dtos/paged-result';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'environments/environment';
import { CreateBrandDto } from '../dtos/brands/create-brand-dto';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BrandService {

  private http = inject(HttpClient);
  private url  = environment.BACKEND_URL + '/api/Brand';

  // ── Estado ────────────────────────────────────────────────────────────
  private _brands  = signal<Brand[]>([]);
  private _loading = signal(false);
  private _loaded  = signal(false);

  brands  = this._brands.asReadonly();
  loading = this._loading.asReadonly();

  // ── Carga lazy ────────────────────────────────────────────────────────
  load(): void {
    if (this._loaded()) return;
    this._loading.set(true);
    this.getAll().subscribe({
      next: (data) => {
        this._brands.set(data);
        this._loaded.set(true);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  // ── Mutaciones locales ────────────────────────────────────────────────
  add(brand: Brand): void {
    this._brands.update(list => [...list, brand]);
  }

  remove(id: GUID): void {
    this._brands.update(list => list.filter(b => b.id !== id));
  }

  update(brand: Brand): void {
    this._brands.update(list =>
      list.map(b => b.id === brand.id ? brand : b)
    );
  }

  // ── API ───────────────────────────────────────────────────────────────
  getBrands(query: BrandQuery): Observable<PagedResult<Brand>> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== null && value !== undefined)
        params = params.set(key, value.toString());
    });
    return this.http.get<PagedResult<Brand>>(this.url, { params });
  }

  getAll(): Observable<Brand[]> {
    return this.getBrands({ isPaged: false }).pipe(
      map(result => result.items)
    );
  }

  create(newBrand: CreateBrandDto): Observable<Brand> {
    return this.http.post<Brand>(this.url, newBrand);
  }
}