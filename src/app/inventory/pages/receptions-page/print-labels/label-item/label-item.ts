import {
  AfterViewInit,
  Component,
  ElementRef,
  computed,
  input,
  viewChild,
} from '@angular/core';
import JsBarcode from 'jsbarcode';
import {GenderLabel, LabelData} from '../../../../interfaces/reception-labels';

@Component({
  selector: 'app-label-item',
  standalone: true,
  template: `
    <div class="label">
      <div class="label-header">
        <span class="product-name">{{ label().productName }}</span>
        <span class="brand">{{ label().brandName }}</span>
      </div>

      <div class="label-attrs">
        <span>{{ label().size }}</span>
        <span class="sep">•</span>
        <span class="color">{{ label().color }}</span>
        <span class="sep">•</span>
        <span>{{ genderLabel() }}</span>
      </div>

      <div class="barcode-wrapper">
        <svg #barcode></svg>
      </div>

      <div class="label-footer">
        <span class="sku">{{ label().sku }}</span>
        <span class="reception">#{{ label().receptionId }}</span>
      </div>
    </div>
  `,
  styles: [`
    .label {
      width: 62mm;
      height: 26mm;
      box-sizing: border-box;
      padding: 2mm 2.5mm 1.5mm;
      display: flex;
      flex-direction: column;
      gap: 0;
      border: 0.3mm solid #d1d5db;
      overflow: hidden;
      background: white;
      font-family: 'DM Sans', 'Segoe UI', sans-serif;
    }

    /* ── Header ── */
    .label-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1.5mm;
    }

    .product-name {
      font-size: 7.5pt;
      font-weight: 700;
      color: #111827;
      flex: 1;
      line-height: 1.2;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .brand {
      font-size: 6pt;
      font-weight: 600;
      color: #6b7280;
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 0.2pt;
      padding-top: 0.5mm;
    }

    /* ── Atributos ── */
    .label-attrs {
      display: flex;
      align-items: center;
      gap: 1mm;
      font-size: 7pt;
      font-weight: 500;
      color: #374151;
      flex-wrap: nowrap;
      margin-top: 0.8mm;
    }

    .color {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .sep {
      color: #9ca3af;
      font-size: 6pt;
      flex-shrink: 0;
    }

    /* ── Barcode ── */
    .barcode-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 1mm 0 0.5mm;
    }

    .barcode-wrapper svg {
      display: block;
      /* JsBarcode controla el tamaño real via width/height params */
    }

    /* ── Footer ── */
    .label-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .sku {
      font-size: 7pt;
      color: #6b7280;
      font-family: 'Courier New', monospace;
    }

    .reception {
      font-size: 7pt;
      color: #9ca3af;
      font-weight: 600;
    }

    @media print {
      .label {
        border-color: #e5e7eb;
      }
    }
  `],
})
export class LabelItem implements AfterViewInit {
  label = input.required<LabelData>();
  private barcodeEl = viewChild<ElementRef<SVGElement>>('barcode');
  genderLabel = computed(() => GenderLabel[this.label().gender]);

  ngAfterViewInit(): void {
    const el = this.barcodeEl()?.nativeElement;
    if (!el) return;

    JsBarcode(el, this.label().sku, {
      format: 'CODE128',
      width: 1.2,
      height: 18,
      displayValue: false,
      margin: 0,
      background: 'transparent',
    });
  }
}
