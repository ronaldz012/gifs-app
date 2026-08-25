import { Injectable, signal, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { interval, Subscription, Observable, catchError, map, of, timeout } from 'rxjs';

export type OfflineReason = 'offline' | 'backend-down' | null;

@Injectable({ providedIn: 'root' })
export class ConnectivityService implements OnDestroy {
  private http = inject(HttpClient);
  private healthUrl = `${environment.BACKEND_URL}/api/Auth/health`;

  readonly isOnline = signal(true);
  readonly reason = signal<OfflineReason>(null);

  private pollSub: Subscription | null = null;
  private boundOnline = () => this.check();
  private boundOffline = () => this.markOffline('offline');

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline.set(navigator.onLine);
      window.addEventListener('online', this.boundOnline);
      window.addEventListener('offline', this.boundOffline);
    }
    this.startPolling();
    this.check();
    if (typeof navigator !== 'undefined' && !navigator.onLine) this.markOffline('offline');
  }

  markOffline(reason: OfflineReason = 'backend-down'): void {
    this.reason.set(reason);
    if (!this.isOnline()) return;
    this.isOnline.set(false);
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
        if (ok) {
          this.isOnline.set(true);
          this.reason.set(null);
        } else {
          this.markOffline('backend-down');
        }
        return ok;
      }),
      catchError(() => {
        const r: OfflineReason = typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'backend-down';
        this.markOffline(r);
        return of(false);
      }),
    );
  }

  private check(): void {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.markOffline('offline');
      return;
    }
    this.http.get(this.healthUrl, { observe: 'response', responseType: 'text' as const }).pipe(
      timeout(6000),
      catchError(() => of(null)),
    ).subscribe((res) => {
      if (res && res.status >= 200 && res.status < 300) {
        this.isOnline.set(true);
        this.reason.set(null);
      } else {
        const r: OfflineReason = typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'backend-down';
        this.markOffline(r);
      }
    });
  }

  private startPolling(): void {
    if (this.pollSub) return;
    this.pollSub = interval(5000).subscribe(() => this.check());
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = null;
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.boundOnline);
      window.removeEventListener('offline', this.boundOffline);
    }
  }
}
