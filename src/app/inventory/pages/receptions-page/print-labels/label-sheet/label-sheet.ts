import { Component, OnDestroy, OnInit, input, signal, computed } from '@angular/core';
import { LabelItem } from '../label-item/label-item';
import { LabelData, LABELS_PER_SHEET } from '../../../../interfaces/reception-labels';

@Component({
  selector: 'app-label-sheet',
  standalone: true,
  imports: [LabelItem],
  template: `
    <!--
      .is-zoomed se agrega solo en screen cuando hace falta escalar.
      En print nunca se agrega, así el transform no existe en absoluto.
    -->
    <div class="sheets-wrapper" [class.is-zoomed]="needsZoom()"
         [style.--zoom]="screenZoom()">
      @for (page of pages(); track $index) {
        <div class="sheet">
          @for (label of page; track label.variantId + '_' + $index) {
            <app-label-item [label]="label" />
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

    /* Zoom solo cuando la clase está presente (screen, pantalla estrecha) */
    .sheets-wrapper.is-zoomed {
      transform: scale(var(--zoom, 1));
      transform-origin: top center;
    }

    .sheet {
      width: 210mm;
      min-height: 297mm;
      height: auto;
      padding: 10mm;
      box-sizing: border-box;
      background: white;

      display: grid;
      grid-template-columns: repeat(3, 61mm);
      grid-template-rows: repeat(9, 25mm);
      gap: 1.5mm;
      align-content: start;
    }

    @media screen {
      .sheet {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      }
    }

    @media print {
      .sheets-wrapper {
        display: block;
        gap: 0;
        /* Sin transform en absoluto — la clase is-zoomed nunca se aplica en print,
           pero por si acaso hay algún estado residual: */
        transform: none !important;
      }

      .sheet {
        box-shadow: none;
        /* Fuerza que cada hoja ocupe exactamente una página A4 */
        width: 210mm;
        min-height: 297mm;
        page-break-inside: avoid;
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
  needsZoom = signal(false);

  pages = computed(() => {
    const data = this.labels();
    const chunks: LabelData[][] = [];
    for (let i = 0; i < data.length; i += LABELS_PER_SHEET) {
      chunks.push(data.slice(i, i + LABELS_PER_SHEET));
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
    // No aplicar zoom durante la impresión
    if (window.matchMedia('print').matches) {
      this.needsZoom.set(false);
      return;
    }

    const sheetWidthPx = 210 * (96 / 25.4); // 210mm en px a 96dpi
    const available = window.innerWidth - 40;

    if (available < sheetWidthPx) {
      const zoom = (available / sheetWidthPx).toFixed(4);
      this.screenZoom.set(zoom);
      this.needsZoom.set(true);
    } else {
      this.screenZoom.set('1');
      this.needsZoom.set(false);
    }
  };
}
