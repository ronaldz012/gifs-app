import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-close-register-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex items-center justify-center py-20">
      <div class="w-full max-w-md bg-bg-surface border border-border rounded-2xl p-8 shadow-sm text-center space-y-6">
        <div class="w-20 h-20 mx-auto rounded-full bg-bg-muted flex items-center justify-center">
          <span class="material-icons text-[40px] text-text-soft/50">payments</span>
        </div>

        <div class="space-y-1">
          <h2 class="text-xl font-black text-text-main">Cierre de Caja</h2>
          <p class="text-sm text-text-soft">Esta funcionalidad estará disponible próximamente.</p>
        </div>

        <a
          routerLink="/sales/pos"
          class="inline-flex items-center gap-2 px-6 py-2.5 bg-accent-ui text-white rounded-xl text-sm font-bold hover:bg-accent-ui/90 transition-all"
        >
          <span class="material-icons text-[18px]">arrow_back</span>
          Volver al POS
        </a>
      </div>
    `,
})
export default class CloseRegisterPage {}
