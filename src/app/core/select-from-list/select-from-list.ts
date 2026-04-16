import {
  Component,
  forwardRef,
  input,
  output,
  signal,
  computed,
  effect,
  untracked
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-select-from-list',
  standalone: true,
  template: `
    <div class="relative w-full" (focusout)="handleFocusOut($event)">
      <input
        type="text"
        [value]="query()"
        (focus)="onFocus()"
        (input)="onInput($event)"
        (keydown)="handleKeydown($event)"
        [placeholder]="placeholder()"
        class="w-full px-2 py-1.5 border border-gray-300 rounded text-[11px]
               focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400
               transition-colors bg-white"
      />

      @if (isOpen() && (filteredOptions().length > 0 || showCreateOption())) {
        <ul class="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
          @for (opt of filteredOptions(); track opt.id; let i = $index) {
            <li
              (mousedown)="selectOption(opt, $event)"
              [class.bg-blue-50]="activeIndex() === i"
              class="px-3 py-2 text-[11px] cursor-pointer hover:bg-blue-50 text-gray-700"
            >
              {{ opt.name }}
            </li>
          }

          @if (showCreateOption()) {
            <li
              (mousedown)="emitCreate($event)"
              [class.bg-green-50]="activeIndex() === filteredOptions().length"
              class="px-3 py-2 text-[11px] font-bold text-green-600 border-t border-gray-100 cursor-pointer hover:bg-green-50"
            >
              + CREAR "{{ query() }}"
            </li>
          }
        </ul>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectFromList),
      multi: true,
    },
  ],
})
export class SelectFromList implements ControlValueAccessor {

  // Inputs
  options = input.required<{ id: number; name: string }[]>();
  placeholder = input<string>('');

  // Outputs opcionales
  createNew = output<string>();

  // estado interno
  query = signal('');
  isOpen = signal(false);
  activeIndex = signal(0);
  value: number | null = null;

  // CVA callbacks
  private onChange = (value: number | null) => {};
  private onTouched = () => {};

  // Sync query con value
  constructor() {
    effect(() => {
      const opts = this.options();

      untracked(() => {
        if (this.value == null) {
          this.query.set('');
        } else {
          const match = opts.find(o => o.id === this.value);
          if (match) this.query.set(match.name);
        }
      });
    });
  }

  filteredOptions = computed(() => {
    const q = this.query().toLowerCase().trim();
    const list = this.options().filter(o => o.name.toLowerCase().includes(q));
    untracked(() => this.activeIndex.set(0));
    return list;
  });

  showCreateOption = computed(() => {
    const q = this.query().trim();
    if (!q) return false;
    return !this.options().some(o => o.name.toLowerCase() === q.toLowerCase());
  });

  // CVA methods
  writeValue(value: number | null): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // eventos UI
  onFocus() {
    this.isOpen.set(true);
  }

  handleFocusOut(event: FocusEvent) {
    const next = event.relatedTarget as HTMLElement;
    if (next && (event.currentTarget as HTMLElement).contains(next)) return;

    this.isOpen.set(false);
    this.onTouched(); // 👈 automático ahora
  }

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.isOpen.set(true);

    if (!value) {
      this.value = null;
      this.onChange(null);
    }
  }

  selectOption(opt: any, event?: MouseEvent) {
    if (event) event.preventDefault();

    this.value = opt.id;
    this.query.set(opt.name);

    this.onChange(opt.id);   // 👈 update form
    this.onTouched();        // 👈 touched automático

    this.isOpen.set(false);
  }

  emitCreate(event?: MouseEvent) {
    if (event) event.preventDefault();
    const val = this.query().trim();
    if (val) {
      this.createNew.emit(val);
      this.isOpen.set(false);
    }
  }

  handleKeydown(event: KeyboardEvent) {
    if (!this.isOpen()) return;

    const maxIndex = this.showCreateOption()
      ? this.filteredOptions().length
      : this.filteredOptions().length - 1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.update(v => (v < maxIndex ? v + 1 : 0));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update(v => (v > 0 ? v - 1 : maxIndex));
        break;
      case 'Enter':
        event.preventDefault();
        this.executeSelection();
        break;
      case 'Escape':
      case 'Tab':
        this.isOpen.set(false);
        break;
    }
  }

  private executeSelection() {
    const index = this.activeIndex();
    const filtered = this.filteredOptions();

    if (index < filtered.length) {
      this.selectOption(filtered[index]);
    } else if (this.showCreateOption()) {
      this.emitCreate();
    }
  }
}
