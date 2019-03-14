import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Component, OnInit, EventEmitter, Input, forwardRef, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ClockType, ITimeData } from '../interfaces-and-types';
import { twoDigits, formatHours } from '../util';
import { MatTimepickerComponentDialogComponent } from '../timepicker-dialog/timepicker-dialog.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as moment_ from 'moment';
import { Moment } from 'moment';
const moment = moment_;

@Component({
  selector: 'mat-timepicker',
  templateUrl: './mat-timepicker.component.html',
  styleUrls: ['./mat-timepicker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MatTimepickerComponent),
      multi: true,
    }
  ]
})
export class MatTimepickerComponent implements OnInit, OnChanges, ControlValueAccessor {
  isAlive: Subject<any> = new Subject<any>();

  /** Override the label of the ok button. */
  @Input() okLabel = 'Ok';
  /** Override the label of the cancel button. */
  @Input() cancelLabel = 'Cancel';
  /** Sets the clock mode, 12-hour or 24-hour clocks are supported. */
  @Input() mode: ClockType = '24h';
  @Input() disabled = false;
  @Input() color = 'primary';
  @Input() placeholder: string = null;
  @Input() withFormField = false;

  @Input() set min(value: Date | Moment) {
    this._minValue = value ? this.parseTime(value) : null;
  }

  @Input() set max(value: Date | Moment) {
    this._maxValue = value ? this.parseTime(value) : null;
  }

  isMoment = false;

  // tslint:disable-next-line:variable-name
  _isPm: boolean;
  // tslint:disable-next-line:variable-name
  _value: Date;
  // tslint:disable-next-line:variable-name
  _formattedValueString: string;
  // tslint:disable-next-line:variable-name

  // tslint:disable-next-line:variable-name
  private _minValue: ITimeData;
  // tslint:disable-next-line:variable-name
  private _maxValue: ITimeData;


  @Input() set value(value: Date | Moment) {
    if (moment.isMoment(value)) {
      value = value.toDate();
      this.isMoment = true;
    }
    this._value = value;
    const { hours, isPm } = formatHours(value.getHours(), this.mode);
    this._isPm = isPm;
    this._formattedValueString = this.mode === '12h' ?
      `${hours}:${twoDigits(value.getMinutes())} ${isPm ? 'pm' : 'am'}` :
      `${twoDigits(value.getHours())}:${twoDigits(value.getMinutes())}`;
    this.currentValue = value;
  }

  get value() {
    return this._value;
  }

  get isPm() {
    return this._isPm;
  }

  get formattedValue() {
    return this._formattedValueString;
  }

  currentValue: Date;
  modalRef: MatDialogRef<MatTimepickerComponentDialogComponent>;
  onChangeFn: any;
  onTouchedFn: any;

  changeEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor(public dialog: MatDialog) { }


  private parseTime(value: Date | Moment): ITimeData {
    let hours;
    if (moment.isMoment(value)) {
      hours = value.hours();
      if (value.day() > (new Date()).getDay()) {
        hours = 24;
      }
      return {
        hours,
        minutes: value.minutes(),
        meridiem: moment.localeData().meridiem(value.hours(), value.minutes(), false)
      };
    }
    hours = value.getHours();
    if (value.getDay() > (new Date()).getDay()) {
      hours = 24;
    }
    return {
      hours,
      minutes: value.getMinutes(),
      meridiem: value.toLocaleTimeString('en-US').slice(-2)
    };
  }

  inputKeyupHandler(event: KeyboardEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return false;
  }

  ngOnInit() {
    if (!this.value) {
      const defaultValue = new Date();
      defaultValue.setMilliseconds(0);
      if (!this._minValue && !this._maxValue) {
        defaultValue.setSeconds(0);
        this.value = defaultValue;
      } else if (!this._minValue) {
        defaultValue.setHours(this._maxValue.hours);
        defaultValue.setMinutes(this._maxValue.minutes);
      } else {
        defaultValue.setHours(this._minValue.hours);
        defaultValue.setMinutes(this._minValue.minutes);
      }
      this.value = defaultValue;
    }
  }

  ngOnChanges() {
    if (!this.modalRef || !this.modalRef.componentInstance) { return; }
    this.modalRef.componentInstance.data = {
      mode: this.mode,
      value: this.currentValue,
      okLabel: this.okLabel,
      cancelLabel: this.cancelLabel,
      color: this.color,
      isPm: this.isPm,
      minValue: this._minValue,
      maxValue: this._maxValue
    };
  }

  writeValue(value: Date): void {
    if (!value) { return; }
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  showDialog() {
    this.modalRef = this.dialog.open(MatTimepickerComponentDialogComponent, {
      autoFocus: false,
      data: {
        mode: this.mode,
        value: this.currentValue,
        okLabel: this.okLabel,
        cancelLabel: this.cancelLabel,
        color: this.color,
        isPm: this.isPm,
        minValue: this._minValue,
        maxValue: this._maxValue
      }
    });
    const instance = this.modalRef.componentInstance;
    instance.changeEvent.pipe(takeUntil(this.isAlive)).subscribe(this.handleChange);
    instance.okClickEvent.pipe(takeUntil(this.isAlive)).subscribe(this.handleOk);
    instance.cancelClickEvent.pipe(takeUntil(this.isAlive)).subscribe(this.handleCancel);

    this.currentValue = this.value as Date;
  }

  handleChange = (newValue) => {
    if (!newValue) { return; }
    this.currentValue = newValue;
  }

  handleOk = () => {
    const emitValue = this.isMoment ? moment(this.currentValue) : this.currentValue;
    if (this.onChangeFn) {
      this.onChangeFn(emitValue);
    }
    this.changeEvent.emit(emitValue);
    this.modalRef.close();
    this.value = this.currentValue;
  }

  handleCancel = () => {
    this.modalRef.close();
  }
}
