import {inject, Injectable, signal} from '@angular/core';
import {Observable} from 'rxjs';
import {BranchDto} from '../interfaces/branch.model';
import {HttpClient} from '@angular/common/http';
import {environment} from 'environments/environment';
import { Branch, Module } from '@features/auth/models/LoginResponse';

@Injectable({
  providedIn: 'root',
})
export class BranchContextService {
  private readonly _available = signal<Branch[]>([]);
  private readonly _active = signal<Branch | null>(null);

  readonly available = this._available.asReadonly();
  readonly active = this._active.asReadonly();
  private ACTIVE_BRANCH_ID_KEY = 'active_branch_id'
  private BRANCHES_KEY = 'branches'
  private  http = inject(HttpClient)
  private readonly URL = environment.BACKEND_URL+'/api/Branch';

  setAvailable(branches: Branch[]): void {
    this._available.set(branches);
  }

  setActive(branch: Branch): void {
    this._active.set(branch);
    localStorage.setItem(this.ACTIVE_BRANCH_ID_KEY, String(branch.branchId));
  }

  // para el interceptor
  getActiveBranchId(): string | null {
    return this._active()?.branchId?.toString() ?? null;
  }

  // para estadísticas: pasa los branches que quierasget
  getBranchIds(branches: Branch[]): string {
    return branches.map(b => b.branchId).join(',');
  }

  // restaurar desde localStorage al arrancar la app
  restoreFromStorage(branches: Branch[]): void {
    branches = this.normalizeRoutes(branches);
    const savedId = localStorage.getItem(this.ACTIVE_BRANCH_ID_KEY);
    const saved = branches.find(b => b.branchId === savedId);
    this.setAvailable(branches);
    this.setActive(saved ?? branches[0] ?? null);
  }


  private normalizeRoutes(branches: Branch[]): Branch[] {
    return branches.map(b => ({
      ...b,
      modules: b.modules.map(m => ({
        ...m,
        route: m.route.replace(/^\//, ''),
        features: m.features.map(f => ({
          ...f,
          route: f.route.replace(/^\//, ''),
        })),
      })),
    }));
  }

  // Reemplaza setAvailable + setActive + localStorage suelto
  initialize(branches: Branch[]): void {
    branches = this.normalizeRoutes(branches);
    localStorage.setItem(this.BRANCHES_KEY, JSON.stringify(branches));
    console.log("BRANCH EN LOCAL STORAGE: ",localStorage.getItem(this.BRANCHES_KEY));
    this._available.set(branches);

    const savedId = localStorage.getItem(this.ACTIVE_BRANCH_ID_KEY);
    const saved = branches.find(b => b.branchId === savedId);
    this._active.set(saved ?? branches[0] ?? null);

    if (this._active()) {
      localStorage.setItem(this.ACTIVE_BRANCH_ID_KEY, String(this._active()!.branchId));
    }
  }

  clear(): void {
    localStorage.removeItem(this.BRANCHES_KEY);
    //localStorage.removeItem('active_branch_id');
    this._available.set([]);
    this._active.set(null);
  }

  getActiveModules(): Module[] {
    return this._active()?.modules ?? [];
  }

  getBranches():Observable<BranchDto[]> {
    return this.http.get<BranchDto[]>(this.URL);
  }
}
