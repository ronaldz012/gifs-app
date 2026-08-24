import { Component, inject} from '@angular/core';
import {BranchSelector} from './branch-selector/branch-selector';
import {UserMenu} from './user-menu/user-menu';
import {SideBarService} from '../services/side-bar-service';

@Component({
  selector: 'app-topbar',
  imports: [
    BranchSelector,
    UserMenu
  ],
  templateUrl: './topbar.html'
})

export  default  class  Topbar{
  readonly sidebarSvc = inject(SideBarService);
}
