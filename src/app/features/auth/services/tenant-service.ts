import {Injectable, signal} from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly tenant = signal<string>('');

  constructor() {
    this.tenant.set(this.resolveTenant());
  }

  getTenant(): string {
    return this.tenant();
  }

  private resolveTenant(): string {
    const hostname = window.location.hostname;

    if (hostname === 'localhost') {
      return environment.tenant;
    }

    return hostname.split('.')[0];
  }
}
