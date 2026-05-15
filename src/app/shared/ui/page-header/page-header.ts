import { Component, input, output } from '@angular/core';

/**
 * Reusable sticky page header with breadcrumb navigation and an actions slot.
 *
 * Usage:
 *   <app-page-header
 *     [crumbs]="[{ label: 'Transferencias', action: true }]"
 *     [title]="'Nueva transferencia'"
 *     (crumbClick)="onCrumbClick($event)"
 *   >
 *     <!-- optional right-side actions via ng-content -->
 *     <button>Crear</button>
 *   </app-page-header>
 */
export interface Breadcrumb {
  label: string;
  /** If true, clicking this crumb emits crumbClick with its index. */
  action?: boolean;
}

@Component({
  selector: 'app-page-header',
  template: `
    <div class="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">

        <!-- Left: breadcrumb -->
        <div class="flex items-center gap-2 min-w-0">
          @for (crumb of crumbs(); track $index; let last = $last) {

            @if ($index > 0) {
              <span class="text-gray-200 shrink-0">/</span>
            }

            @if (!last && crumb.action) {
              <button
                (click)="crumbClick.emit($index)"
                class="flex items-center gap-1.5 text-sm text-gray-400
                       hover:text-gray-600 transition-colors shrink-0"
              >
                @if ($index === 0) {
                  <span class="text-base leading-none">←</span>
                }
                {{ crumb.label }}
              </button>
            } @else {
              <span
                class="text-sm truncate"
                [class]="last ? 'font-semibold text-gray-800' : 'text-gray-400'"
              >
                {{ crumb.label }}
              </span>
            }

          }
        </div>

        <!-- Right: actions via ng-content -->
        <div class="flex items-center gap-2 shrink-0">
          <ng-content />
        </div>

      </div>
    </div>
  `,
  styles: ``,
})
export class PageHeader {
  crumbs     = input.required<Breadcrumb[]>();
  crumbClick = output<number>(); // emits the index of the clicked crumb
}
