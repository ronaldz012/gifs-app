import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'smartDate',
  standalone: true,
})
export class SmartDatePipe implements PipeTransform {
  private readonly timeFormat = new Intl.DateTimeFormat('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  private readonly dateFormat = new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  transform(value: string | Date | null | undefined): string {
    if (!value) return '—';

    const date = new Date(value);
    const now = new Date();

    if (this.isSameDay(date, now)) {
      return `Hoy ${this.timeFormat.format(date)}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (this.isSameDay(date, yesterday)) {
      return `Ayer ${this.timeFormat.format(date)}`;
    }

    return this.dateFormat.format(date);
  }

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
}
