import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { Provider } from '../dtos/providers/provider';
import { CreateProviderDto } from '../dtos/providers/create-provider-dto';

@Injectable({ providedIn: 'root' })
export class ProviderService {
  private http = inject(HttpClient);
  private url = environment.BACKEND_URL + '/api/Provider';

  // ── Estado ────────────────────────────────────────────────────────────
  private _providers = signal<Provider[]>([]);
  private _loading = signal(false);
  private _loaded = signal(false);

  providers = this._providers.asReadonly();
  loading = this._loading.asReadonly();

  // ── Carga lazy ────────────────────────────────────────────────────────
  load(): void {
    if (this._loaded()) return;
    this._loaded.set(true);
    this._loading.set(true);
    this.getAll().subscribe({
      next: (data) => {
        this._providers.set(data);
        this._loading.set(false);
      },
      error: () => {
        this._loading.set(false);
        this._loaded.set(false);
      },
    });
  }

  // ── Mutaciones locales ────────────────────────────────────────────────
  add(provider: Provider): void {
    this._providers.update((list) => [...list, provider]);
  }

  // ── API ───────────────────────────────────────────────────────────────
  getAll(): Observable<Provider[]> {
    return this.http.get<Provider[]>(this.url);
  }

  create(body: CreateProviderDto): Observable<Provider> {
    return this.http.post<Provider>(this.url, body);
  }
}