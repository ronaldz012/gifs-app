import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SessionFeatureDto } from '@features/auth/models/LoginResponse';

@Component({
  selector: 'app-side-menu-option',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-menu-option.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SideMenuOption {
  features = input.required<SessionFeatureDto[]>();
  onNavigate = output<void>();

  routeSegments(route: string): string[] {
    return ['/', ...route.split('/').filter(Boolean)];
  }
}
