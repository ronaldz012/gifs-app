import {environment} from '../../../environments/environment';
import {Injectable, signal} from '@angular/core';

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

    // client1.tu-erp.com → 'client1'
    return hostname.split('.')[0];
  }
}
