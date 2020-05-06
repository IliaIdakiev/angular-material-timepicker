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
  }
}
