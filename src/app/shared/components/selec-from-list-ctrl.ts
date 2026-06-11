import { Component, input, output, signal, computed, effect, untracked } from '@angular/core';
import { FieldState } from '@angular/forms/signals';
import { SelectOption } from '@shared/models/select-option.model';

@Component({
  selector: 'app-select-ctrl',
  standalone: true,
  template: `
    <div class="relative w-full" (focusout)="handleFocusOut($event)">
      <!-- INPUT SEMÁNTICO -->
      <input
        type="text"
        [value]="query()"
        (focus)="onFocus()"
        (input)="onInput($event)"
        (keydown)="handleKeydown($event)"
        [placeholder]="placeholder()"
        autocomplete="off"
        class="w-full px-2 py-1 border border-border rounded text-[11px] font-medium transition-all bg-transparent text-text-main placeholder:text-text-soft hover:border-border-strong focus:outline-none focus:border-accent-ui focus:ring-1 focus:ring-ring-focus-ring focus:bg-bg-surface"
      />

      <!-- DESPLEGABLE / DROPDOWN -->
      @if (isOpen() && (filteredOptions().length > 0 || showCreateOption())) {
        <ul class="absolute z-100 w-full mt-1 bg-bg-elevated border border-border rounded shadow-lg max-h-48 overflow-y-auto">
          
          <!-- OPCIONES FILTRADAS -->
          @for (opt of filteredOptions(); track opt.id; let i = $index) {
            <li
              (mousedown)="selectOption(opt, $event)"
              [class.!bg-bg-muted]="activeIndex() === i"
              class="px-3 py-1.5 text-[11px] cursor-pointer text-text-main hover:bg-bg-muted transition-colors">
              {{ opt.displayName }}
            </li>
          }

          <!-- ACCIÓN: CREAR NUEVA OPCIÓN -->
          @if (showCreateOption()) {
            <li
              (mousedown)="emitCreate($event)"
              [class.!bg-feedback-success]="activeIndex() === filteredOptions().length"
              class="px-3 py-1.5 text-[11px] font-bold text-feedback-success-text border-t border-border cursor-pointer hover:bg-feedback-success transition-colors">
              + CREAR "{{ query() }}"
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export default class SelectCtrl {

  fieldState  = input.required<FieldState<GUID | null>>();
  options     = input.required<SelectOption[]>();
  placeholder = input<string>('');

  createNew = output<string>();
  selected  = output<GUID>(); // ← emite el objeto completo

  query       = signal('');
  isOpen      = signal(false);
  activeIndex = signal(0);

  constructor() {
    effect(() => {
      const val  = this.fieldState().value();
      const opts = this.options();
      untracked(() => {
        if (!val) {
          this.query.set('');
        } else {
          const match = opts.find(o => o.id === val);
          if (match) this.query.set(match.displayName);
        }
      });
    });
  }

  filteredOptions = computed(() => {
    const q = this.query().toLowerCase().trim();
    return this.options().filter(o => o.displayName.toLowerCase().includes(q));
  });

  showCreateOption = computed(() => {
    const q = this.query().trim();
    if (!q) return false;
    return !this.options().some(o => o.displayName.toLowerCase() === q.toLowerCase());
  });

  onFocus() { this.isOpen.set(true); }

  handleFocusOut(event: FocusEvent) {
    const next = event.relatedTarget as HTMLElement;
    if (next && (event.currentTarget as HTMLElement).contains(next)) return;
    this.isOpen.set(false);
    this.fieldState().markAsTouched();
  }

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.activeIndex.set(0);
    this.isOpen.set(true);
    if (!value) {
      this.fieldState().value.set(null);
    }
  }

  selectOption(opt: SelectOption, event?: MouseEvent) {
    if (event) event.preventDefault();
    this.query.set(opt.displayName);
    this.fieldState().value.set(opt.id);
    this.fieldState().markAsTouched();
    this.selected.emit(opt.id);  // ← el wrapper recibe todo y decide qué hacer
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
    const index    = this.activeIndex();
    const filtered = this.filteredOptions();
    if (index < filtered.length) {
      this.selectOption(filtered[index]);
    } else if (this.showCreateOption()) {
      this.emitCreate();
    }
  }
}