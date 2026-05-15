import { Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-print-header',
  standalone: true,
  template: `
    <header class="print-header">
      <div class="print-header__left">
        <button class="btn-back" (click)="goBack()">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 19l-7-7 7-7"/>
          </svg>
          Volver
        </button>

        @if (title()) {
          <span class="print-header__title">{{ title() }}</span>
        }

        @if (subtitle()) {
          <span class="print-header__sep hidden sm:inline">·</span>
          <span class="print-header__subtitle hidden sm:inline">{{ subtitle() }}</span>
        }
      </div>

      <button class="btn-print" (click)="onPrint()" [disabled]="disabled()">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none"
             viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2
                   m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z
                   m8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
        </svg>
        <span class="hidden sm:inline">Imprimir</span>
      </button>
    </header>
  `,
  styles: [`
    .print-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px;
      background: #111827;
      color: white;
      flex-shrink: 0;
    }

    .print-header__left {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .print-header__title {
      font-weight: 600;
      font-size: 0.875rem;
      white-space: nowrap;
    }

    .print-header__sep,
    .print-header__subtitle {
      font-size: 0.875rem;
      color: #9ca3af;
      white-space: nowrap;
    }

    .btn-back {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.875rem;
      color: #9ca3af;
      transition: color 0.15s;
      flex-shrink: 0;
      cursor: pointer;
    }
    .btn-back:hover { color: white; }

    .btn-print {
      display: flex;
      align-items: center;
      gap: 8px;
      background: white;
      color: #111827;
      font-weight: 600;
      font-size: 0.875rem;
      padding: 8px 16px;
      border-radius: 8px;
      transition: background 0.15s;
      flex-shrink: 0;
      cursor: pointer;
    }
    .btn-print:hover:not(:disabled) { background: #f3f4f6; }
    .btn-print:disabled { opacity: 0.4; cursor: not-allowed; }

    .icon {
      width: 16px;
      height: 16px;
    }

    @media print {
      .print-header { display: none; }
    }
  `],
})
export class PrintHeader {
  title    = input<string>('');
  subtitle = input<string>('');
  disabled = input<boolean>(false);
  /** Ruta a la que volver. Si no se provee usa history.back() */
  backUrl  = input<string>('');

  private router = inject(Router);

  goBack(): void {
    const url = this.backUrl();
    if (url) {
      this.router.navigateByUrl(url);
    } else {
      history.back();
    }
  }

  onPrint(): void {
    window.print();
  }
}
