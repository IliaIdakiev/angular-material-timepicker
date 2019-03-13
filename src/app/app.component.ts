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
    val.setHours(12);
    val.setMinutes(10);
    return val;
  }

  get maxValue() {
    const val = new Date();
    val.setHours(23);
    val.setMinutes(30);
    return val;
  }
}
