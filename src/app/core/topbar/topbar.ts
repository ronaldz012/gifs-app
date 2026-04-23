import { Component } from '@angular/core';
import {BranchSelector} from './branch-selector/branch-selector';

@Component({
  selector: 'app-topbar',
  imports: [
    BranchSelector
  ],
  templateUrl: './topbar.html'
})

export  default  class  Topbar{

}
