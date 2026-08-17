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

  canSeeToday = computed(() => this.permissionService.canRead('sales', 'sales'));
  canSeeClosure = computed(() => this.permissionService.canRead('sales', 'closures'));
  hasWidgets = computed(() => this.canSeeToday() || this.canSeeClosure());

  menuFeatures = computed(() =>
    this.authService
      .getFeatures()
      .filter((f) => f.isMenu && this.permissionService.hasReadPermission(f)),
  );

  routeSegments(route: string): string[] {
    return ['/', ...route.split('/').filter(Boolean)];
  }

  ngOnInit(): void {
    if (this.canSeeToday()) {
      this.dashboardService.getTodaySales().subscribe({
        next: (d) => this.today.set(d),
        error: () => this.today.set(null),
        complete: () => this.loadingToday.set(false),
      });
    } else {
      this.loadingToday.set(false);
    }

    if (this.canSeeClosure()) {
      this.dashboardService.getLastClosure().subscribe({
        next: (d) => this.lastClosure.set(d),
        error: () => this.lastClosure.set(null),
        complete: () => this.loadingClosure.set(false),
      });
    } else {
      this.loadingClosure.set(false);
    }
  }
}
