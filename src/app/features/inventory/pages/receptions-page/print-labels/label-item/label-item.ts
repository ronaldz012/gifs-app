import {
  Component,
  computed,
  input,
} from '@angular/core';
import { GenderLabel, LabelData } from '../../../../interfaces/reception-labels';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-label-item',
  imports: [QRCodeComponent],
  template: `
    <div class="label">
      <!-- Columna Izquierda: Información -->
      <div class="info-side">
        <div class="header">
          <span class="brand">{{ label().brandName }}</span>
          <span class="product-name">{{ label().productName }}</span>
        </div>

        <div class="attrs">
          <div class="attr-row">
            <span class="badge">Talla: {{ label().size }}</span>
            <span class="badge">Género: {{ genderLabel() }}</span>
          </div>
          <div class="color-row">Color: {{ label().color }}</div>
        </div>

        <div class="footer">
          <div class="reception">ID: #{{ label().receptionId }}</div>
          <div class="sku">{{ label().sku }}</div>
          <div class="price">Bs. {{ label().price }}</div>
        </div>
      </div>

      <!-- Columna Derecha: QR Gigante -->
      <div class="qr-side">
        <qrcode
          [qrdata]="label().sku"
          [width]="150"
          [margin]="0"
          [errorCorrectionLevel]="'M'"
          elementType="canvas"
        ></qrcode>
      </div>
    </div>
  `,
  styles: [
    `
    .label {
      width: 62mm;
      height: 32mm;
      box-sizing: border-box;
      padding: 1.5mm;
      display: flex;
      flex-direction: row; /* Cambio a horizontal */
      gap: 2mm;
      border: 0.3mm solid #d1d5db;
      background: white;
      font-family: 'DM Sans', 'Segoe UI', sans-serif;
      overflow: hidden;
    }

    /* Lado de la información */
    .info-side {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-width: 0; /* Permite que el texto se corte con ellipsis */
    }

    .brand {
      display: block;
      font-size: 6pt;
      font-weight: 800;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
    }

    .product-name {
      display: block;
      font-size: 8.5pt;
      font-weight: 700;
      color: #111827;
      line-height: 1.1;
      margin-top: 0.5mm;
    }

    .attrs {
      margin-top: 1mm;
      font-size: 7pt;
      color: #374151;
    }

    .attr-row {
      display: flex;
      gap: 2mm;
      margin-bottom: 0.5mm;
    }

    .badge {
      background: #f3f4f6;
      padding: 0.2mm 1.5mm;
      border-radius: 1mm;
      font-weight: 600;
    }

    .color-row {
      font-size: 6.5pt;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .footer {
      margin-top: auto;
      border-top: 0.2mm solid #e5e7eb;
      padding-top: 1mm;
    }

    .sku {
      font-size: 6.5pt;
      font-family: 'Courier New', monospace;
      color: #6b7280;
    }

    .reception {
      font-size: 6pt;
      color: #9ca3af;
    }

    .price {
      font-size: 11pt; /* Precio más grande para destacar */
      font-weight: 800;
      color: #111827;
      margin-top: 0.5mm;
    }

    /* Lado del QR */
    .qr-side {
      width: 29mm; /* Casi la mitad de la etiqueta */
      height: 29mm;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    qrcode {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    qrcode ::ng-deep canvas,
    qrcode ::ng-deep img {
      width: 100% !important;
      height: 100% !important;
      display: block;
    }
    `,
  ],
})
export class LabelItem {
  label = input.required<LabelData>();
  genderLabel = computed(() => GenderLabel[this.label().gender]);
}

