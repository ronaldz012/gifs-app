import { inject, Injectable, signal } from '@angular/core';
import { Brand } from '../dtos/brands/brand-dto';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'environments/environment';
import { CreateBrandDto } from '../dtos/brands/create-brand-dto';
import { UpdateBrandDto } from '../dtos/brands/update-brand-dto';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BrandService {
  private http = inject(HttpClient);
  private url = environment.BACKEND_URL + '/api/Brand';

  // ── Estado ────────────────────────────────────────────────────────────
  private _brands = signal<Brand[]>([]);
  private _loading = signal(false);
  private _loaded = signal(false);

  brands = this._brands.asReadonly();
  loading = this._loading.asReadonly();

  // ── Carga lazy ────────────────────────────────────────────────────────
  load(): void {
    if (this._loaded()) return;
    this._loaded.set(true);
    this._loading.set(true);
    this.getAll().subscribe({
      next: (data) => {
        this._brands.set(data);
        this._loading.set(false);
      },
      error: () => {
        this._loading.set(false);
        this._loaded.set(false);
      },
    });
  }

  // ── Mutaciones locales ────────────────────────────────────────────────
  add(brand: Brand): void {
    this._brands.update((list) => [...list, brand]);
  }

  remove(id: GUID): void {
    this._brands.update((list) => list.filter((b) => b.id !== id));
  }

  update(brand: Brand): void {
    this._brands.update((list) => list.map((b) => (b.id === brand.id ? brand : b)));
  }

  // ── API ───────────────────────────────────────────────────────────────
  getAll(includeInactive?: boolean): Observable<Brand[]> {
    let params = new HttpParams();
    if (includeInactive) {
      params = params.set('includeInactive', 'true');
    }
    return this.http.get<Brand[]>(this.url, { params });
  }

  create(newBrand: CreateBrandDto): Observable<Brand> {
    return this.http.post<Brand>(this.url, newBrand);
  }

  updateItem(id: GUID, dto: UpdateBrandDto): Observable<boolean> {
    return this.http.put<boolean>(`${this.url}/${id}`, dto);
  }

  updateStatus(id: GUID): Observable<boolean> {
    return this.http.patch<boolean>(`${this.url}/${id}/status`, undefined);
  }
}
