import { Component, inject, OnInit, signal } from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-products-page',
  imports: [RouterOutlet],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <!-- Aquí es donde se cargarán los componentes de las rutas hijas -->
      <router-outlet />
    </div>

  `,
  styles: ``,
})
export default class ProductsPage {

}
