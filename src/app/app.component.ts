import { Component } from '@angular/core';
import { ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-material-timepicker';
  minValue: Date;
  maxValue: Date;

  ShowOnDirtyErrorStateMatcher = new ShowOnDirtyErrorStateMatcher();

  constructor() {
    const minValue = new Date();
    minValue.setHours(6);
    minValue.setMinutes(10);
    this.minValue = minValue;

    const maxValue = new Date();
    maxValue.setHours(18);
    maxValue.setMinutes(10);
    this.maxValue = maxValue;
  }
}
