import { Component } from '@angular/core';
import sidebar from '../../shared/sidebar/sidebar/sidebar';

@Component({
  selector: 'app-dashboard',
  imports: [sidebar],
  templateUrl: './dashboard.html',
})
export default class Dashboard { }
