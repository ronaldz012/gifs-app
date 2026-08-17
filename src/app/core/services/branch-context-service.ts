import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { BranchDto } from '../interfaces/branch.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Branch, SessionFeatureDto } from '@features/auth/models/LoginResponse';

@Injectable({
  providedIn: 'root',
})
export class BranchContextService {
  private readonly _available = signal<Branch[]>([]);
  private readonly _active = signal<Branch | null>(null);

  readonly available = this._available.asReadonly();
  readonly active = this._active.asReadonly();
  private ACTIVE_BRANCH_ID_KEY = 'active_branch_id';
  private http = inject(HttpClient);
  private readonly URL = environment.BACKEND_URL + '/api/Branch';

  setAvailable(branches: Branch[]): void {
    this._available.set(branches);
  }

  setActive(branch: Branch): void {
    this._active.set(branch);
    localStorage.setItem(this.ACTIVE_BRANCH_ID_KEY, String(branch.branchId));
  }

  getActiveBranchId(): string | null {
    return this._active()?.branchId?.toString() ?? null;
  }

  getBranchIds(branches: Branch[]): string {
    return branches.map((b) => b.branchId).join(',');
  }

  private normalizeRoutes(branches: Branch[]): Branch[] {
    return branches.map((b) => ({
      ...b,
      features: b.features.map((f) => {
        const module = f.module.replace(/^\//, '').toLowerCase();
        let route = f.route.replace(/^\//, '');
        if (!route.startsWith(module + '/')) {
          route = `${module}/${route}`;
        }
        return { ...f, module, route };
      }),
    }));
  }

  initialize(branches: Branch[]): void {
    branches = this.normalizeRoutes(branches);
    this._available.set(branches);

    const savedId = localStorage.getItem(this.ACTIVE_BRANCH_ID_KEY);
    const saved = branches.find((b) => b.branchId === savedId);
    this._active.set(saved ?? branches[0] ?? null);

    if (this._active()) {
      localStorage.setItem(this.ACTIVE_BRANCH_ID_KEY, String(this._active()!.branchId));
    }
  }

  clear(): void {
    this._available.set([]);
    this._active.set(null);
    localStorage.removeItem(this.ACTIVE_BRANCH_ID_KEY);
  }

  getActiveFeatures(): SessionFeatureDto[] {
    return this._active()?.features ?? [];
  }

  getBranches(): Observable<BranchDto[]> {
    return this.http.get<BranchDto[]>(this.URL);
  }
}
