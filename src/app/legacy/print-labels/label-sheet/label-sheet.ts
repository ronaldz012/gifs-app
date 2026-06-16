import { Component, OnDestroy, OnInit, input, signal, computed } from '@angular/core';
import { LabelItemQr } from '../label-item/label-item-qr';
import { LabelData } from '../../../features/inventory/interfaces/reception-labels';
import { LabelItemBc } from "../label-item/label-item-bc";

// Nota: Cambiado a 28 de forma interna para coincidir con la distribución óptima de 4x7
const NEW_LABELS_PER_SHEET = 24;

@Component({
  selector: 'app-label-sheet',
  standalone: true,
  imports: [LabelItemBc],
  template: `
    <div class="sheets-wrapper"
         [style.transform]="needsZoom() ? 'scale(' + screenZoom() + ')' : 'none'"
         style="transform-origin: top center">
      @for (page of pages(); track $index) {
        <div class="sheet">
          @for (label of page; track label.variantId + '_' + $index) {
            <app-label-item-bc [label]="label" />
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .sheets-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    /* ═══════════════════════════════════════
       Configuración de Hoja A4 Calibrada
       Distribución: 4 Columnas x 7 Filas (28 uds)
       ═══════════════════════════════════════ */
.sheet {
  width: 210mm;
  height: 297mm;         
  padding: 6mm 12mm;     /* Reajustado para centrar verticalmente la nueva cuadrícula */
  box-sizing: border-box;
  background: white;
  display: grid;
  grid-template-columns: repeat(3, 60mm); /* 3 columnas x 60mm = 180mm */
  grid-template-rows: repeat(8, 35mm);    /* ¡CAMBIADO A 35mm! (Ahora caben 8 filas de alto) */
  gap: 1mm;
  align-content: start;
  justify-content: center;
}

    @media screen {
      .sheet { box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
    }

    @media print {
      .sheets-wrapper {
        display: block;
        gap: 0;
        transform: none !important;
      }
      .sheet {
        box-shadow: none;
        page-break-inside: avoid;
        /* Asegura que el navegador respete los límites físicos del A4 */
        margin: 0;
      }
      .sheet:not(:last-child) {
        page-break-after: always;
        break-after: page;
      }
    }
  `],
})
export class LabelSheet implements OnInit, OnDestroy {
  labels = input.required<LabelData[]>();

  screenZoom = signal('1');
  needsZoom  = signal(false);

  // Segmentación reactiva basada en la nueva densidad por hoja
  pages = computed(() => {
    const data = this.labels();
    const chunks: LabelData[][] = [];
    for (let i = 0; i < data.length; i += NEW_LABELS_PER_SHEET) {
      chunks.push(data.slice(i, i + NEW_LABELS_PER_SHEET));
    }
    return chunks;
  });

  ngOnInit(): void {
    this.updateZoom();
    window.addEventListener('resize', this.updateZoom);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.updateZoom);
  }

  private updateZoom = (): void => {
    if (window.matchMedia('print').matches) {
      this.needsZoom.set(false);
      return;
    }
    const sheetWidthPx = 210 * (96 / 25.4);
    const available    = window.innerWidth - 40;
    if (available < sheetWidthPx) {
      this.screenZoom.set((available / sheetWidthPx).toFixed(4));
      this.needsZoom.set(true);
    } else {
      this.screenZoom.set('1');
      this.needsZoom.set(false);
    }
  };
}