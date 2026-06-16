import {
  Component,
  computed,
  input,
} from '@angular/core';
import { LabelData } from '../../../features/inventory/interfaces/reception-labels';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-label-item-qr',
  standalone: true,
  imports: [QRCodeComponent],
  template: `
    <div class="label-card">
      
      <!-- LADO IZQUIERDO: QR (25x25) + SKU con espacio ampliado de 35mm -->
      <div class="left-zone">
        <div class="qr-wrapper">
          <qrcode
            [qrdata]="label().sku"
            [width]="94"
            [margin]="0"
            elementType="svg"
          ></qrcode>
        </div>
        <div class="sku-block">
          {{ label().sku }}
        </div>
      </div>

      <!-- LADO DERECHO: Información compacta e inteligente -->
      <div class="info-zone">
        
        <!-- Fila 1: Marca destacada -->
        <div class="row-1">
          <span class="brand">{{ label().brandName }}</span>
        </div>

        <!-- Fila 2: Nombre del producto -->
        <div class="product-name" [style.font-size]="productFontSize()">
          {{ cleanProductName() }}
        </div>

        <!-- Fila 3: Color optimizado -->
        <div class="row-3">
          <span class="color">{{ label().color }}</span>
        </div>

        <!-- Fila 4: Talla y Precio -->
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

    /* ═══════════════════════════════════════
       Tarjeta Calibrada: 60mm × 35mm (Nueva Altura Ampliada)
       ═══════════════════════════════════════ */
    .label-card {
      width: 60mm;
      height: 35mm; /* Ampliado de 30mm a 35mm */
      box-sizing: border-box;
      padding: 2mm; /* Volvemos a un padding saludable */
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 3mm;
      background: #ffffff;
      border: 0.3mm solid #999999;
      font-family: "Inter", "Segoe UI", sans-serif;
      overflow: hidden;
    }

    /* ── Zona Izquierda: QR y SKU ── */
    .left-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 25mm;
      height: 100%;
      flex-shrink: 0;
    }

    .qr-wrapper {
      width: 25mm;
      height: 25mm;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .qr-wrapper qrcode,
    .qr-wrapper ::ng-deep canvas,
    .qr-wrapper ::ng-deep img,
    .qr-wrapper ::ng-deep svg {
      width: 25mm !important;
      height: 25mm !important;
      display: block;
    }

    /* SKU con espacio garantizado de sobra */
    .sku-block {
      font-family: "Courier New", monospace;
      font-size: 8pt; /* Subido ligeramente para mejor lectura manual */
      font-weight: 800;
      color: #000000;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
      margin-top: 1.5mm; /* Espaciado perfecto respecto al QR */
      line-height: 1.1;
    }

    /* ── Zona Derecha: Información ── */
    .info-zone {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      flex: 1;
      min-width: 0;
    }

    .row-1 {
      line-height: 1;
    }

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

    .row-3 {
      line-height: 1;
    }

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
      .qr-wrapper qrcode,
      .qr-wrapper ::ng-deep svg,
      .qr-wrapper ::ng-deep img,
      .qr-wrapper ::ng-deep canvas {
        width: 25mm !important;
        height: 25mm !important;
      }
    }
  `],
})
export class LabelItemQr {
  label = input.required<LabelData>();

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