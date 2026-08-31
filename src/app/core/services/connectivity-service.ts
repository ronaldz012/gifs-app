import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Observable, of, timeout, catchError, map, shareReplay, tap } from 'rxjs';
import { ToastService } from './toast-service';

const PROBE_URL = 'https://www.gstatic.com/generate_204';

@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private healthUrl = `${environment.BACKEND_URL}/api/Auth/health`;

  readonly isOnline = signal(true);
  readonly status = signal<'online' | 'no-internet' | 'server-down'>('online');

  private probeInFlight: Observable<boolean> | null = null;
  private lastToastAt = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      if (!navigator.onLine) {
        this.isOnline.set(false);
        this.status.set('no-internet');
      }
      window.addEventListener('online', () => {
        this.isOnline.set(true);
        this.status.set('online');
      });
      window.addEventListener('offline', () => {
        this.isOnline.set(false);
        this.status.set('no-internet');
        this.toastOnce('Sin conexión. Verificá tu WiFi o datos móviles.');
      });
    }
  }

  reportFailure(): void {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.isOnline.set(false);
      this.status.set('no-internet');
      this.toastOnce('Sin conexión. Verificá tu WiFi o datos móviles.');
      return;
    }
    this.probeExternal().subscribe((hasInternet) => {
      this.isOnline.set(false);
      this.status.set(hasInternet ? 'server-down' : 'no-internet');
      this.toastOnce(hasInternet ? 'No pudimos conectar con el servidor.' : 'Sin conexión. Verificá tu WiFi o datos móviles.');
    });
  }

  reportSuccess(): void {
    this.isOnline.set(true);
    this.status.set('online');
  }

  checkNow(): Observable<boolean> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.isOnline.set(false);
      this.status.set('no-internet');
      return of(false);
    }
    return this.http.get(this.healthUrl, { observe: 'response', responseType: 'text' as const }).pipe(
      timeout(3000),
      map((res) => {
        const ok = !!res && res.status >= 200 && res.status < 300;
        this.isOnline.set(ok);
        this.status.set(ok ? 'online' : 'server-down');
        return ok;
      }),
      catchError(() => {
        this.isOnline.set(false);
        this.status.set(typeof navigator !== 'undefined' && !navigator.onLine ? 'no-internet' : 'server-down');
        return of(false);
      }),
    );
  }

  private probeExternal(): Observable<boolean> {
    if (this.probeInFlight) return this.probeInFlight;
    this.probeInFlight = this.http.get(PROBE_URL, { responseType: 'text' }).pipe(
      timeout(3000),
      map(() => true),
      catchError(() => of(false)),
      tap({ finalize: () => (this.probeInFlight = null) }),
      shareReplay(1),
    );
    this.probeInFlight.subscribe();
    return this.probeInFlight;
  }

  private toastOnce(message: string): void {
    const now = Date.now();
    if (now - this.lastToastAt < 5000) return;
    this.lastToastAt = now;
    this.toast.warning(message);
  }
}
