import { Component } from '@angular/core';
import * as moment from 'moment';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-material-timepicker';

  minValue = moment({ hour: 10, minute: 10 });
  maxValue = moment({ hour: 10, minute: 20 });
}
