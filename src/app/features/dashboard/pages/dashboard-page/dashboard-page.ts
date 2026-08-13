import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard-service';
import { TodaySalesDto } from '../../dtos/today-sales-dto';
import { LastClosureSummaryDto } from '../../dtos/last-closure-summary-dto';
import { PermissionService } from '@features/auth/services/permmision-service';
import { CurrentUserService } from '@features/auth/services/current-user-service';
import { AuthService } from '@features/auth/services/auth-service';

@Component({
  selector: 'app-dashboard-page',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './dashboard-page.html',
})
export default class DashboardPage implements OnInit {
  private dashboardService = inject(DashboardService);
  private permissionService = inject(PermissionService);
  private currentUserService = inject(CurrentUserService);
  private authService = inject(AuthService);

  today = signal<TodaySalesDto | null>(null);
  lastClosure = signal<LastClosureSummaryDto | null>(null);
  loadingToday = signal(true);
  loadingClosure = signal(true);

  readonly username = this.currentUserService.user;

  canSeeToday = computed(() => this.permissionService.canRead('sales', 'pos'));
  canSeeClosure = computed(() => this.permissionService.canRead('sales', 'pos'));
  hasWidgets = computed(() => this.canSeeToday() || this.canSeeClosure());

  menuFeatures = computed(() => {
    const modules = this.authService.getModules();
    return modules.flatMap((m) =>
      m.features.filter((f) => f.isMenu).map((f) => ({ moduleRoute: m.route, feature: f })),
    );
  });

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
