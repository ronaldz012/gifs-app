import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SessionFeatureDto } from '@features/auth/models/LoginResponse';
import { PermissionService } from '@features/auth/services/permmision-service';

@Component({
  selector: 'app-side-menu-option',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-menu-option.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SideMenuOption {
  readonly perm = inject(PermissionService);
  features = input.required<SessionFeatureDto[]>();
  onNavigate = output<void>();

  routeSegments(route: string): string[] {
    return ['/', ...route.split('/').filter(Boolean)];
  }
}
