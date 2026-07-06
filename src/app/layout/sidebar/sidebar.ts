import { Component, inject, HostListener, signal, afterNextRender} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import SideMenuOption from './side-menu-option/side-menu-option';
import { SideBarService } from '@layout/services/side-bar-service';
import { AuthService } from '@features/auth/services/auth-service';
import { CurrentUserService } from '@features/auth/services/current-user-service';
import { Module } from '@features/auth/models/LoginResponse';

@Component({
  selector: 'app-sidebar',
  imports: [SideMenuOption, RouterLink, RouterLinkActive],
  template: `
    @if (sidebarSvc.isOpen()) {
      <div
        class="fixed inset-0 z-20 md:hidden bg-black/40"
        (click)="sidebarSvc.close()">
      </div>
    }

    <aside
      class="fixed top-0 left-0 z-30 md:sticky md:z-auto md:translate-x-0 flex flex-col w-64 h-screen bg-layout-sidebar text-layout-sidebar-text"
      [class.transition-transform]="ready()"
      [class.duration-300]="ready()"
      [class.ease-in-out]="ready()"
      [class.-translate-x-full]="!sidebarSvc.isOpen()"
      [class.translate-x-0]="sidebarSvc.isOpen()">

      <!-- CABECERA DEL SIDEBAR (Solo móvil para el botón de cerrar) -->
      <div class="flex items-center justify-end p-4 md:hidden">
        <button 
          (click)="sidebarSvc.close()" 
          class="p-2 rounded-md hover:bg-white/10 text-layout-sidebar-text focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label="Cerrar menú">
          <!-- Icono de X (SVG) -->
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto flex flex-col">
        <app-side-menu-option
          [modules]="modules()"
          (onNavigate)="sidebarSvc.close()" />

        @if (currentUser.user()?.isAdmin) {
          <div class="mt-auto px-2 py-2 border-t border-border">
            <a
              #rla="routerLinkActive"
              class="flex items-center gap-2 mx-2 px-3 py-2
                     font-inter text-sm font-medium
                     text-layout-sidebar-text rounded-lg
                     transition-colors duration-200
                     hover:bg-accent-ui-hover
                     focus-visible:outline-none focus-visible:ring-2
                     focus-visible:ring-focus-ring focus-visible:ring-offset-2
                     focus-visible:ring-offset-focus-ring-offset"
              routerLink="/admin"
              routerLinkActive="bg-layout-nav-active text-layout-nav-active-text"
              (click)="sidebarSvc.close()">
              <span class="material-icons text-lg">admin_panel_settings</span>
              Administración
            </a>
          </div>
        }
      </div>

    </aside>
  `,
})
export default class Sidebar {
  readonly authService    = inject(AuthService);
  readonly sidebarSvc     = inject(SideBarService);
  readonly currentUser    = inject(CurrentUserService);
  readonly modules        = signal<Module[]>(this.authService.getModules());
  readonly ready          = signal(false);

  constructor() {
    afterNextRender(() => this.ready.set(true));
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { 
    this.sidebarSvc.close(); 
  }
}