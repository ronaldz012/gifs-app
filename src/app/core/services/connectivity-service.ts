import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Observable, catchError, map, of, timeout } from 'rxjs';

export type OfflineReason = 'offline' | 'backend-down' | null;

@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  private http = inject(HttpClient);
  private healthUrl = `${environment.BACKEND_URL}/api/Auth/health`;

  readonly isOnline = signal(true);
  readonly reason = signal<OfflineReason>(null);

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline.set(navigator.onLine);
      window.addEventListener('online', () => {
        this.isOnline.set(true);
        this.reason.set(null);
      });
      window.addEventListener('offline', () => {
        this.isOnline.set(false);
        this.reason.set('offline');
      });
    }
  }

  markOffline(reason: OfflineReason = 'backend-down'): void {
    this.reason.set(reason);
    if (!this.isOnline()) return;
    this.isOnline.set(false);
  }

  markOnline(): void {
    this.isOnline.set(true);
    this.reason.set(null);
  }

  checkNow(): Observable<boolean> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.markOffline('offline');
      return of(false);
    }
    return this.http.get(this.healthUrl, { observe: 'response', responseType: 'text' as const }).pipe(
      timeout(3000),
      map((res) => {
        const ok = !!res && res.status >= 200 && res.status < 300;
        if (ok) this.markOnline();
        else this.markOffline('backend-down');
        return ok;
      }),
      catchError(() => {
        const r: OfflineReason = typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'backend-down';
        this.markOffline(r);
        return of(false);
      }),
    );
  }
}
