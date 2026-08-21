import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BranchContextService } from '@core/services/branch-context-service';
import { environment } from 'environments/environment';
import { CurrentUserService } from './current-user-service';
import { TenantService } from './tenant-service';
import { SessionService } from './session-service';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { SessionFeatureDto, SessionState } from '../models/LoginResponse';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserService = inject(CurrentUserService);
  private readonly branchContext = inject(BranchContextService);
  private readonly tenantService = inject(TenantService);
  private readonly sessionService = inject(SessionService);
  private readonly auth0 = inject(Auth0Service);
  private readonly http = inject(HttpClient);
  private readonly url = environment.BACKEND_URL + '/api/Auth';

  authMe(): Observable<SessionState> {
    return this.http.get<SessionState>(`${this.url}/Me`);
  }

  verifyToken(token: string): Observable<{ valid: boolean; email: string }> {
    return this.http.post<{ valid: boolean; email: string }>(
      `${this.url}/verify-token`,
      JSON.stringify(token),
      { headers: { 'Content-Type': 'application/json' } },
    );
  }

  completeSetup(token: string, password: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.url}/complete`, { token, password });
  }

  logout(): void {
    this.http.post(`${this.url}/logout`, null, { withCredentials: true }).subscribe({
      error: () => {},
    });
    this.currentUserService.clear();
    this.branchContext.clear();
    this.sessionService.clear();
    this.auth0.logout({ logoutParams: { returnTo: window.location.origin } });
  }

  getFeatures(): SessionFeatureDto[] {
    const features = this.branchContext.getActiveFeatures();
    if (features.length > 0) return features;
    this.logout();
    return [];
  }
}
