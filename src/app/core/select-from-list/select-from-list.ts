import {
  Component,
  forwardRef,
  input,
  output,
  signal,
  computed,
  effect,
  untracked,
  OnInit
} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from '@angular/forms';

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
        class="w-full px-2 py-0.5 border border-gray-200 rounded text-[11px]
           focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400
           transition-colors bg-white font-medium"
      />

      @if (isOpen() && (filteredOptions().length > 0 || showCreateOption())) {
        <ul class="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
          @for (opt of filteredOptions(); track opt.id; let i = $index) {
            <li
              (mousedown)="selectOption(opt, $event)"
              [class.bg-blue-50]="activeIndex() === i"
              class="px-3 py-1.5 text-[11px] cursor-pointer hover:bg-blue-50 text-gray-700"
            >
              {{ opt.name }}
            </li>
          }
          @if (showCreateOption()) {
            <li
              (mousedown)="emitCreate($event)"
              [class.bg-green-50]="activeIndex() === filteredOptions().length"
              class="px-3 py-1.5 text-[11px] font-bold text-green-600 border-t border-gray-100 cursor-pointer hover:bg-green-50"
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
export class SelectFromList implements ControlValueAccessor, OnInit {

  options    = input.required<{ id: GUID; name: string }[]>();
  placeholder = input<string>('');
  ctrl       = input<FormControl | null>(null);  // ← escape hatch para display:contents

  createNew = output<string>();

  query       = signal('');
  isOpen      = signal(false);
  activeIndex = signal(0);
  value: GUID | null = null;

  private onChange   = (value: any) => {};
  private onTouched  = () => {};

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

  ngOnInit(): void {
    const ctrl = this.ctrl();
    if (ctrl) {
      // modo directo: sincroniza valor inicial y suscríbete a cambios externos
      this.writeValue(ctrl.value);
      this.registerOnChange((val: any) => ctrl.setValue(val));
      this.registerOnTouched(() => ctrl.markAsTouched());
    }
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

  // CVA
  writeValue(value: GUID | null): void {
    this.value = value;
    // si ya hay options cargadas, sincroniza el query
    const match = this.options().find(o => o.id === value);
    if (match) this.query.set(match.name);
    else if (!value) this.query.set('');
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  onFocus() { this.isOpen.set(true); }

  handleFocusOut(event: FocusEvent) {
    const next = event.relatedTarget as HTMLElement;
    if (next && (event.currentTarget as HTMLElement).contains(next)) return;
    this.isOpen.set(false);
    this.onTouched();
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
    this.onChange(opt.id);
    this.onTouched();
    console.log('valor del ctrl al seleccionar',this.ctrl()?.getRawValue())
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
