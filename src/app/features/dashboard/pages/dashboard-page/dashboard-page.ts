import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard-service';
import { TodaySalesDto } from '../../dtos/today-sales-dto';
import { LastClosureSummaryDto } from '../../dtos/last-closure-summary-dto';

@Component({
  selector: 'app-dashboard-page',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './dashboard-page.html',
})
export default class DashboardPage implements OnInit {
  private dashboardService = inject(DashboardService);

  today = signal<TodaySalesDto | null>(null);
  lastClosure = signal<LastClosureSummaryDto | null>(null);
  loadingToday = signal(true);
  loadingClosure = signal(true);

  ngOnInit(): void {
    this.dashboardService.getTodaySales().subscribe({
      next: (d) => this.today.set(d),
      error: () => this.today.set(null),
      complete: () => this.loadingToday.set(false),
    });
    this.dashboardService.getLastClosure().subscribe({
      next: (d) => this.lastClosure.set(d),
      error: () => this.lastClosure.set(null),
      complete: () => this.loadingClosure.set(false),
    });
  }
}
