import {Injectable, signal} from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly tenant = signal<string>('');

  constructor() {
  }

  getTenant(): string {
    return this.tenant();
  }


}
