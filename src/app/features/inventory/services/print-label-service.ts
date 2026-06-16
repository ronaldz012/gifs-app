import { Injectable } from '@angular/core';
import { LabelData } from '../interfaces';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

@Injectable({
  providedIn: 'root',
})
export class LabelPrintService {
  private readonly CONFIG = {
    margenIzquierdo: 12,
    margenSuperior: 6,
    anchoEtiqueta: 60,
    altoEtiqueta: 32,
    gap: 1,
    columnas: 3,
    labelsPerSheet: 24,
  };

  public async generarPdf(labels: LabelData[]): Promise<jsPDF> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    for (let i = 0; i < labels.length; i++) {
      if (i > 0 && i % this.CONFIG.labelsPerSheet === 0) {
        doc.addPage();
      }
      await this.dibujarEtiqueta(doc, labels[i], i);
    }

    return doc;
  }

  private async dibujarEtiqueta(doc: jsPDF, label: LabelData, indiceGlobal: number): Promise<void> {
    const { x, y } = this.calcularPosicion(indiceGlobal);

    this.dibujarBorde(doc, x, y);
    await this.dibujarQr(doc, label.sku, x, y);
    this.dibujarSku(doc, label.sku, x, y);
    this.dibujarInfoProducto(doc, label, x, y);
    this.dibujarBadgeTalla(doc, label.size.toString(), x, y);
    this.dibujarPrecio(doc, label.price, x, y);
  }

  private calcularPosicion(indiceGlobal: number): { x: number; y: number } {
    const indiceEnHoja = indiceGlobal % this.CONFIG.labelsPerSheet;
    const columna = indiceEnHoja % this.CONFIG.columnas;
    const fila = Math.floor(indiceEnHoja / this.CONFIG.columnas);

    return {
      x: this.CONFIG.margenIzquierdo + columna * (this.CONFIG.anchoEtiqueta + this.CONFIG.gap),
      y: this.CONFIG.margenSuperior + fila * (this.CONFIG.altoEtiqueta + this.CONFIG.gap),
    };
  }

  private dibujarBorde(doc: jsPDF, x: number, y: number): void {
    doc.setDrawColor(153, 153, 153);
    doc.setLineWidth(0.3);
    doc.rect(x, y, this.CONFIG.anchoEtiqueta, this.CONFIG.altoEtiqueta);
  }

  private async dibujarQr(doc: jsPDF, sku: string, x: number, y: number): Promise<void> {
    try {
      const qrBase64 = await QRCode.toDataURL(sku, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 200,
        color: { dark: '#000000', light: '#ffffff' },
      });
      doc.addImage(qrBase64, 'PNG', x + 2, y + 3, 23, 23);
    } catch (err) {
      console.error('Error generando QR para SKU: ' + sku, err);
    }
  }

  private dibujarSku(doc: jsPDF, sku: string, x: number, y: number): void {
    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(sku, x + 13.5, y + 29, { align: 'center' });
  }

  private dibujarInfoProducto(doc: jsPDF, label: LabelData, x: number, y: number): void {
    const xInfo = x + 28;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 58, 95);
    doc.text(label.brandName.toUpperCase(), xInfo, y + 6);

    const nombreLimpio = (label.productName || '').replace(/[\/\s]+$/, '').trim();
    doc.setFontSize(this.obtenerFontSizeProducto(nombreLimpio.length));
    doc.setTextColor(17, 17, 17);
    const lineas = doc.splitTextToSize(nombreLimpio, 30);
    doc.text(lineas.slice(0, 2), xInfo, y + 11);

    doc.setFontSize(8.5);
    doc.setTextColor(51, 51, 51);
    doc.text(label.color, xInfo, y + 21);
  }

  private dibujarBadgeTalla(doc: jsPDF, talla: string, x: number, y: number): void {
    const xInfo = x + 28;
    doc.setFillColor(0, 0, 0);
    doc.rect(xInfo, y + 26, 10, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(this.obtenerFontSizeTalla(talla.length));
    doc.setTextColor(255, 255, 255);
    doc.text(talla, xInfo + 5, y + 29.5, { align: 'center' });
  }

  private dibujarPrecio(doc: jsPDF, price: number | string, x: number, y: number): void {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(0, 0, 0);
    doc.text(`Bs. ${price}`, x + 57, y + 30, { align: 'right' });
  }

  private obtenerFontSizeProducto(length: number): number {
    if (length <= 16) return 8.5;
    if (length <= 28) return 7.8;
    return 7;
  }

  private obtenerFontSizeTalla(length: number): number {
    if (length <= 2) return 11;
    if (length <= 4) return 9;
    return 8;
  }
}