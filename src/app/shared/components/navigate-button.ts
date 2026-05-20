import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Reusable navigation button — renders a styled CTA that navigates
 * to the given route via `Router.navigate()`.
 *
 * Usage:
 *   <app-navigate-button
 *     label="Nueva transferencia"
 *     shortLabel="+ Nueva"
 *     [route]="['inventory','transfers','new']"
 *   />
 */
@Component({
  selector: 'app-navigate-button',
  standalone: true,
  template: `
    <button
      type="button"
      (click)="navigate()"
      class="px-4 py-2 rounded-lg text-sm font-medium
             bg-btn-primary-bg text-btn-primary-text
             hover:bg-btn-primary-hover transition-colors duration-150
             whitespace-nowrap cursor-pointer">
      <span class="hidden sm:inline">{{ label() }}</span>
      @if (shortLabel()) {
        <span class="sm:hidden">{{ shortLabel() }}</span>
      }
    </button>
  `,
})
export class NavigateButton {
  private readonly router = inject(Router);

  label      = input.required<string>();
  shortLabel = input<string>('');
  route      = input.required<string[]>();

  navigate(): void {
    this.router.navigate(this.route());
  }
}
