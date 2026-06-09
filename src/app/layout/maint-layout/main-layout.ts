import { Component } from '@angular/core';
import sidebar from '../sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import Topbar from '../topbar/topbar';

@Component({
  selector: 'app-main-layout',
  imports: [sidebar, RouterOutlet, Topbar],
  template: `
<div class="flex h-screen overflow-hidden bg-bg-main">
  <app-sidebar />

  <div class="flex flex-col flex-1 min-w-0">
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
export default class MainLayout { }
