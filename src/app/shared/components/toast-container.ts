import { Component, inject } from '@angular/core';
import { ToastService, ToastType } from '@core/services/toast-service';

const TYPE_ICONS: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

const TYPE_SURFACE: Record<ToastType, string> = {
  success: 'bg-feedback-success text-feedback-success-text',
  error: 'bg-feedback-error text-feedback-error-text',
  warning: 'bg-feedback-warning text-feedback-warning-text',
  info: 'bg-feedback-info text-feedback-info-text',
};

/**
 * Global toast host. Mounted once in `App` so notifications work on every route.
 *
 * <app-toast-container />
 */
@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="fixed top-4 right-4 z-[200] flex flex-col gap-2">
      @for (toast of service.toasts(); track toast.id) {
        <div
          class="toast-in flex items-center gap-3 min-w-56 max-w-sm px-4 py-3 rounded-lg border border-border bg-bg-elevated text-text-main shadow-lg"
        >
          <span class="material-icons text-lg {{ surfaceClass(toast.type) }}">{{
            icon(toast.type)
          }}</span>
          <span class="text-sm font-medium">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
})
export class ToastContainer {
  protected readonly service = inject(ToastService);

  protected TYPE_ICONS = TYPE_ICONS;
  protected TYPE_SURFACE = TYPE_SURFACE;

  protected icon(type: ToastType): string {
    return this.TYPE_ICONS[type];
  }

  protected surfaceClass(type: ToastType): string {
    return this.TYPE_SURFACE[type];
  }
}
