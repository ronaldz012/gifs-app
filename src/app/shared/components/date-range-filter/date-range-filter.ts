import { Component, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface DateRange {
  from: string | undefined;
  to: string | undefined;
}

type DateSelection = 'today' | 'yesterday' | 'specific' | null;

@Component({
  selector: 'app-date-range-filter',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
      <!-- Shortcuts -->
      <div
        class="grid grid-cols-3 sm:flex items-center gap-1 bg-bg-muted rounded-lg p-0.5 w-full sm:w-auto"
      >
        @for (s of shortcuts; track s.value) {
          <button
            class="px-2.5 py-1.5 sm:py-1 text-xs rounded-md transition-colors whitespace-nowrap text-center"
            [class]="
              selection() === s.value
                ? 'bg-bg-surface text-text-main font-medium shadow-sm'
                : 'text-text-soft hover:text-text-muted'
            "
            (click)="onSelectionChange(s.value)"
          >
            {{ s.label }}
          </button>
        }
      </div>

      <!-- Specific date picker -->
      @if (selection() === 'specific') {
        <input
          type="date"
          class="px-2.5 py-1.5 sm:py-1 text-sm border border-border rounded-md bg-bg-surface
                 text-text-main focus:outline-none focus:ring-2 focus:ring-ring-focus-ring"
          [max]="maxDate"
          [ngModel]="specificDate()"
          (ngModelChange)="onSpecificDate($event)"
        />
      }

      @if (selection()) {
        <button
          class="text-xs text-text-soft hover:text-text-muted px-1 transition-colors"
          title="Limpiar fecha"
          (click)="clear()"
        >
          ✕
        </button>
      }
    </div>
  `,
})
export class DateRangeFilter {
  /** Valores actuales desde el padre */
  from = input<string | undefined>(undefined);
  to = input<string | undefined>(undefined);

  /** Emite cuando cambia el rango */
  rangeChange = output<DateRange>();

  selection = signal<DateSelection>(null);
  specificDate = signal<string>('');

  readonly shortcuts: { label: string; value: Exclude<DateSelection, null> }[] = [
    { label: 'Hoy', value: 'today' },
    { label: 'Ayer', value: 'yesterday' },
    { label: 'Fecha', value: 'specific' },
  ];

  readonly maxDate = this.toISODate(new Date());

  constructor() {
    effect(() => {
      const from = this.from();
      const to = this.to();
      if (!from && !to) {
        this.selection.set(null);
        this.specificDate.set('');
        return;
      }
      if (from && to && this.toISODate(new Date(from)) === this.toISODate(new Date(to))) {
        this.selection.set(this.detectSingleDay(from));
      }
    });
  }

  onSelectionChange(value: Exclude<DateSelection, null>): void {
    this.selection.set(value);

    switch (value) {
      case 'today':
        this.specificDate.set(this.toISODate(new Date()));
        this.emitSingleDay(this.specificDate());
        break;
      case 'yesterday': {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        this.specificDate.set(this.toISODate(yesterday));
        this.emitSingleDay(this.specificDate());
        break;
      }
      case 'specific':
        // Espera a que el usuario elija una fecha
        break;
    }
  }

  onSpecificDate(value: string): void {
    this.specificDate.set(value);
    if (value) {
      this.emitSingleDay(value);
    }
  }

  clear(): void {
    this.selection.set(null);
    this.specificDate.set('');
    this.rangeChange.emit({ from: undefined, to: undefined });
  }

  private emitSingleDay(dateStr: string): void {
    this.rangeChange.emit({
      from: this.toUtcIsoString(dateStr, false),
      to: this.toUtcIsoString(dateStr, true),
    });
  }

  private detectSingleDay(from: string): DateSelection {
    const date = this.toISODate(new Date(from));
    if (date === this.toISODate(new Date())) return 'today';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date === this.toISODate(yesterday)) return 'yesterday';
    return 'specific';
  }

  private toUtcIsoString(dateStr: string, endOfDay: boolean): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const local = new Date(year, month - 1, day);
    if (endOfDay) local.setHours(23, 59, 59, 999);
    return local.toISOString();
  }

  private toISODate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
