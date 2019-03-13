import { MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, EventEmitter, Output, Inject, OnChanges, SimpleChanges } from '@angular/core';
import { ClockType } from '../interfaces-and-types';
import { twoDigits, formatHours } from '../util';

@Component({
  selector: 'mat-timepicker-dialog',
  templateUrl: './timepicker-dialog.component.html',
  styleUrls: ['./timepicker-dialog.component.scss']
})
export class MatTimepickerComponentDialogComponent implements OnInit {

  twoDigits = twoDigits;

  @Output() changeEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() okClickEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() cancelClickEvent: EventEmitter<any> = new EventEmitter<any>();

  okLabel: string;
  cancelLabel: string;
  value: any;
  mode: ClockType = '12h';
  currentMode: ClockType;
  timeInputValue: Date;
  select: 'h' | 'm' = 'h';
  minutes: any;
  color: string;
  isPm = false;
  skipMinuteAutoSwitch = false;
  autoSwitchID = null;
  invalidMedianID = null;
  hasInvalidMeridiem = false;
  editHoursClicked = false;

  minValue: { hours: number, minutes: number };
  maxValue: { hours: number, minutes: number };

  // tslint:disable-next-line:variable-name
  _formattedHours: any;
  // tslint:disable-next-line:variable-name
  _hours: any;

  set hours(value: any) {
    this._hours = value;
    this._formattedHours = formatHours(this.hours, this.mode).hours;
  }
  get hours() {
    return this._hours;
  }

  get formattedHours() {
    return this._formattedHours;
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data) {
    this.value = data.value;
    this.mode = this.currentMode = data.mode;
    this.okLabel = data.okLabel;
    this.cancelLabel = data.cancelLabel;
    this.color = data.color;
    this.isPm = data.isPm;
    this.minValue = data.minValue;
    this.maxValue = data.maxValue;
  }

  ngOnInit() {
    this.select = 'h';
    this.timeInputValue = this.value;

    this.hours = this.timeInputValue.getHours();
    this.minutes = this.timeInputValue.getMinutes();
  }

  handleClockChange(value) {
    if (this.hasInvalidMeridiem) {
      this.isPm = !this.isPm;
      this.hasInvalidMeridiem = false;
    }

    if (this.select === 'h') {
      this.hours = value;
    } else {
      this.minutes = value;
    }

    const newValue = new Date();
    const hours = this.isPm ? this.hours === 12 ? 0 : this.hours < 12 ? this.hours + 12 : this.hours : this.hours;
    newValue.setHours(hours);
    newValue.setMinutes(this.minutes);
    newValue.setSeconds(0);
    newValue.setMilliseconds(0);
    this.value = newValue;
    this.changeEvent.emit(newValue);
  }

  clearInvalidMeridiem() {
    this.hasInvalidMeridiem = false;
  }

  handleUnavailableSelection() {
    clearTimeout(this.autoSwitchID);
  }

  handleClockChangeDone(e) {
    e.preventDefault(); // prevent mouseUp after touchEnd

    if (this.select === 'h' && !this.skipMinuteAutoSwitch) {
      this.autoSwitchID = setTimeout(() => {
        this.editMinutes();
        this.autoSwitchID = null;
      }, 300);
    }
  }

  editHours() {
    this.select = 'h';
    this.currentMode = this.mode;
    this.editHoursClicked = true;
    setTimeout(() => { this.editHoursClicked = false; }, 0);
  }

  editMinutes() {
    if (this.hasInvalidMeridiem) {
      this.isPm = !this.isPm;
      this.hasInvalidMeridiem = false;
    }
    this.select = 'm';
    this.currentMode = 'minutes';
  }


  invalidMeridiem() {
    if (this.mode !== 'minutes' && this.editHoursClicked) {
      if (this.invalidMedianID) { return; }
      this.invalidMedianID = setTimeout(() => {
        this.isPm = !this.isPm;
        this.hasInvalidMeridiem = false;
      }, 0);
      return;
    }
    this.hasInvalidMeridiem = true;
  }


  setAm() {
    if (this.hours >= 12) {
      this.hours = this.hours - 12;
      this.changeEvent.emit();
    }
    this.isPm = false;
  }

  setPm() {
    if (this.hours < 12) {
      this.hours = this.hours + 12;
      this.changeEvent.emit();
    }
    this.isPm = true;
  }

  okClickHandler() {
    if (this.hasInvalidMeridiem) {
      this.isPm = !this.isPm;
      this.hasInvalidMeridiem = false;
    }
    this.okClickEvent.emit();
  }

  cancelClickHandler() {
    this.cancelClickEvent.emit();
  }
}
