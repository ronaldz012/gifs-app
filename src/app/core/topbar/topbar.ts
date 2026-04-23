import { Component } from '@angular/core';
import {BranchSelector} from './branch-selector/branch-selector';
import {UserMenu} from './user-menu/user-menu';

@Component({
  selector: 'app-topbar',
  imports: [
    BranchSelector,
    UserMenu
  ],
  templateUrl: './topbar.html'
})

export  default  class  Topbar{

}
