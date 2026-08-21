import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Observable, of, map, tap, catchError, throwError, finalize } from 'rxjs';
import { SessionState } from '../models/LoginResponse';
import { CurrentUserService } from './current-user-service';
import { BranchContextService } from '@core/services/branch-context-service';


@Injectable({ providedIn: 'root' })
export class SessionService {
  private http = inject(HttpClient);
  private currentUser = inject(CurrentUserService);
  private branchContext = inject(BranchContextService);
  private url = environment.BACKEND_URL + '/api/Auth';

  private _restored = false;
  private inflight$: Observable<void> | null = null;

  restore(): Observable<void> {
    if (this._restored) return of(void 0);
    if (this.inflight$) return this.inflight$;

    this.inflight$ = this.http.get<SessionState>(`${this.url}/Me`).pipe(
      tap(res => {
        const session = res;
        this.currentUser.set(session.user);
        this.branchContext.initialize(session.branches);
        this._restored = true;
      }),
      map(() => void 0),
      catchError((err) => {
        this._restored = false;
        this.currentUser.clear();
        this.branchContext.clear();
        return throwError(() => err);
      }),
      finalize(() => { this.inflight$ = null; })
    );
    return this.inflight$;
  }

  clear(): void {
    this._restored = false;
    this.inflight$ = null;
  }

  markRestored(): void {
    this._restored = true;
  }
}
