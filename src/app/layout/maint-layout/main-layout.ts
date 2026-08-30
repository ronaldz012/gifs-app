import { Component, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import sidebar from '../sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import Topbar from '../topbar/topbar';
import { ConnectivityService } from '@core/services/connectivity-service';
import { BranchContextService } from '@core/services/branch-context-service';

@Component({
  selector: 'app-main-layout',
  imports: [sidebar, RouterOutlet, Topbar],
  template: `
<div class="flex h-screen overflow-hidden bg-bg-main relative">
  
  <app-sidebar class="relative z-50" />

  <div class="flex flex-col flex-1 min-w-0 relative z-10">
    @if (!connectivity.isOnline()) {
      <div class="sticky top-0 z-40 flex items-center justify-center gap-2 bg-feedback-warning/15 border-b border-feedback-warning/30 px-4 py-2 text-xs font-bold text-feedback-warning-text">
        <span class="material-icons text-base">wifi_off</span>
        Sin conexión — verificá tu WiFi o datos móviles
      </div>
    }
    <app-topbar />

    <main class="relative flex-1 overflow-y-auto bg-bg-main">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <router-outlet />
      </div>
    </main>

  </div>
</div>
  `,
})
export default class MainLayout {
  readonly connectivity = inject(ConnectivityService);
  private router = inject(Router);
  private branchContext = inject(BranchContextService);

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      const url = (e as NavigationEnd).urlAfterRedirects;
      if (url.startsWith('/login') || url.startsWith('/callback') || url.includes('modal=')) return;
      const active = this.branchContext.active();
      if (!active) return;
      try {
        localStorage.setItem('last_view', JSON.stringify({ branchId: active.branchId, path: url }));
      } catch {}
    });
  }
}