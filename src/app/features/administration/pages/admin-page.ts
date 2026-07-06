import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrentUserService } from '@features/auth/services/current-user-service';

@Component({
  selector: 'app-admin-page',
  imports: [RouterLink],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-semibold text-text-main">Administración</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-bg-surface border border-border rounded-xl shadow-xs p-6 space-y-4">
          <span class="material-icons text-4xl text-text-main">people</span>
          <div>
            <h2 class="text-lg font-semibold text-text-main">Usuarios</h2>
            <p class="text-sm text-text-muted mt-1">Gestiona los usuarios del sistema, sus roles y permisos.</p>
          </div>
          <a routerLink="/admin/users"
             class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                    text-white bg-btn-primary-bg rounded-lg
                    hover:opacity-90 transition-opacity">
            Ir a Usuarios
            <span class="material-icons text-base">arrow_forward</span>
          </a>
        </div>

        <div class="bg-bg-surface border border-border rounded-xl shadow-xs p-6 space-y-4">
          <span class="material-icons text-4xl text-text-main">business</span>
          <div>
            <h2 class="text-lg font-semibold text-text-main">Sucursales</h2>
            <p class="text-sm text-text-muted mt-1">Administra las sucursales y su configuración.</p>
          </div>
          <a routerLink="/admin/branches"
             class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                    text-white bg-btn-primary-bg rounded-lg
                    hover:opacity-90 transition-opacity">
            Ir a Sucursales
            <span class="material-icons text-base">arrow_forward</span>
          </a>
        </div>
      </div>
    </div>
  `,
})
export default class AdminPage {
  readonly currentUser = inject(CurrentUserService);
}
