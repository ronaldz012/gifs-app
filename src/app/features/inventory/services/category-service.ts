import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Category } from '../dtos/categories/category-dto';
import { map, Observable } from 'rxjs';
import { PagedResult } from '../dtos/paged-result';
import { CreateCategoryDto } from '../dtos/categories/create-category-dto';

@Injectable({ providedIn: 'root' })
export class CategoryService {

  private http = inject(HttpClient);
  private url  = environment.BACKEND_URL + '/api/Category';

  // ── Estado ────────────────────────────────────────────────────────────
  private _categories = signal<Category[]>([]);
  private _loading    = signal(false);
  private _loaded     = signal(false);

  categories = this._categories.asReadonly();
  loading    = this._loading.asReadonly();

  // ── Carga lazy ────────────────────────────────────────────────────────
  load(): void {
    if (this._loaded()) return;
    this._loading.set(true);
    this.getAll().subscribe({
      next: (data) => {
        this._categories.set(data);
        this._loaded.set(true);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  // ── Mutaciones locales ────────────────────────────────────────────────
  add(category: Category): void {
    this._categories.update(list => [...list, category]);
  }

  remove(id: GUID): void {
    this._categories.update(list => list.filter(c => c.id !== id));
  }

  update(category: Category): void {
    this._categories.update(list =>
      list.map(c => c.id === category.id ? category : c)
    );
  }

  // ── API ───────────────────────────────────────────────────────────────
  getAll(): Observable<Category[]> {
    return this.http.get<PagedResult<Category>>(this.url).pipe(
      map(result => result.items)
    );
  }

  create(createCategory: CreateCategoryDto): Observable<Category> {
    return this.http.post<Category>(this.url, createCategory);
  }
}