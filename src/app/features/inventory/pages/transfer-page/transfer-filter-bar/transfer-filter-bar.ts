// features/transfers/components/transfer-filter-bar/transfer-filter-bar.ts
import { Component, input, output, computed } from '@angular/core';
import {TransferDirection, TransferStatus} from '../../../dtos/tranfers/transfer-enums';
import {TransferQueryParams} from '../../../dtos/tranfers/stock-transfer-list-dto';
import { DateRangeFilter } from '@shared/components/date-range-filter/date-range-filter';


interface StatusPill {
  value: TransferStatus;
  label: string;
  activeClass: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-transfer-filter-bar',
  imports: [DateRangeFilter],
  template: `
    <div class="flex flex-wrap gap-2 items-center">

      <!-- Status pills -->
      <div class="flex items-center gap-1 flex-wrap">
        @for (pill of statusPills; track pill.value) {
          <button
            class="px-2.5 py-1 text-xs rounded-lg border transition-colors"
            [class]="isStatusActive(pill.value)
              ? pill.activeClass
              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'"
            [disabled]="pill.disabled"
            [title]="pill.disabled ? 'Sin soporte aún' : ''"
            (click)="toggleStatus(pill.value)">
            {{ pill.label }}
          </button>
        }
      </div>

      <!-- Separador -->
      <div class="w-px h-6 bg-gray-200"></div>

      <!-- Direction toggle -->
      <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
        <button
          class="px-2.5 py-1 text-xs rounded-md transition-colors"
          [class]="params().direction === undefined
            ? 'bg-white text-gray-800 font-medium shadow-sm'
            : 'text-gray-500 hover:text-gray-700'"
          (click)="emit({ direction: undefined, page: 1 })">
          Todas
        </button>
        <button
          class="px-2.5 py-1 text-xs rounded-md transition-colors"
          [class]="params().direction === Direction.Salida
            ? 'bg-white text-gray-800 font-medium shadow-sm'
            : 'text-gray-500 hover:text-gray-700'"
          (click)="emit({ direction: Direction.Salida, page: 1 })">
          ↑ Salientes
        </button>
        <button
          class="px-2.5 py-1 text-xs rounded-md transition-colors"
          [class]="params().direction === Direction.Entrada
            ? 'bg-white text-gray-800 font-medium shadow-sm'
            : 'text-gray-500 hover:text-gray-700'"
          (click)="emit({ direction: Direction.Entrada, page: 1 })">
          ↓ Entrantes
        </button>
      </div>

      <!-- Separador -->
      <div class="w-px h-6 bg-gray-200"></div>

      <!-- Rango de fechas -->
      <app-date-range-filter
        [from]="params().dateFrom"
        [to]="params().dateTo"
        (rangeChange)="emit({ dateFrom: $event.from, dateTo: $event.to, page: 1 })" />

      <!-- Clear -->
      @if (hasActiveFilters()) {
        <button
          class="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600
                 hover:bg-gray-100 rounded-xl transition-colors"
          (click)="clearAll()">
          ✕ Limpiar
        </button>
      }

    </div>
  `,
})
export class TransferFilterBar {
  params = input.required<TransferQueryParams>();
  change = output<Partial<TransferQueryParams>>();

  // Exponer enums al template
  readonly Direction = TransferDirection;
  readonly Status    = TransferStatus;

  readonly statusPills: StatusPill[] = [
    {
      value: TransferStatus.Pendiente,
      label: '🕐 Pendiente',
      activeClass: 'bg-amber-50 border-amber-300 text-amber-700 font-medium',
    },
    {
      value: TransferStatus.Transito,
      label: '🚚 En tránsito',
      activeClass: 'bg-blue-50 border-blue-300 text-blue-700 font-medium',
      disabled: true,
    },
    {
      value: TransferStatus.Completada,
      label: '✓ Completada',
      activeClass: 'bg-green-50 border-green-300 text-green-700 font-medium',
    },
    {
      value: TransferStatus.Rechazada,
      label: '✕ Rechazada',
      activeClass: 'bg-red-50 border-red-300 text-red-700 font-medium',
    },
    {
      value: TransferStatus.Cancelada,
      label: '— Cancelada',
      activeClass: 'bg-gray-100 border-gray-400 text-gray-600 font-medium',
    },
  ];

  isStatusActive(status: TransferStatus): boolean {
    return this.params().status?.includes(status) ?? false;
  }

  toggleStatus(status: TransferStatus): void {
    const current = this.params().status ?? [];
    const next = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    this.emit({ status: next.length ? next : undefined, page: 1 });
  }

  emit(patch: Partial<TransferQueryParams>): void {
    this.change.emit(patch);
  }

  hasActiveFilters(): boolean {
    const p = this.params();
    return !!(p.status?.length || p.direction !== undefined || p.dateFrom || p.dateTo);
  }

  clearAll(): void {
    this.change.emit({
      status: undefined,
      direction: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      page: 1,
    });
  }
}
