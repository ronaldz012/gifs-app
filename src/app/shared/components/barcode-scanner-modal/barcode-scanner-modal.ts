import { Component, ElementRef, OnDestroy, output, signal, ViewChild } from '@angular/core';

@Component({
  selector: 'app-barcode-scanner-modal',
  standalone: true,
  imports: [],
  templateUrl: './barcode-scanner-modal.html',
  styles: `
    @keyframes modal-in {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .modal-enter { animation: modal-in 180ms ease both; }
  `,
})
export class BarcodeScannerModal implements OnDestroy {

  scanned = output<string>();
  closed = output<void>();

  isOpen = signal(false);
  isInitializing = signal(false);
  errorMsg = signal<string | null>(null);

  private mediaStream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private detector: any = null;
  
  private videoNode: HTMLVideoElement | null = null;

  @ViewChild('videoEl')
  set videoElement(ref: ElementRef<HTMLVideoElement> | undefined) {
    if (ref) {
      this.videoNode = ref.nativeElement;
      this.tryBindStream();
    } else {
      this.videoNode = null;
    }
  }

  async open(): Promise<void> {
    this.errorMsg.set(null);
    this.isOpen.set(true);
    this.isInitializing.set(true);

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      const BarcodeDetectorClass = (window as any).BarcodeDetector;
      
      // CAMBIO CLAVE: Definimos formatos de códigos de barras comunes
      this.detector = new BarcodeDetectorClass({ 
        formats: [
          'code_128'
        ] 
      });
      
      this.isInitializing.set(false);

    } catch (err) {
      console.error(err);
      this.errorMsg.set('No se pudo acceder a la cámara o la API no es compatible.');
      this.isInitializing.set(false);
    }
  }

  private async tryBindStream(): Promise<void> {
    if (!this.videoNode || !this.mediaStream || !this.detector) {
      return; 
    }

    try {
      this.videoNode.srcObject = this.mediaStream;
      await this.videoNode.play();
      this.scheduleScan(this.videoNode);
    } catch (err) {
      console.error("Error al reproducir el video:", err);
      this.errorMsg.set('Error al mostrar la imagen.');
    }
  }

  private scheduleScan(video: HTMLVideoElement): void {
    const scan = async () => {
      if (!this.isOpen()) return;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        try {
          const results = await this.detector.detect(video);
          if (results.length > 0) {
            this.scanned.emit(results[0].rawValue);
            this.close();
            return;
          }
        } catch {
          // Silencioso
        }
      }
      this.animationFrameId = requestAnimationFrame(scan);
    };

    this.animationFrameId = requestAnimationFrame(scan);
  }

  close(): void {
    this.stopHardware();
    this.isOpen.set(false);
    this.closed.emit();
  }

  private stopHardware(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    this.videoNode = null;
  }

  ngOnDestroy(): void {
    this.stopHardware();
  }
}

// Función auxiliar adaptada para revisar formatos de barra comunes
export async function isBarcodeApiAvailable(): Promise<boolean> {
  if (!('BarcodeDetector' in window)) return false;
  try {
    const BarcodeDetectorClass = (window as any).BarcodeDetector;
    const formats: string[] = await BarcodeDetectorClass.getSupportedFormats();
    // Verifica si soporta al menos el formato EAN-13 (el estándar de productos)
    return formats.includes('ean_13');
  } catch {
    return false;
  }
}