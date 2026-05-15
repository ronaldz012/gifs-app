import { Component, output, signal, computed, OnDestroy } from '@angular/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-camera-scanner-modal',
  standalone: true,
  imports: [ZXingScannerModule],
  templateUrl: './camera-scanner-modal.html',
  styles: `
    @keyframes confirm-in {
      from { transform: translateY(100%); }
      to   { transform: translateY(0); }
    }
    .confirm-enter {
      animation: confirm-in 250ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    @keyframes scan {
      0%, 100% { transform: translateY(-70px); }
      50%       { transform: translateY(70px); }
    }
    .scan-line {
      animation: scan 1.5s ease-in-out infinite;
    }
  `
})
export class CameraScannerModalComponent implements OnDestroy {
  codeScanned = output<string>();
  close       = output<void>();

  // Formatos: Si ahora usas mayormente QR, deja QR_CODE de primero.
  allowedFormats = [
    BarcodeFormat.QR_CODE,
  ];

  videoConstraints = {
    facingMode: 'environment',
    // 720p es mucho más rápido para el procesado de imagen en JS que 1080p
    width: { ideal: 1280 },
    height: { ideal: 720 },
    aspectRatio: { ideal: 1 }
  } as MediaTrackConstraints;

  lastScannedCode = signal<string | null>(null);
  debugInfo       = signal<string>('esperando cámara...');

  private isLocked      = false;
  private lockTimeout?: ReturnType<typeof setTimeout>;
  private streamWatcher?: ReturnType<typeof setInterval>;

  onCamerasFound(_devices: MediaDeviceInfo[]) {
    this.debugInfo.set('📷 cámara lista, esperando stream...');
    this.startStreamWatcher();
  }

  private startStreamWatcher() {
    this.clearStreamWatcher();
    let attempts = 0;
    const MAX    = 30;

    this.streamWatcher = setInterval(() => {
      attempts++;
      const video = document.querySelector<HTMLVideoElement>('zxing-scanner video');
      const track = (video?.srcObject as MediaStream)?.getVideoTracks()[0];

      if (track) {
        this.clearStreamWatcher();
        this.applyFocusConstraints(track);
        return;
      }

      if (attempts >= MAX) {
        this.clearStreamWatcher();
        this.debugInfo.set('❌ timeout: stream no disponible');
      }
    }, 200);
  }

  private async applyFocusConstraints(track: MediaStreamTrack) {
    const capabilities = track.getCapabilities() as any;

    // Configuramos las restricciones de foco de forma robusta
    const constraints: any = {};

    if (capabilities.focusMode?.includes('continuous')) {
      constraints.focusMode = 'continuous';
    }

    try {
      // Aplicamos de forma "advanced" para forzar el comportamiento en hardware compatible
      await track.applyConstraints({
        advanced: [constraints]
      } as any);

      this.debugInfo.set(
        `✅ Foco automático activo (${constraints.focusMode ?? 'estándar'})`
      );
    } catch (e) {
      this.debugInfo.set('⚠️ Error aplicando foco, usando default');
      console.warn('Error aplicando focus constraints:', e);
    }
  }

  private clearStreamWatcher() {
    if (this.streamWatcher) {
      clearInterval(this.streamWatcher);
      this.streamWatcher = undefined;
    }
  }

  onCodeDetected(code: string) {
    if (this.isLocked) return;
    this.isLocked = true;
    this.debugInfo.set(code);
    this.lastScannedCode.set(code);
    this.codeScanned.emit(code);

    this.lockTimeout = setTimeout(() => {
      this.lastScannedCode.set(null);
      this.isLocked = false;
      this.close.emit();
    }, 2500);
  }

  ngOnDestroy() {
    this.clearStreamWatcher();
    if (this.lockTimeout) clearTimeout(this.lockTimeout);
  }
  onScanError(error: any) {

    console.error('Error de escaneo:', error);
  }

  onScanFailure(result: any) {
    // Esto se dispara muchas veces por segundo si no encuentra nada,
    // pero sirve para saber si el motor está "vivo".
    if (this.isLocked) return;
    this.debugInfo.set('Buscando código...');
  }
}
