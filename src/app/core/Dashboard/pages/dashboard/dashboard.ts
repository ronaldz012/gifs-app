import { Component } from '@angular/core';
import sidebar from '../../../sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import Topbar from '../../../topbar/topbar';

@Component({
  selector: 'app-dashboard',
  imports: [sidebar, RouterOutlet, Topbar],
  templateUrl: './dashboard.html',
})
export default class Dashboard { }
