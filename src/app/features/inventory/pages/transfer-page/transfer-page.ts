import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-transfer-page',
  imports: [RouterOutlet],
  template: `
  <div class="max-w-7xl mx-auto w-full">
    <router-outlet />
  </div>`,
})
export default class TransferPage { }
