import { Component, input, output, signal, effect } from '@angular/core';

@Component({
  selector: 'app-sku-input',
  standalone: true,
  template: `
    <div class="relative flex-1 min-w-0">
      <input
        type="text"
        [placeholder]="placeholder()"
        [value]="sku()"
        (input)="onInput($event)"
        (keydown.enter)="emit()"
        autocomplete="off"
        autocapitalize="characters"
        class="w-full pl-3 pr-10 py-2 text-sm font-mono rounded-xl border border-border bg-bg-muted text-text-main focus:outline-none focus:border-border-strong uppercase placeholder:normal-case"
      />
      <button
        type="button"
        (click)="emit()"
        class="absolute right-2 top-1/2 -translate-y-1/2 text-text-soft hover:text-text-main flex items-center justify-center p-1"
        aria-label="Buscar"
      >
        <span class="material-icons text-[18px]">search</span>
      </button>
    </div>
  `,
})
export class SkuInput {
  placeholder = input<string>('Digitar SKU...');
  initialValue = input<string>('');

  skuSubmit = output<string>();

  sku = signal('');

  constructor() {
    effect(() => {
      const v = this.initialValue();
      if (v) this.sku.set(v.toUpperCase());
    });
  }

  onInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value.toUpperCase();
    this.sku.set(v);
    (event.target as HTMLInputElement).value = v;
  }

  emit(): void {
    const clean = this.sku().trim().toUpperCase();
    if (!clean) return;
    this.skuSubmit.emit(clean);
    this.sku.set('');
  }
}
