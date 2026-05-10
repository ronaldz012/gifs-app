import { Component, input, output, signal, computed, effect, ElementRef, viewChild } from '@angular/core';

export interface SelectOption {
  id: GUID;
  name: string;
}

/**
 * Searchable select dropdown for entities with { id, name }.
 * Works for categories, brands, or any similar list.
 *
 * Usage:
 *   <app-searchable-select
 *     label="Categoría"
 *     placeholder="Buscar categoría..."
 *     [options]="categories()"
 *     [selectedId]="form.categoryId"
 *     (selected)="form.categoryId = $event"
 *   />
 */
@Component({
  selector: 'app-searchable-select',
  template: `
    <div class="relative" #container>
      <label class="block text-xs text-gray-400 mb-1">{{ label() }}</label>

      <!-- Trigger -->
      <button
        type="button"
        (click)="toggleOpen()"
        class="w-full flex items-center justify-between gap-2
               px-3 py-2 text-sm border rounded-lg bg-white transition-colors text-left
               focus:outline-none focus:ring-2 focus:ring-blue-100"
        [class]="open() ? 'border-blue-300' : 'border-gray-200 hover:border-gray-300'"
      >
        <span [class]="selectedLabel() ? 'text-gray-800' : 'text-gray-400'">
          {{ selectedLabel() || placeholder() }}
        </span>
        <span class="material-icons text-base text-gray-400 transition-transform"
              [class.rotate-180]="open()">
          expand_more
        </span>
      </button>

      <!-- Dropdown -->
      @if (open()) {
        <div class="absolute z-50 mt-1 w-full bg-white border border-gray-200
                    rounded-xl shadow-lg overflow-hidden">
          <!-- Search -->
          <div class="p-2 border-b border-gray-100">
            <input
              #searchInput
              type="text"
              [value]="query()"
              (input)="query.set($any($event.target).value)"
              [placeholder]="'Buscar ' + label().toLowerCase() + '...'"
              class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg
                     focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <!-- Options -->
          <ul class="max-h-48 overflow-y-auto py-1">
            @if (filtered().length === 0) {
              <li class="px-3 py-2 text-xs text-gray-400 text-center">Sin resultados</li>
            }
            @for (opt of filtered(); track opt.id) {
              <li>
                <button
                  type="button"
                  (click)="select(opt)"
                  class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between"
                  [class.text-blue-600]="opt.id === selectedId()"
                  [class.font-medium]="opt.id === selectedId()"
                >
                  {{ opt.name }}
                  @if (opt.id === selectedId()) {
                    <span class="material-icons text-base text-blue-500">check</span>
                  }
                </button>
              </li>
            }
          </ul>

          <!-- Clear -->
          @if (selectedId()) {
            <div class="border-t border-gray-100 p-1">
              <button
                type="button"
                (click)="clear()"
                class="w-full text-xs text-gray-400 hover:text-gray-600 py-1.5 transition-colors"
              >
                Limpiar selección
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class SearchableSelect {
  label       = input<string>('Seleccionar');
  placeholder = input<string>('Seleccionar...');
  options     = input<SelectOption[]>([]);
  selectedId  = input<GUID | null>(null);

  selected = output<GUID | null>();

  open  = signal(false);
  query = signal('');

  filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.options();
    return this.options().filter(o => o.name.toLowerCase().includes(q));
  });

  selectedLabel = computed(() => {
    const id = this.selectedId();
    if (!id) return '';
    return this.options().find(o => o.id === id)?.name ?? '';
  });

  toggleOpen() {
    this.open.update(v => !v);
    if (this.open()) {
      // reset search on open
      this.query.set('');
    }
  }

  select(opt: SelectOption) {
    this.selected.emit(opt.id);
    this.open.set(false);
    this.query.set('');
  }

  clear() {
    this.selected.emit(null);
    this.open.set(false);
    this.query.set('');
  }
}
