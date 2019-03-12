import { MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, EventEmitter, Output, Inject } from '@angular/core';
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
    if (this.select === 'h') {
      this.hours = value;
    } else {
      this.minutes = value;
    }

    const newValue = new Date();
    newValue.setHours(this.hours);
    newValue.setMinutes(this.minutes);
    newValue.setSeconds(0);
    newValue.setMilliseconds(0);
    this.value = newValue;
    this.changeEvent.emit(newValue);
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
  }

  editMinutes() {
    this.select = 'm';
    this.currentMode = 'minutes';
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
    this.okClickEvent.emit();
  }

  cancelClickHandler() {
    this.cancelClickEvent.emit();
  }
}
