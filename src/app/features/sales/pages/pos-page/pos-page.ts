import { Component, input, signal} from '@angular/core';
import {CameraScannerModalComponent} from './camera-scanner-modal/camera-scanner-modal';

@Component({
  selector: 'app-pos-page',
  imports: [
    CameraScannerModalComponent
  ],
  templateUrl: './pos-page.html',
  styles: ``,
})
export default class PosPage {

  showCamera = signal(false);
  code = signal<string[]>([]);


  addCode($event: string) {
    this.code.update(codes => [...codes, $event])
  }
}
