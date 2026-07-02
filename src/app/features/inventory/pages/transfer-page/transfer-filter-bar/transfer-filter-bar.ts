// features/transfers/components/transfer-filter-bar/transfer-filter-bar.ts
import { Component, input, output, computed } from '@angular/core';
import {TransferDirection, TransferStatus} from '../../../dtos/transfers/transfer-enums';
import {TransferQueryParams} from '../../../dtos/transfers/stock-transfer-list-dto';
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
    <div class="flex flex-col gap-3 sm:gap-3 items-stretch sm:items-start w-full">

      <!-- Fila 1: Status pills -->
      <div class="flex flex-wrap items-center gap-1.5 w-full">
        @for (pill of statusPills; track pill.value) {
          <button
            class="flex-1 sm:flex-none px-2.5 py-1.5 sm:py-1 text-xs rounded-lg border transition-colors whitespace-nowrap text-center"
            [class]="isStatusActive(pill.value)
              ? pill.activeClass
              : 'bg-bg-surface border-border text-text-muted hover:bg-bg-muted'"
            [disabled]="pill.disabled"
            [title]="pill.disabled ? 'Sin soporte aún' : ''"
            (click)="toggleStatus(pill.value)">
            {{ pill.label }}
          </button>
        }
      </div>

      <!-- Fila 2: Resto de filtros -->
      <div class="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-2 w-full">
        <!-- Direction toggle -->
        <div class="flex items-center gap-1 bg-bg-muted rounded-lg p-0.5 w-full sm:w-auto">
          <button
            class="flex-1 sm:flex-none px-2.5 py-1.5 sm:py-1 text-xs rounded-md transition-colors text-center"
            [class]="params().direction === undefined
              ? 'bg-bg-surface text-text-main font-medium shadow-sm'
              : 'text-text-muted hover:text-text-main'"
            (click)="emit({ direction: undefined, page: 1 })">
            Todas
          </button>
          <button
            class="flex-1 sm:flex-none px-2.5 py-1.5 sm:py-1 text-xs rounded-md transition-colors text-center"
            [class]="params().direction === Direction.Salida
              ? 'bg-bg-surface text-text-main font-medium shadow-sm'
              : 'text-text-muted hover:text-text-main'"
            (click)="emit({ direction: Direction.Salida, page: 1 })">
            ↑ Salientes
          </button>
          <button
            class="flex-1 sm:flex-none px-2.5 py-1.5 sm:py-1 text-xs rounded-md transition-colors text-center"
            [class]="params().direction === Direction.Entrada
              ? 'bg-bg-surface text-text-main font-medium shadow-sm'
              : 'text-text-muted hover:text-text-main'"
            (click)="emit({ direction: Direction.Entrada, page: 1 })">
            ↓ Entrantes
          </button>
        </div>

        <!-- Separador -->
        <div class="hidden sm:block w-px h-6 bg-border"></div>

        <!-- Rango de fechas -->
        <div class="w-full sm:w-auto min-w-[200px]">
          <app-date-range-filter
            [from]="params().dateFrom"
            [to]="params().dateTo"
            (rangeChange)="emit({ dateFrom: $event.from, dateTo: $event.to, page: 1 })" />
        </div>

        <!-- Clear -->
        @if (hasActiveFilters()) {
          <button
            class="w-full sm:w-auto px-3 py-1.5 sm:py-1 text-sm sm:text-xs text-text-soft hover:text-text-muted
                   hover:bg-bg-muted rounded-xl sm:rounded-lg transition-colors border border-dashed border-border sm:border-transparent bg-bg-surface sm:bg-transparent"
            (click)="clearAll()">
            ✕ Limpiar
          </button>
        }
      </div>

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
      activeClass: 'bg-feedback-warning border-feedback-warning-text/30 text-feedback-warning-text font-medium',
    },
    {
      value: TransferStatus.Transito,
      label: '🚚 En tránsito',
      activeClass: 'bg-feedback-info border-feedback-info-text/30 text-feedback-info-text font-medium',
      disabled: true,
    },
    {
      value: TransferStatus.Completada,
      label: '✓ Completada',
      activeClass: 'bg-feedback-success border-feedback-success-text/30 text-feedback-success-text font-medium',
    },
    {
      value: TransferStatus.Rechazada,
      label: '✕ Rechazada',
      activeClass: 'bg-feedback-error border-feedback-error-text/30 text-feedback-error-text font-medium',
    },
    {
      value: TransferStatus.Cancelada,
      label: '— Cancelada',
      activeClass: 'bg-bg-muted border-border-strong text-text-muted font-medium',
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
