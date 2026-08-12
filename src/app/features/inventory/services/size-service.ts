import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { Size } from '../dtos/sizes/size';
import { CreateSizeDto } from '../dtos/sizes/create-size-dto';

@Injectable({
  providedIn: 'root',
})
export class SizeService {
  private http = inject(HttpClient);
  private url = environment.BACKEND_URL + '/api/Size';

  // ── Estado ────────────────────────────────────────────────────────────
  private _sizes = signal<Size[]>([]);
  private _loading = signal(false);
  private _loaded = signal(false);

  sizes = this._sizes.asReadonly();
  loading = this._loading.asReadonly();

  // ── Carga lazy ────────────────────────────────────────────────────────
  load(): void {
    if (this._loaded()) return;
    this._loaded.set(true);
    this._loading.set(true);
    this.getAll().subscribe({
      next: (data) => {
        this._sizes.set(data);
        this._loading.set(false);
      },
      error: () => {
        this._loading.set(false);
        this._loaded.set(false);
      },
    });
  }

  // ── Mutaciones locales ────────────────────────────────────────────────
  add(size: Size): void {
    this._sizes.update((list) => [...list, size]);
  }

  // ── API ───────────────────────────────────────────────────────────────
  getAll(): Observable<Size[]> {
    return this.http.get<Size[]>(this.url);
  }

  create(body: CreateSizeDto): Observable<Size> {
    return this.http.post<Size>(this.url, body);
  }
}
