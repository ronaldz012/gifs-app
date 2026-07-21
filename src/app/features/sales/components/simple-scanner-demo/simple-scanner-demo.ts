import { Component, ElementRef, signal, ViewChild } from '@angular/core';

@Component({
  selector: 'app-simple-scanner-demo',
  standalone: true,
  template: `
    <button (click)="startCamera()">Start scanner</button>
    <video #videoEl autoplay playsinline muted></video>
    <span>Result: {{ result() }}</span>
  `
})
export class SimpleScannerDemo {
  @ViewChild('videoEl') video!: ElementRef<HTMLVideoElement>;
  result = signal<string | null>(null);

  async startCamera(): Promise<void> {
    // 1. Request camera access (user permission prompt)
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false,
    });

    // 2. Bind the stream to the <video> element
    this.video.nativeElement.srcObject = stream;
    await this.video.nativeElement.play();

    // 3. Create the native BarcodeDetector (Chromium only)
    const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });

    // 4. Detection loop: detect() is GPU-accelerated, no canvas needed
    const scan = async () => {
      const results = await detector.detect(this.video.nativeElement);
      if (results.length > 0) {this.result.set(results[0].rawValue);
      } else {
        requestAnimationFrame(scan); // Keep scanning
      }
    };
    requestAnimationFrame(scan);
  }
}
