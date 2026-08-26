import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SideBarService {
  readonly isOpen = signal(false);

  private handlingPopState = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => {
        if (this.isOpen() && window.innerWidth < 768) {
          this.handlingPopState = true;
          this.isOpen.set(false);
          // Keep history consistent: re-push current state so back doesn't navigate away
          history.pushState(null, '', window.location.href);
          setTimeout(() => (this.handlingPopState = false));
        }
      });

      effect(() => {
        const open = this.isOpen();
        if (this.handlingPopState) return;
        if (open && window.innerWidth < 768) {
          history.pushState({ sidebar: true }, '', window.location.href);
        }
      });
    }
  }

  toggle(): void { this.isOpen.update(v => !v); }
  close(): void  { this.isOpen.set(false); }
  open(): void   { this.isOpen.set(true); }
}
