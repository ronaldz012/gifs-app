import {Component, inject, signal} from '@angular/core';
import { environment } from '../../../environments/environment.development';
import {RouterLink} from '@angular/router';
import SideMenuOption from './side-menu-option/side-menu-option';
import {AuthService} from '../auth/auth-service';
import {Module} from '../auth/interfaces/Respones/LoginResponse';

@Component({
  selector: 'app-sidebar',
  imports: [SideMenuOption, RouterLink],
  templateUrl: './sidebar.html',
})
export default class Sidebar {
  // En tu componente.ts
  constructor() {
  console.log('Sidebar');
  }
  authService = inject(AuthService);

  modules = signal<Module[]>(this.authService.getModules())
}
