import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Component, OnInit, EventEmitter, Input, forwardRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ClockType } from '../interfaces-and-types';
import { twoDigits, formatHours } from '../util';
import { MatTimepickerComponentDialogComponent } from '../timepicker-dialog/timepicker-dialog.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// import * as moment_ from 'moment';
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
export class MatTimepickerComponent implements OnInit, ControlValueAccessor {
  isAlive: Subject<any> = new Subject<any>();

  /** Override the label of the ok button. */
  @Input() okLabel = 'Ok';
  /** Override the label of the cancel button. */
  @Input() cancelLabel = 'Cancel';
  /** Sets the clock mode, 12-hour or 24-hour clocks are supported. */
  @Input() mode: ClockType = '24h';
  @Input() disabled = false;
  @Input() color = 'primary';

  @Input() set min(value: Date | Moment) {
    this._minValue = this.getHourMins(value);
  }

  @Input() set max(value: Date | Moment) {
    this._maxValue = this.getHourMins(value);
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
  private _minValue: { minutes: number, hours: number };
  // tslint:disable-next-line:variable-name
  private _maxValue: { minutes: number, hours: number };


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


  private getHourMins(value: Date | Moment) {
    if (moment.isMoment(value)) {
      return {
        hours: value.hours(),
        minutes: value.minutes()
      };
    }
    return {
      hours: value.getHours(),
      minutes: value.getMinutes()
    };
  }

  ngOnInit() {
    if (!this.value) {
      const defaultValue = new Date();
      defaultValue.setSeconds(0);
      defaultValue.setMilliseconds(0);
      this.value = defaultValue;
    }
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
