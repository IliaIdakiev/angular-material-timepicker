import { Component, AfterViewInit } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'angular-material-timepicker';

  get minValue() {
    const val = new Date();
    val.setHours(12);
    val.setMinutes(10);
    return val;
  }

  maxValue: Date;

  constructor() {
    const val = new Date();
    val.setHours(23);
    val.setMinutes(30);
    this.maxValue = val;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const val = new Date();
      val.setHours(23);
      val.setMinutes(40);
      this.maxValue = val;
    }, 10000);
  }
}
