import { Component } from '@angular/core';

@Component({
  selector: 'app-catalog-skeleton',
  template: `
    <div class="flex flex-col gap-3">
      @for (_ of [1, 2, 3, 4]; track $index) {
        <div class="bg-bg-surface rounded-xl border border-border p-4 animate-pulse">
          <div class="flex items-center gap-3">
            <div class="h-4 flex-1 bg-bg-muted rounded"></div>
            <div class="h-4 w-20 bg-bg-muted rounded shrink-0"></div>
          </div>
        </div>
      }
    </div>
  `,
})
export default class CatalogSkeleton {}
