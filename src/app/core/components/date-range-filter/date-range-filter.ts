// core/ui/date-range-filter/date-range-filter.ts
import { Component, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface DateRange {
  from: string | undefined;
  to: string | undefined;
}

type DateShortcut = 'today' | 'week' | 'month' | 'custom';

@Component({
  selector: 'app-date-range-filter',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex items-center gap-2 flex-wrap">

      <!-- Shortcuts -->
      <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
        @for (s of shortcuts; track s.value) {
          <button
            class="px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap"
            [class]="activeShortcut() === s.value
              ? 'bg-white text-gray-800 font-medium shadow-sm'
              : 'text-gray-500 hover:text-gray-700'"
            (click)="applyShortcut(s.value)">
            {{ s.label }}
          </button>
        }
      </div>

      <!-- Custom date inputs — visible solo cuando activeShortcut = 'custom' -->
      @if (activeShortcut() === 'custom') {
        <div class="flex items-center gap-1.5">
          <input
            type="date"
            [max]="fromMax()"
            [ngModel]="localFrom()"
            (ngModelChange)="onFromChange($event)" />
          <span class="text-gray-400 text-xs">→</span>
          <input
            type="date"
            [min]="toMin()"
            [ngModel]="localTo()"
            (ngModelChange)="onToChange($event)" />
        </div>
      } @else if (activeShortcut() !== 'custom' && (from() || to())) {
        <!-- Badge mostrando rango activo de shortcut -->
        <span class="text-xs text-indigo-600 bg-indigo-50 border border-indigo-200
                     px-2 py-1 rounded-lg font-medium">
          {{ formatActiveBadge() }}
        </span>
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

  activeShortcut = signal<DateShortcut | null>(null);

  readonly shortcuts: { label: string; value: DateShortcut }[] = [
    { label: 'Hoy', value: 'today' },
    { label: 'Esta semana', value: 'week' },
    { label: 'Este mes', value: 'month' },
    { label: 'Personalizado', value: 'custom' },
  ];

  // Constraints para los inputs
  fromMax = computed(() => this.localTo() || this.toISODate(new Date()));
  toMin   = computed(() => this.localFrom() || '');

  applyShortcut(shortcut: DateShortcut) {
    this.activeShortcut.set(shortcut);

    if (shortcut === 'custom') {
      // Solo abre los inputs, no emite hasta que el usuario elige fechas
      return;
    }

    const { from, to } = this.getRangeForShortcut(shortcut);
    this.rangeChange.emit({ from, to });
  }

  localFrom = signal<string>('');
  localTo   = signal<string>('');

  onFromChange(value: string) {
    this.localFrom.set(value);
    this.rangeChange.emit({
      from: value ? this.toUtcIsoString(value, false) : undefined,
      to:   this.to(),
    });
  }

  onToChange(value: string) {
    this.localTo.set(value);
    this.rangeChange.emit({
      from: this.from(),
      to:   value ? this.toUtcIsoString(value, true) : undefined,
    });
  }

  formatActiveBadge(): string {
    const f = this.from();
    const t = this.to();
    if (!f && !t) return '';

    const fmt = (isoStr: string) =>
      new Date(isoStr).toLocaleDateString('es-BO', {
        day: '2-digit', month: 'short'
      });

    if (f && t) return `${fmt(f)} – ${fmt(t)}`;
    if (f) return `Desde ${fmt(f)}`;
    return `Hasta ${fmt(t!)}`;
  }


  private getRangeForShortcut(shortcut: Exclude<DateShortcut, 'custom'>): DateRange {
    const today = new Date();

    switch (shortcut) {
      case 'today':
        return {
          from: this.toUtcIsoString(this.toISODate(today), false),
          to: this.toUtcIsoString(this.toISODate(today), true),
        };

      case 'week': {
        const monday = new Date(today);
        const day = today.getDay();
        monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
        return {
          from: this.toUtcIsoString(this.toISODate(monday), false),
          to: this.toUtcIsoString(this.toISODate(today), true),
        };
      }

      case 'month': {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          from: this.toUtcIsoString(this.toISODate(firstDay), false),
          to: this.toUtcIsoString(this.toISODate(today), true),
        };
      }
    }
  }

  private toUtcIsoString(dateStr: string, endOfDay: boolean): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const local = new Date(year, month - 1, day);
    if (endOfDay) local.setHours(23, 59, 59, 999);
    return local.toISOString();
  }

  private todayStr(): string {
    return this.toISODate(new Date());
  }

  private toISODate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
