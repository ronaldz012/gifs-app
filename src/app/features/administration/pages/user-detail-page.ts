import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-detail-page',
  imports: [RouterLink],
  template: `
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-3">
        <a routerLink="/admin/users" class="btn-icon">
          <span class="material-icons text-base">arrow_back</span>
        </a>
        <h1 class="text-xl font-semibold text-text-main">Detalle de Usuario</h1>
      </div>
      <div class="flex flex-col items-center gap-3 p-12 rounded-xl border border-border bg-bg-surface shadow-xs">
        <span class="material-icons text-4xl text-text-soft opacity-60">construction</span>
        <p class="text-sm font-medium text-text-muted">Próximamente</p>
      </div>
    </div>
  `,
})
export default class UserDetailPage {}
