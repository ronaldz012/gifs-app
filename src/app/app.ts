import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainer } from '@shared/components/toast-container';
import { ConnectivityService } from '@core/services/connectivity-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainer],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('gifs-app');
  readonly connectivity = inject(ConnectivityService);
}
