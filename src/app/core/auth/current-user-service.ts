import {User} from './interfaces/user';
import {Injectable, signal} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private readonly STORAGE_KEY = 'current_user';
  private readonly _user = signal<User | null>(this.loadFromStorage());

  readonly user = this._user.asReadonly();

  get username(): string { return this._user()?.userName ?? ''; }
  get email(): string { return this._user()?.email ?? ''; }
  get id(): number { return this._user()?.id ?? 0; }

  set(user: User): void {
    this._user.set(user);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  clear(): void {
    this._user.set(null);
    localStorage.removeItem(this.STORAGE_KEY);

  }

  private loadFromStorage(): User | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); }
    catch { return null; }
  }
}

