import { Component, input } from '@angular/core';

@Component({
  selector: 'app-catalog-empty',
  template: `
    <div
      class="flex flex-col items-center justify-center gap-3 py-20 bg-bg-surface border border-dashed border-border rounded-2xl text-text-soft"
    >
      <div
        class="w-16 h-16 rounded-full bg-bg-muted flex items-center justify-center text-text-soft/40"
      >
        <span class="material-icons text-[36px]">category</span>
      </div>
      <div class="text-center px-6">
        <p class="font-bold text-text-main text-sm">Sin resultados</p>
        <p class="text-xs max-w-xs mt-1">{{ message() }}</p>
      </div>
    </div>
  `,
})
export default class CatalogEmpty {
  message = input<string>('');
}
