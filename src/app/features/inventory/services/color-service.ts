import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { map, Observable } from 'rxjs';
import { Color } from '../dtos/colors/color';
import { CreateColorDto } from '../dtos/colors/create-color-dto';
import { PagedResult } from '../dtos/paged-result';

// Asegúrate de tener GUID disponible o cámbialo por string/number según corresponda
type GUID = string; 

@Injectable({
  providedIn: 'root',
})
export class ColorService {
  private http = inject(HttpClient);
  private url = environment.BACKEND_URL + '/api/Color';

  // ── Estado ────────────────────────────────────────────────────────────
  private _colors = signal<Color[]>([]);
  private _loading = signal(false);
  private _loaded = signal(false);

  colors = this._colors.asReadonly();
  loading = this._loading.asReadonly();

  // ── Carga lazy ────────────────────────────────────────────────────────
  load(): void {
    if (this._loaded()) return;
    this._loading.set(true);
    this.getAll().subscribe({
      next: (data) => {
        this._colors.set(data);
        this._loaded.set(true);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  // ── Mutaciones locales ────────────────────────────────────────────────
  add(color: Color): void {
    this._colors.update(list => [...list, color]);
  }

  remove(id: GUID): void {
    this._colors.update(list => list.filter(c => c.id !== id));
  }

  update(color: Color): void {
    this._colors.update(list =>
      list.map(c => c.id === color.id ? color : c)
    );
  }

  // ── API ───────────────────────────────────────────────────────────────
  getAll(): Observable<Color[]> {
    return this.http.get<PagedResult<Color>>(this.url).pipe(
      map(result => result.items)
    );
  }

  create(body: CreateColorDto): Observable<Color> {
    return this.http.post<Color>(this.url, body);
  }
}