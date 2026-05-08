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
        <span class="sep">•</span>
        <span class="reception-badge">#{{ label().receptionId }}</span>
      </div>

      <div class="barcode-wrapper">
        <svg #barcode></svg>
      </div>

      <div class="label-footer">
        <span class="sku">{{ label().sku }}</span>
        <span class="price">Bs. {{ label().price }}</span>
      </div>
    </div>
  `,
  styles: [`
  .label {
    width: 62mm;
    height: 32mm;        /* era 26mm */
    box-sizing: border-box;
    padding: 1.8mm 2.5mm 1.5mm;
    display: flex;
    flex-direction: column;
    gap: 0;
    border: 0.3mm solid #d1d5db;
    overflow: hidden;
    background: white;
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
  }
  .label-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;  /* era flex-start — baseline alinea mejor texto */
    gap: 1.5mm;
    line-height: 1.2;
  }
  .product-name {
    font-size: 7.5pt;
    font-weight: 700;
    color: #111827;
    flex: 1;
    white-space: nowrap;          /* una sola línea como dijiste */
    overflow: hidden;
    text-overflow: ellipsis;      /* corta limpio si es muy largo */
  }
  .brand {
    font-size: 6pt;
    font-weight: 600;
    color: #6b7280;
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.2pt;
    flex-shrink: 0;
  }
  .label-attrs {
    display: flex;
    align-items: center;
    gap: 1mm;
    font-size: 6.5pt;
    font-weight: 500;
    color: #374151;
    white-space: nowrap;
    overflow: hidden;
    margin-top: 0.6mm;
    line-height: 1.2;
  }
  .color {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .sep {
    color: #9ca3af;
    font-size: 5.5pt;
    flex-shrink: 0;
  }
  .barcode-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;              /* ocupa todo el espacio disponible */
    margin: 1mm 0 0.5mm;
  }
  .label-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 1;
  }
  .sku {
    font-size: 6pt;
    color: #6b7280;
    font-family: 'Courier New', monospace;
  }
  .price {                /* nuevo — reemplaza .reception en footer */
    font-size: 7pt;
    font-weight: 700;
    color: #111827;
  }
  .reception-badge {      /* nuevo — va en attrs row */
    font-size: 6pt;
    color: #9ca3af;
    font-weight: 600;
    flex-shrink: 0;
  }
`]
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
      width: 1.4,      // era 1.2 — módulo un poco más ancho
      height: 62,      // era 18 — en px, equivale a ~22mm a 72dpi
      displayValue: false,
      margin: 0,
      background: 'transparent',
    });
  }
}
