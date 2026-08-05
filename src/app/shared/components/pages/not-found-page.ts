import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  template: `
    <div class="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
      <span class="text-6xl font-bold text-gray-300">404</span>
      <h1 class="text-xl font-semibold text-gray-700">Página no encontrada</h1>
      <button
        class="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-700 transition-colors"
        (click)="goHome()"
      >
        Ir al inicio
      </button>
    </div>
  `,
})
export default class NotFoundPage {
  private router = inject(Router);
  goHome() {
    this.router.navigate(['/dashboard']);
  }
}
