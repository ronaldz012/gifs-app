import {Injectable, signal} from '@angular/core';
import { User } from '../models/LoginResponse';

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private readonly _user = signal<User | null>(null);

  readonly user = this._user.asReadonly();

  get username(): string { return this._user()?.username ?? ''; }
  get email(): string { return this._user()?.email ?? ''; }
  get id(): GUID { return this._user()?.id ?? ''; }

  set(user: User): void {
    this._user.set(user);
  }

  clear(): void {
    this._user.set(null);
  }
}
