import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-material-timepicker';

  get minValue() {
    const val = new Date();
    val.setHours(6);
    val.setMinutes(10);
    return val;
  }

  get maxValue() {
    const val = new Date();
    val.setHours(18);
    val.setMinutes(10);
    return val;
  }
}
