import { Component, ElementRef, OnDestroy, output, signal, ViewChild } from '@angular/core';

@Component({
  selector: 'app-qr-scanner-modal',
  imports: [],
  templateUrl: './qr-scanner-modal.html',
  styles: `
    @keyframes modal-in {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .modal-enter { animation: modal-in 180ms ease both; }
  `,
})
export class QrScannerModal implements OnDestroy {

  scanned = output<string>();
  closed = output<void>();

  isOpen = signal(false);
  isInitializing = signal(false);
  errorMsg = signal<string | null>(null);

  private mediaStream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private detector: any = null;
  
  // NUEVO: Guardamos el elemento de video cuando Angular lo dibuja
  private videoNode: HTMLVideoElement | null = null;

  @ViewChild('videoEl')
  set videoElement(ref: ElementRef<HTMLVideoElement> | undefined) {
    if (ref) {
      this.videoNode = ref.nativeElement;
      // Intenta conectar si la cámara ya había llegado
      this.tryBindStream();
    } else {
      this.videoNode = null;
    }
  }

  async open(): Promise<void> {
    this.errorMsg.set(null);
    this.isOpen.set(true);
    this.isInitializing.set(true); // Muestra el spinner de "Iniciando cámara..."

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
      this.detector = new BarcodeDetectorClass({ formats: ['qr_code'] });
      
      // LA MAGIA ESTÁ AQUÍ:
      // Ya tenemos los permisos y la cámara en memoria.
      // Apagamos el estado de "inicializando" para que Angular destruya el spinner
      // y DIBUJE la etiqueta <video> en el HTML.
      this.isInitializing.set(false);
      
      // NOTA: No llamamos a tryBindStream() nosotros mismos aquí. 
      // Al apagar isInitializing, Angular dibuja el <video>, eso dispara
      // tu @ViewChild automáticamente, y el @ViewChild es quien llamará a tryBindStream.

    } catch (err) {
      console.error(err);
      this.errorMsg.set('No se pudo acceder a la cámara.');
      this.isInitializing.set(false);
    }
  }

  private async tryBindStream(): Promise<void> {
    // Si esta función se llama, es porque el @ViewChild ya encontró el <video>
    if (!this.videoNode || !this.mediaStream || !this.detector) {
      return; 
    }

    try {
      this.videoNode.srcObject = this.mediaStream;
      await this.videoNode.play();
      
      // El video ya se está viendo en pantalla, encendemos el escáner invisible
      this.scheduleScan(this.videoNode);
    } catch (err) {
      console.error("Error al reproducir el video:", err);
      this.errorMsg.set('Error al mostrar la imagen.');
    }
  }
  // NUEVO METODO: Solo conecta cuando AMBAS partes están listas


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
    // Limpiamos el nodo al cerrar
    this.videoNode = null;
  }

  ngOnDestroy(): void {
    this.stopHardware();
  }
}

export async function isBarcodeApiAvailable(): Promise<boolean> {
  if (!('BarcodeDetector' in window)) return false;
  try {
    const BarcodeDetectorClass = (window as any).BarcodeDetector;
    const formats: string[] = await BarcodeDetectorClass.getSupportedFormats();
    return formats.includes('qr_code');
  } catch {
    return false;
  }
}