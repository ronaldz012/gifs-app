import { ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import { RouterLink, RouterLinkActive} from "@angular/router";
import {Module} from '../../auth/interfaces/Respones/LoginResponse';

@Component({
  selector: 'app-side-menu-option',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-menu-option.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SideMenuOption {
  modules    = input.required<Module[]>();
  onNavigate = output<void>();

}
