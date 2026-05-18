import { Component, inject, HostListener, signal, afterNextRender} from '@angular/core';
import { RouterLink } from '@angular/router';
import SideMenuOption from './side-menu-option/side-menu-option';
import { SideBarService } from '@layout/services/side-bar-service';
import { AuthService } from '@features/auth/services/auth-service';
import { Module } from '@features/auth/models/LoginResponse';

@Component({
  selector: 'app-sidebar',
  imports: [SideMenuOption],
  template: `
    @if (sidebarSvc.isOpen()) {
      <div
        class="fixed inset-0 z-20 md:hidden bg-black/40"
        (click)="sidebarSvc.close()">
      </div>
    }

    <aside
  class="fixed top-0 left-0 z-30 md:sticky md:z-auto md:translate-x-0 flex flex-col w-64 h-screen bg-layout-sidebar text-layout-sidebar-text"      [class.transition-transform]="ready()"
      [class.duration-300]="ready()"
      [class.ease-in-out]="ready()"
      [class.-translate-x-full]="!sidebarSvc.isOpen()"
      [class.translate-x-0]="sidebarSvc.isOpen()">

      <div class="flex-1 overflow-y-auto">
        <app-side-menu-option
          [modules]="modules()"
          (onNavigate)="sidebarSvc.close()" />
      </div>

    </aside>
  `,
})
export default class Sidebar {
  readonly authService  = inject(AuthService);
  readonly sidebarSvc   = inject(SideBarService);
  readonly modules      = signal<Module[]>(this.authService.getModules());
  readonly ready        = signal(false);

  constructor() {
    // Evita el parpadeo del sidebar al calcular el layout inicial en el cliente
    afterNextRender(() => this.ready.set(true));
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { 
    this.sidebarSvc.close(); 
  }
}