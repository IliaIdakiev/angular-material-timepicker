import { Component } from '@angular/core';
import { ShowOnDirtyErrorStateMatcher, ErrorStateMatcher } from '@angular/material/core';
import { FormControl } from '@angular/forms';


class CustomErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null) {
    return control.invalid;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-material-timepicker';
  minValue: Date;
  maxValue: Date;
  defaultValue: Date;

  showOnDirtyErrorStateMatcher = new ShowOnDirtyErrorStateMatcher();
  customErrorStateMatcher = new CustomErrorStateMatcher();

  constructor() {
    const minValue = new Date();
    minValue.setHours(6);
    minValue.setMinutes(10);
    this.minValue = minValue;

    const maxValue = new Date();
    maxValue.setHours(18);
    maxValue.setMinutes(10);
    this.maxValue = maxValue;

    const d = new Date();
    d.setDate(1);
    d.setMonth(2);
    d.setHours(7);
    d.setMinutes(0);
    d.setSeconds(1);
    d.setMilliseconds(10);
    this.defaultValue = d;
  }

  timeChangeHandler(data) {
    console.log('time changed to', data);
  }

  invalidInputHandler() {
    console.log('invalid input');
  }
}
