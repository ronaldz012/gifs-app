import {
  Component,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { isBarcodeApiAvailable, QrScannerModal } from '@features/sales/components/qr-scanner-modal/qr-scanner-modal';

@Component({
  selector: 'app-pos-page',
  imports: [QrScannerModal],
  templateUrl: './pos-page.html',
  styles: ``,
})
export default class PosPage implements OnInit {
  @ViewChild(QrScannerModal) scanner!: QrScannerModal;

  /** Muestra el botón solo si la API está disponible en este dispositivo */
  scannerAvailable = signal(false);

  /** Lista de códigos escaneados (prueba — luego se reemplaza por llamada al backend) */
  scannedCodes = signal<string[]>([]);

  async ngOnInit(): Promise<void> {
    this.scannerAvailable.set(await isBarcodeApiAvailable());
  }

  openScanner(): void {
    this.scanner.open();
  }

  onScanned(value: string): void {
    // TODO: llamar al backend con `value` para obtener la info del producto
    this.scannedCodes.update((list) => [value, ...list]);
  }

  removeCode(index: number): void {
    this.scannedCodes.update((list) => list.filter((_, i) => i !== index));
  }
}