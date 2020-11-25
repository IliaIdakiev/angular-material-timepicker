import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, EventEmitter, Output, Inject, DoCheck, TemplateRef } from '@angular/core';
import { ClockViewType, ClockMode, IAllowed24HourMap, IAllowed12HourMap } from '../interfaces-and-types';
import { twoDigits, convertHoursForMode } from '../util';
import { MatTimepickerButtonTemplateContext } from '../timepicker.directive';

@Component({
  selector: 'mat-timepicker-dialog',
  templateUrl: './timepicker-dialog.component.html',
  styleUrls: ['./timepicker-dialog.component.scss']
})
export class MatTimepickerComponentDialogComponent implements DoCheck {

  twoDigits = twoDigits;

  @Output() changeEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() okClickEvent: EventEmitter<any> = new EventEmitter<Date>();
  @Output() cancelClickEvent: EventEmitter<any> = new EventEmitter<any>();

  allowed24HourMap: IAllowed24HourMap = null;
  allowed12HourMap: IAllowed12HourMap = null;

  invalidSelection = false;

  okLabel: string;
  cancelLabel: string;

  okButtonTemplate: TemplateRef<MatTimepickerButtonTemplateContext>;
  cancelButtonTemplate: TemplateRef<MatTimepickerButtonTemplateContext>;

  anteMeridiemAbbreviation: string;
  postMeridiemAbbreviation: string;

  set value(value: any) {
    value = value || this.minDate || this.maxDate || new Date();
    this.hours = value.getHours();
    this.minutes = value.getMinutes();
    this._value = value;
  }

  get value() { return this._value; }

  mode: ClockMode;
  viewType: ClockViewType = 'hours';

  minutes: any;
  color: string;
  isPm = false;
  skipMinuteAutoSwitch = false;
  autoSwitchID = null;
  invalidMedianID = null;
  hasInvalidMeridiem = false;
  editHoursClicked = false;
  isClosing = false;

  minDate: Date;
  maxDate: Date;

  // tslint:disable-next-line:variable-name
  _formattedHour: any;
  // tslint:disable-next-line:variable-name
  _hours: any;
  // tslint:disable-next-line:variable-name
  _value: Date;

  set hours(value: any) {
    this._hours = value;
    this._formattedHour = convertHoursForMode(this.hours, this.mode).hour;
  }
  get hours() { return this._hours; }

  get formattedHours() { return this._formattedHour; }

  bindData(data: any) {
    this.mode = data.mode;
    this.okLabel = data.okLabel;
    this.cancelLabel = data.cancelLabel;
    this.okButtonTemplate = data.okButtonTemplate;
    this.cancelButtonTemplate = data.cancelButtonTemplate;
    this.anteMeridiemAbbreviation = data.anteMeridiemAbbreviation;
    this.postMeridiemAbbreviation = data.postMeridiemAbbreviation;
    this.color = data.color;
    this.minDate = data.minDate;
    this.maxDate = data.maxDate;
    this.allowed12HourMap = data.allowed12HourMap;
    this.allowed24HourMap = data.allowed24HourMap;
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data) {
    this.isPm = data.isPm;
    this.bindData(data);
    // keep this always at the bottom
    this.value = data.value;
  }

  ngDoCheck() { this.bindData(this.data); }

  handleClockChange({ value, type }: { value: number, type: 'minutes' | 'hours' }) {
    const is24hoursAutoMeridiemChange = this.mode === '24h' && type === 'hours' && (
      (this.hours >= 12 && value < 12) || (this.hours < 12 && value >= 12));
    if ((this.hasInvalidMeridiem && this.mode === '12h') || is24hoursAutoMeridiemChange) {
      this.isPm = !this.isPm;
      this.hasInvalidMeridiem = false;
    }

    if ((type && type === 'hours') || (!type && this.viewType === 'hours')) {
      this.hours = value;
    } else if ((type && type === 'minutes') || (!type && this.viewType === 'minutes')) {
      this.minutes = value;
    }

    const newValue = new Date();
    const hours = this.isPm ? this.hours < 12 ? this.hours + 12 : this.hours : this.hours === 12 ? 0 : this.hours;
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

    if (this.viewType === 'hours' && !this.skipMinuteAutoSwitch) {
      this.autoSwitchID = setTimeout(() => {
        this.editMinutes();
        this.autoSwitchID = null;
      }, 300);
    }
  }

  editHours() {
    this.viewType = 'hours';
    this.editHoursClicked = true;
    setTimeout(() => { this.editHoursClicked = false; }, 0);
  }

  editMinutes() {
    if (this.hasInvalidMeridiem) {
      this.isPm = !this.isPm;
      this.hasInvalidMeridiem = false;
    }
    this.viewType = 'minutes';
  }

  invalidSelectionHandler(value) {
    this.invalidSelection = value;
  }


  invalidMeridiem() {
    if (this.viewType !== 'minutes' && this.editHoursClicked) {
      if (this.invalidMedianID) { return; }
      this.invalidMedianID = setTimeout(() => {
        this.isPm = !this.isPm;
        this.hasInvalidMeridiem = false;
      }, 0);
      return;
    }
    this.hasInvalidMeridiem = true;
  }

  meridiemChange(hours) {
    const changeData = {
      type: this.viewType,
      value: this.viewType === 'hours' ? hours : this.value.getMinutes()
    };
    this.handleClockChange(changeData);
  }


  setAm() {
    if (this.hours >= 12) {
      this.hours = this.hours - 12;
    }
    this.isPm = false;

    this.meridiemChange(this.hours);
  }

  setPm() {
    if (this.hours < 12) {
      this.hours = this.hours + 12;
    }
    this.isPm = true;
    this.meridiemChange(this.hours);
  }

  okClickHandler = () => {
    if (this.hasInvalidMeridiem) {
      this.isPm = !this.isPm;
      this.hasInvalidMeridiem = false;
    }
    this.okClickEvent.emit(this.value);
  }

  cancelClickHandler = () => {
    this.cancelClickEvent.emit();
  }

}
