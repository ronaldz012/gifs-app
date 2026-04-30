import { Component, inject, HostListener, signal, afterNextRender} from '@angular/core';
import { RouterLink } from '@angular/router';
import SideMenuOption from './side-menu-option/side-menu-option';
import { AuthService } from '../auth/auth-service';

import { Module } from '../auth/interfaces/Respones/LoginResponse';
import {SideBarService} from '../Dashboard/services/side-bar-service';

@Component({
  selector: 'app-sidebar',
  imports: [SideMenuOption],
  templateUrl: './sidebar.html',
})
export default class Sidebar {
  readonly authService  = inject(AuthService);
  readonly sidebarSvc   = inject(SideBarService);
  readonly modules      = signal<Module[]>(this.authService.getModules());
  readonly ready        = signal(false);

  constructor() {
    afterNextRender(() => this.ready.set(true));
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.sidebarSvc.close(); }
}
