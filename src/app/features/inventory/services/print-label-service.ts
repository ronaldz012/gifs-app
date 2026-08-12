import { Injectable } from '@angular/core';
import { LabelData } from '../interfaces';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

type CodeType = 'qr' | 'barcode';

@Injectable({
  providedIn: 'root',
})
export class LabelPrintService {
  private readonly CONFIG = {
    leftMargin: 12,
    topMargin: 6,
    labelWidth: 60,
    labelHeight: 32,
    gap: 1,
    columns: 3,
    labelsPerSheet: 24,
  };

  public async generatePdf(labels: LabelData[]): Promise<jsPDF> {
    return this.generateWithCode(labels, 'qr');
  }

  public async generatePdfWithBarcode(labels: LabelData[]): Promise<jsPDF> {
    return this.generateWithCode(labels, 'barcode');
  }

  private async generateWithCode(labels: LabelData[], codeType: CodeType): Promise<jsPDF> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    for (let i = 0; i < labels.length; i++) {
      if (i > 0 && i % this.CONFIG.labelsPerSheet === 0) {
        doc.addPage();
      }
      await this.drawLabel(doc, labels[i], i, codeType);
    }

    return doc;
  }

  private async drawLabel(
    doc: jsPDF,
    label: LabelData,
    globalIndex: number,
    codeType: CodeType,
  ): Promise<void> {
    const { x, y } = this.calculatePosition(globalIndex);

    this.drawBorder(doc, x, y);
    if (codeType === 'qr') {
      await this.drawQr(doc, label.sku, x, y);
      this.drawSku(doc, label.sku, x, y);
      this.drawProductInfo(doc, label, x, y);
      this.drawSizeBadge(doc, label.size.toString(), x, y);
      this.drawPrice(doc, label.price, x, y);
    } else {
      await this.drawBarcode(doc, label.sku, x, y);
      this.drawBarcodeDetails(doc, label, x, y);
    }
  }

  private calculatePosition(globalIndex: number): { x: number; y: number } {
    const indexOnSheet = globalIndex % this.CONFIG.labelsPerSheet;
    const column = indexOnSheet % this.CONFIG.columns;
    const row = Math.floor(indexOnSheet / this.CONFIG.columns);

    return {
      x: this.CONFIG.leftMargin + column * (this.CONFIG.labelWidth + this.CONFIG.gap),
      y: this.CONFIG.topMargin + row * (this.CONFIG.labelHeight + this.CONFIG.gap),
    };
  }

  private drawBorder(doc: jsPDF, x: number, y: number): void {
    doc.setDrawColor(153, 153, 153);
    doc.setLineWidth(0.3);
    doc.rect(x, y, this.CONFIG.labelWidth, this.CONFIG.labelHeight);
  }

  private async drawQr(doc: jsPDF, sku: string, x: number, y: number): Promise<void> {
    try {
      const qrBase64 = await QRCode.toDataURL(sku, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 200,
        color: { dark: '#000000', light: '#ffffff' },
      });
      doc.addImage(qrBase64, 'PNG', x + 2, y + 3, 23, 23);
    } catch (err) {
      console.error('Error generating QR for SKU: ' + sku, err);
    }
  }

  private createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width * 10;
    canvas.height = height * 10;
    canvas.style.width = `${width}mm`;
    canvas.style.height = `${height}mm`;
    return canvas;
  }

  private async drawBarcode(doc: jsPDF, sku: string, x: number, y: number): Promise<void> {
    try {
      const canvas = this.createCanvas(56, 13);
      JsBarcode(canvas, sku, {
        format: 'CODE128',
        height: 105,
        displayValue: false,
        margin: 2,
        background: '#ffffff',
      });
      const barcodeBase64 = canvas.toDataURL('image/png');
      doc.addImage(barcodeBase64, 'PNG', x + 2, y + 2, 56, 13);
    } catch (err) {
      console.error('Error generating barcode for SKU: ' + sku, err);
    }
  }

  private drawBarcodeDetails(doc: jsPDF, label: LabelData, x: number, y: number): void {
    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(label.sku, x + 30, y + 17, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 58, 95);
    doc.text(label.brandName.toUpperCase(), x + 2, y + 19.5);

    const cleanName = (label.productName || '').replace(/[\/\s]+$/, '').trim();
    doc.setFontSize(this.getProductFontSize(cleanName.length));
    doc.setTextColor(17, 17, 17);
    const lines = doc.splitTextToSize(cleanName, 24);
    doc.text(lines.slice(0, 2), x + 2, y + 22);

    doc.setFillColor(0, 0, 0);
    doc.rect(x + 2, y + 26.5, 10, 5, 'F');
    doc.setFont('helvetica', 'bold');
    const sizeFontPt = this.getSizeFontSize(label.size.toString().length);
    doc.setFontSize(sizeFontPt);
    doc.setTextColor(255, 255, 255);
    const badgeCenterY = y + 26.5 + 2.5;
    doc.text(label.size.toString(), x + 7, badgeCenterY + sizeFontPt * 0.3528 * 0.36, {
      align: 'center',
    });

    doc.setFontSize(8.5);
    doc.setTextColor(51, 51, 51);
    doc.text(label.color, x + 15, y + 29.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(0, 0, 0);
    doc.text(`Bs. ${label.price}`, x + 57, y + 29.5, { align: 'right' });
  }

  private drawSku(doc: jsPDF, sku: string, x: number, y: number): void {
    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(sku, x + 13.5, y + 29, { align: 'center' });
  }

  private drawProductInfo(doc: jsPDF, label: LabelData, x: number, y: number): void {
    const infoX = x + 28;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 58, 95);
    doc.text(label.brandName.toUpperCase(), infoX, y + 6);

    const cleanName = (label.productName || '').replace(/[\/\s]+$/, '').trim();
    doc.setFontSize(this.getProductFontSize(cleanName.length));
    doc.setTextColor(17, 17, 17);
    const lines = doc.splitTextToSize(cleanName, 30);
    doc.text(lines.slice(0, 2), infoX, y + 11);

    doc.setFontSize(8.5);
    doc.setTextColor(51, 51, 51);
    doc.text(label.color, infoX, y + 21);
  }

  private drawSizeBadge(doc: jsPDF, size: string, x: number, y: number): void {
    const infoX = x + 28;
    doc.setFillColor(0, 0, 0);
    doc.rect(infoX, y + 26, 10, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(this.getSizeFontSize(size.length));
    doc.setTextColor(255, 255, 255);
    doc.text(size, infoX + 5, y + 29.5, { align: 'center' });
  }

  private drawPrice(doc: jsPDF, price: number | string, x: number, y: number): void {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(0, 0, 0);
    doc.text(`Bs. ${price}`, x + 57, y + 30, { align: 'right' });
  }

  private getProductFontSize(length: number): number {
    if (length <= 16) return 8.5;
    if (length <= 28) return 7.8;
    return 7;
  }

  private getSizeFontSize(length: number): number {
    if (length <= 2) return 11;
    if (length <= 4) return 9;
    return 8;
  }
}
