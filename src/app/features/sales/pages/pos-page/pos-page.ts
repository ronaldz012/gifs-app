import { Component, input, signal} from '@angular/core';

@Component({
  selector: 'app-pos-page',
  imports: [
    
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
