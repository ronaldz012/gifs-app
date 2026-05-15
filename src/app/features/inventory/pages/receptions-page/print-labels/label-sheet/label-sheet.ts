import { Component, OnDestroy, OnInit, input, signal, computed } from '@angular/core';
import { LabelItem } from '../label-item/label-item';
import { LabelData, LABELS_PER_SHEET } from '../../../../interfaces/reception-labels';

@Component({
  selector: 'app-label-sheet',
  standalone: true,
  imports: [LabelItem],
  template: `
    <div class="sheets-wrapper"
         [style.transform]="needsZoom() ? 'scale(' + screenZoom() + ')' : 'none'"
         style="transform-origin: top center">
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

    .sheet {
      width: 210mm;
      height: 297mm;       /* height fijo — evita páginas en blanco */
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
