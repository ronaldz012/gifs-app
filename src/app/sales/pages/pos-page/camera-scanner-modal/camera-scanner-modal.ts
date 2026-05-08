import { Component, output, signal, computed, OnDestroy, ElementRef, viewChild, AfterViewInit } from '@angular/core';
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

  allowedFormats = [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.CODE_128,
    BarcodeFormat.QR_CODE,
  ];

  videoConstraints = {
    facingMode: 'environment',
    width:  { ideal: 1920 },
    height: { ideal: 1080 },
  } as MediaTrackConstraints;

  lastScannedCode = signal<string | null>(null);
  debugInfo       = signal<string>('esperando cámara...');

  private isLocked      = false;
  private lockTimeout?: ReturnType<typeof setTimeout>;
  private streamWatcher?: ReturnType<typeof setInterval>;

  // ─── Cuando zxing encuentra cámaras, el stream todavía no existe.
  // Sondeamos hasta que el elemento <video> tenga srcObject.
  onCamerasFound(_devices: MediaDeviceInfo[]) {
    this.debugInfo.set('📷 cámara lista, esperando stream...');
    this.startStreamWatcher();
  }

  private startStreamWatcher() {
    this.clearStreamWatcher();
    let attempts = 0;
    const MAX    = 30; // 30 × 200ms = 6 s máximo

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

  private applyFocusConstraints(track: MediaStreamTrack) {
    // applyConstraints es best-effort: si el dispositivo no soporta
    // focusMode simplemente lo ignora, no tira error visible.
    track.applyConstraints({
      advanced: [{ focusMode: 'continuous' } as any],
    } as any).catch(() => {});

    const caps = track.getCapabilities() as any;
    this.debugInfo.set(
      `✅ stream ok | foco: ${caps.focusMode?.join(',') ?? 'auto'}`
    );
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
    clearTimeout(this.lockTimeout);
  }
}
