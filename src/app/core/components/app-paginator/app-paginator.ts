// core/ui/paginator/paginator.ts
import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-paginator',
  standalone: true,
  template: `
    <div class="flex items-center justify-between px-1 py-2">
      <!-- Page size selector -->
      <div class="flex items-center gap-2 text-sm text-gray-500">
        <span>Mostrar</span>
        <select
          class="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          [value]="pageSize()"
          (change)="onPageSizeChange($event)">
          @for (size of pageSizeOptions; track size) {
            <option [value]="size">{{ size }}</option>
          }
        </select>
        <span>por página · <strong>{{ totalItems() }}</strong> total</span>
      </div>

      <!-- Page navigation -->
      <div class="flex items-center gap-1">
        <button
          class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          [disabled]="page() <= 1"
          (click)="goTo(1)" title="Primera página">
          «
        </button>
        <button
          class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          [disabled]="page() <= 1"
          (click)="goTo(page() - 1)" title="Anterior">
          ‹
        </button>

        @for (p of visiblePages(); track p) {
          @if (p === -1) {
            <span class="px-1 text-gray-300">…</span>
          } @else {
            <button
              class="min-w-8 h-8 rounded-lg text-sm transition-colors"
              [class]="p === page()
                ? 'bg-indigo-600 text-white font-medium'
                : 'text-gray-600 hover:bg-gray-100'"
              (click)="goTo(p)">
              {{ p }}
            </button>
          }
        }

        <button
          class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          [disabled]="page() >= totalPages()"
          (click)="goTo(page() + 1)" title="Siguiente">
          ›
        </button>
        <button
          class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          [disabled]="page() >= totalPages()"
          (click)="goTo(totalPages())" title="Última página">
          »
        </button>
      </div>
    </div>
  `
})
export class Paginator {
  page        = input.required<number>();
  pageSize    = input.required<number>();
  totalItems  = input.required<number>();

  pageChange     = output<number>();
  pageSizeChange = output<number>();

  readonly pageSizeOptions = [10, 20, 50, 100];

  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: number[] = [1];
    if (current > 3) pages.push(-1);
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++)
      pages.push(i);
    if (current < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  });

  goTo(p: number) {
    if (p >= 1 && p <= this.totalPages()) this.pageChange.emit(p);
  }

  onPageSizeChange(e: Event) {
    const size = Number((e.target as HTMLSelectElement).value);
    this.pageSizeChange.emit(size);
    this.pageChange.emit(1); // reset a página 1
  }
}
