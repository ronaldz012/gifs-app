import {
  Component,
  computed,
  input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  effect
} from '@angular/core';
import { LabelData } from '../../../features/inventory/interfaces/reception-labels';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-label-item-bc',
  standalone: true,
  imports: [],
  template: `
    <div class="label-card">
      
      <!-- LADO IZQUIERDO -->
      <div class="left-zone">
        <div class="barcode-rotated-container">
          <div class="barcode-wrapper">
            <svg #barcodeCanvas></svg>
          </div>
          <div class="sku-block">
            {{ label().sku }}
          </div>
        </div>
      </div>

      <!-- LADO DERECHO -->
      <div class="info-zone">
        <div class="row-1">
          <span class="brand">{{ label().brandName }}</span>
        </div>

        <div class="product-name" [style.font-size]="productFontSize()">
          {{ cleanProductName() }}
        </div>

        <div class="row-3">
          <span class="color">{{ label().color }}</span>
        </div>

        <div class="row-4">
          <div class="size-badge" [style.font-size]="sizeFontSize()">
            {{ label().size }}
          </div>
          <span class="price">Bs. {{ label().price }}</span>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; box-sizing: border-box; }

    .label-card {
      width: 60mm;
      height: 35mm;
      box-sizing: border-box;
      padding: 2mm;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 3mm;
      background: #ffffff;
      border: 0.3mm solid #999999;
      font-family: "Inter", "Segoe UI", sans-serif;
      overflow: hidden;
      position: relative;
    }

    .left-zone {
      width: 25mm;
      height: 100%;
      flex-shrink: 0;
      position: relative;
    }

    .barcode-rotated-container {
      position: absolute;
      top: 50%;
      left: 50%;
      /* 
        width  = largo VISIBLE de las barras (eje horizontal tras la rotación).
        Usamos 30mm para aprovechar casi todo el alto interno de la tarjeta (35mm - 4mm padding).
      */
      width: 30mm;
      /*
        height = grosor VISIBLE del bloque completo (eje vertical tras la rotación).
        Debe caber dentro de los 25mm reservados para la zona izquierda.
      */
      height: 24mm;
      transform: translate(-50%, -50%) rotate(90deg);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .barcode-wrapper {
      width: 100%;
      /*
        Tras la rotación esta "height" se convierte en el largo horizontal visible.
        La subimos a 22mm para que las barras llenen el espacio disponible.
        El resto (2mm aprox.) queda para el SKU debajo.
      */
      height: 22mm;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .barcode-wrapper svg {
      width: 100% !important;
      height: 100% !important;
      display: block;
    }

    .sku-block {
      font-family: "Courier New", monospace;
      font-size: 8.5pt;
      font-weight: 900;
      color: #000000;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
      margin-top: 0.8mm;
      line-height: 1;
      letter-spacing: 0.5px;
    }

    /* ── Zona Derecha ── */
    .info-zone {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      flex: 1;
      min-width: 0;
    }

    .row-1 { line-height: 1; }
    .brand {
      font-size: 8.5pt;
      font-weight: 800;
      color: #1E3A5F;
      text-transform: uppercase;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
    }

    .product-name {
      font-weight: 700;
      color: #111111;
      line-height: 1.25;
      height: 2.5em;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow-wrap: break-word;
      word-break: normal;
    }

    .row-3 { line-height: 1; }
    .color {
      font-size: 8.5pt;
      font-weight: 700;
      color: #333333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
    }

    .row-4 {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      line-height: 1;
    }

    .size-badge {
      background: #000000;
      color: #ffffff;
      font-weight: 900;
      line-height: 1;
      padding: 1mm 2.5mm;
      border-radius: 0.5mm;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .price {
      font-size: 10.5pt;
      font-weight: 900;
      color: #000000;
      white-space: nowrap;
    }

    @media print {
      .label-card { overflow: visible !important; }
    }
  `],
})
export class LabelItemBc implements AfterViewInit {
  @ViewChild('barcodeCanvas') barcodeCanvas!: ElementRef<SVGElement>;
  
  label = input.required<LabelData>();

  constructor() {
    effect(() => {
      this.generateBarcode();
    });
  }

  ngAfterViewInit(): void {
    this.generateBarcode();
  }

  private generateBarcode(): void {
    if (this.barcodeCanvas && this.barcodeCanvas.nativeElement) {
      JsBarcode(this.barcodeCanvas.nativeElement, this.label().sku, {
        format: 'CODE128',
        displayValue: false,
        background: '#ffffff',
        lineColor: '#000000',
        margin: 0,
        height: 100,  // Alto interno del SVG vectorial — más alto = barras más robustas antes de escalar
        width: 2,     // Grosor de cada barra individual
        flat: true
      });
    }
  }

  cleanProductName = computed(() => {
    const name = this.label().productName || '';
    return name.replace(/[\/\s]+$/, '').trim();
  });

  productFontSize = computed(() => {
    const len = this.cleanProductName().length;
    if (len <= 16) return '8.5pt';
    if (len <= 28) return '7.8pt';
    return '7pt';
  });

  sizeFontSize = computed(() => {
    const len = this.label().size.toString().length;
    if (len <= 2) return '11pt';
    if (len <= 4) return '9pt';
    return '8pt';
  });
}