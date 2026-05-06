import {
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LabelSheet } from './label-sheet/label-sheet';
import { LabelData, LABELS_PER_SHEET, ReceptionLabelsDto } from '../../../interfaces/reception-labels';

@Component({
  selector: 'app-print-labels',
  standalone: true,
  imports: [LabelSheet],
  template: `
    <!-- Overlay pantalla completa (oculto en print via CSS global) -->
    <div class="print-overlay">

      <!-- Barra de control (oculta en print) -->
      <div class="control-bar print:hidden">
        <div class="control-bar__left">
          <button (click)="closed.emit()" class="btn-back">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 19l-7-7 7-7"/>
            </svg>
            Volver
          </button>

          @if (reception()) {
            <div class="reception-info">
              <span class="text-gray-400">Recepción</span>
              <span class="font-semibold">#{{ reception()!.receptionId }}</span>
              <span class="text-gray-600 hidden sm:inline">·</span>
              <span class="text-gray-400 hidden sm:inline">{{ formattedDate() }}</span>
              <span class="text-gray-600 hidden sm:inline">·</span>
              <span class="text-gray-400 hidden sm:inline">{{ totalLabels() }} etiquetas</span>
            </div>
          }
        </div>

        <button
          (click)="print()"
          [disabled]="loading() || !!error()"
          class="btn-print">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
          </svg>
          <span class="hidden sm:inline">Imprimir</span>
        </button>
      </div>

      <!-- Área de contenido -->
      <div class="content-area">

        @if (loading()) {
          <div class="state-center">
            <div class="spinner"></div>
            <span class="text-sm text-gray-500">Preparando etiquetas...</span>
          </div>
        }

        @if (error()) {
          <div class="state-center">
            <div class="error-card">
              <p class="font-semibold text-gray-800 mb-1">No se pudo cargar</p>
              <p class="text-sm text-gray-500">{{ error() }}</p>
              <button (click)="loadData()" class="mt-4 text-sm text-blue-600 hover:underline">
                Reintentar
              </button>
            </div>
          </div>
        }

        @if (!loading() && !error()) {
          <app-label-sheet [labels]="allLabels()" />
        }

      </div>
    </div>
  `,
  styles: [`
    .print-overlay {
      position: fixed;
      inset: 0;
      z-index: 50;
      background: #f3f4f6;
      display: flex;
      flex-direction: column;
    }

    .control-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px;
      background: #111827;
      color: white;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }

    .control-bar__left {
      display: flex;
      align-items: center;
      gap: 16px;
      min-width: 0;
    }

    .reception-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      min-width: 0;
    }

    .btn-back {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.875rem;
      color: #9ca3af;
      transition: color 0.15s;
      flex-shrink: 0;
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
    }
    .btn-print:hover:not(:disabled) { background: #f3f4f6; }
    .btn-print:disabled { opacity: 0.4; cursor: not-allowed; }

    .content-area {
      flex: 1;
      overflow-y: auto;
      padding: 24px 0;
    }

    .state-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 12px;
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 2px solid #d1d5db;
      border-top-color: #374151;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error-card {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      text-align: center;
      max-width: 360px;
    }

    /* ── Print ─────────────────────────────────────────────────────────────── */
    @media print {
      /*
       * El overlay pasa de fixed a static para que el browser
       * pueda paginar el contenido normalmente sin clipping.
       */
      .print-overlay {
        position: static;
        background: white;
        display: block;
      }

      .content-area {
        overflow: visible;
        padding: 0;
      }

      @page {
        size: A4 portrait;
        margin: 0;
      }
    }
  `],
})
export class PrintLabelsComponent implements OnInit, OnDestroy {
  receptionId = input.required<number>();
  closed = output<void>();

  private http = inject(HttpClient);

  reception = signal<ReceptionLabelsDto | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  allLabels = computed<LabelData[]>(() => {
    const data = this.reception();
    if (!data) return [];
    return data.items.flatMap(item =>
      Array.from({ length: item.quantity }, (): LabelData => ({
        variantId: item.variantId,
        sku: item.sku,
        productName: item.productName,
        brandName: item.brandName,
        size: item.size,
        color: item.color,
        gender: item.gender,
        price: item.price,
        receptionId: data.receptionId,
      }))
    );
  });

  totalLabels = computed(() => this.allLabels().length);

  formattedDate = computed(() => {
    const data = this.reception();
    if (!data) return '';
    return new Date(data.receptionDate).toLocaleDateString('es-BO', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  });

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
    this.loadData();
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http
      .get<ReceptionLabelsDto>(`http://192.168.100.124:5253/api/Reception/${this.receptionId()}/labels`)
      .subscribe({
        next: data => {
          this.reception.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar las etiquetas.');
          this.loading.set(false);
        },
      });
  }

  print(): void {
    window.print();
  }
}
