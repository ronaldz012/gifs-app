import { Component, input} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'app-skeleton-list',
  imports: [
    NgTemplateOutlet
  ],
  template: `
    <div class="flex flex-col gap-3">
      @for (_ of rowArray(); track $index) {
        <div
          class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 animate-pulse"
          [style.animation-delay]="$index * 60 + 'ms'"
        >
          @if (rowTemplate()) {
            <ng-container *ngTemplateOutlet="rowTemplate()!" />
          } @else {
            <!-- Default layout: evenly spaced columns -->
            <div
              class="flex items-center gap-3"
              [style.grid-template-columns]="'repeat(' + columns() + ', 1fr)'"
            >
              @for (_ of colArray(); track $index; let last = $last) {
                <div
                  class="h-4 bg-gray-100 rounded"
                  [class]="last ? 'w-16 shrink-0' : 'flex-1'"
                ></div>
              }
            </div>
          }
        </div>
      }
    </div>

  `,
  styles: ``,
})
export default class SkeletonList {
  rows       = input<number>(3);
  columns    = input<number>(3);
  rowTemplate = input<any>(null); // TemplateRef<any> | null

  rowArray = () => Array.from({ length: this.rows() });
  colArray = () => Array.from({ length: this.columns() });

}
