import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormControl, NgForm } from '@angular/forms';
import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  forwardRef,
  ViewChild,
  ElementRef,
  OnChanges,
  Renderer2,
  AfterViewInit,
  OnDestroy,
  Optional,
  SimpleChanges
} from '@angular/core';
import { MatDialog, MatDialogRef, MatInput } from '@angular/material';
import { ITimeData, ClockMode, IAllowed24HourMap, IAllowed12HourMap } from '../interfaces-and-types';
import { twoDigits, convertHoursForMode, isAllowed } from '../util';
import { MatTimepickerComponentDialogComponent } from '../timepicker-dialog/timepicker-dialog.component';
import { Subject } from 'rxjs';
import { takeUntil, first, min } from 'rxjs/operators';

@Component({
  selector: 'mat-timepicker',
  templateUrl: './mat-timepicker.component.html',
  styleUrls: ['./mat-timepicker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MatTimepickerComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: MatTimepickerComponent,
      multi: true
    }
  ]
})
export class MatTimepickerComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy, ControlValueAccessor {
  isAlive: Subject<any> = new Subject<any>();
  isFormControl = false;

  allowed24HourMap: IAllowed24HourMap = null;
  allowed12HourMap: IAllowed12HourMap = null;

  @ViewChild(MatInput, { read: ElementRef }) input: ElementRef;

  /** Override the label of the ok button. */
  @Input() okLabel = 'Ok';
  /** Override the label of the cancel button. */
  @Input() cancelLabel = 'Cancel';

  /** Sets the clock mode, 12-hour or 24-hour clocks are supported. */
  @Input() mode: ClockMode = '24h';
  @Input() disabled = false;
  @Input() color = 'primary';
  @Input() placeholder: string = null;
  @Input() withFormField = false;
  @Input() withIcon = false;
  @Input() iconColor: string;
  @Input() disableDialogOpenOnInputClick = false;
  @Input() disableDialogOpenOnIconClick = false;

  listeners: (() => void)[] = [];

  @Input() minDate: Date;

  @Input() maxDate: Date;

  isMoment = false;

  // tslint:disable-next-line:variable-name
  _isClosing = false;

  // tslint:disable-next-line:variable-name
  _isPm: boolean;
  // tslint:disable-next-line:variable-name
  _value: Date;
  // tslint:disable-next-line:variable-name
  _formattedValueString: string;
  // tslint:disable-next-line:variable-name


  @Input() set value(value: Date) {
    this._value = value;
    const { hour, isPm } = convertHoursForMode(value.getHours(), this.mode);
    this._isPm = isPm;
    this._formattedValueString = this.mode === '12h' ?
      `${hour}:${twoDigits(value.getMinutes())} ${isPm ? 'pm' : 'am'}` :
      `${twoDigits(value.getHours())}:${twoDigits(value.getMinutes())}`;
    this.currentValue = value;
  }

  get value() { return this._value; }

  get isPm() { return this._isPm; }

  get formattedValueString() { return this._formattedValueString; }

  currentValue: Date;
  modalRef: MatDialogRef<MatTimepickerComponentDialogComponent>;
  onChangeFn: any;
  onTouchedFn: any;

  changeEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor(public dialog: MatDialog, private renderer: Renderer2, @Optional() form: NgForm) {
    this.isFormControl = !!form;
  }

  validate({ value }: FormControl) {
    return null;
    // const isNotValid = this.answer !== Number(value);
    // return isNotValid && {
    //   invalid: true
    // }
  }

  inputChangeHandler() {
    const value = this.input.nativeElement.value as string;
    if (!value.includes(':')) { this.writeValue(null); return; }
    const [hours, minutes] = value.split(':');
    const d = new Date();
    d.setHours(+hours);
    d.setMinutes(+minutes);
    this.writeValue(d);
  }

  ngAfterViewInit() {
    this.listeners.push(this.renderer.listen(this.input.nativeElement, 'focus', this.inputFocus));
  }

  inputFocus = (e: FocusEvent) => {
    if ((this.modalRef && this.modalRef.componentInstance.isClosing) || this.disabled || this.disableDialogOpenOnInputClick) { return; }
    this.showDialog();
  }

  ngOnInit() {
    if (!this.value) {
      const defaultValue = new Date();

      defaultValue.setSeconds(0);
      defaultValue.setMilliseconds(0);

      if (!this.minDate && !this.maxDate) { this.value = defaultValue; return; }
      const hasMaxDate = !!this.maxDate;
      const hasMinDate = !!this.minDate;
      if (hasMaxDate && (+defaultValue > +this.maxDate)) {
        defaultValue.setHours(this.maxDate.getHours());
        defaultValue.setMinutes(this.maxDate.getMinutes());
      } else if (!!hasMinDate && (+defaultValue < +this.minDate)) {
        defaultValue.setHours(this.minDate.getHours());
        defaultValue.setMinutes(this.minDate.getMinutes());
      }

      if (hasMinDate || hasMinDate) {
        if (hasMinDate) { this.minDate.setSeconds(0); this.minDate.setMilliseconds(0); }
        if (hasMinDate) { this.maxDate.setSeconds(0); this.maxDate.setMilliseconds(0); }
        this.calculateAllowedMap();
      }

      this.value = defaultValue;
    }
  }

  calculateAllowedMap() {
    if (this.mode === '24h') {
      this.allowed24HourMap = {};
      for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m++) {
          const hourMap = this.allowed24HourMap[h] || {};
          hourMap[m] = isAllowed(h, m, this.minDate, this.maxDate, '24h');
          this.allowed24HourMap[h] = hourMap;
        }
      }
    } else {
      this.allowed12HourMap = { am: {}, pm: {} };
      for (let h = 0; h < 24; h++) {
        const meridiem = h < 12 ? 'am' : 'pm';
        for (let m = 0; m < 60; m++) {
          const hour = (h > 12 ? h - 12 : h === 0 ? 12 : h);
          const hourMap = this.allowed12HourMap[meridiem][hour] || {};
          hourMap[m] = isAllowed(h, m, this.minDate, this.maxDate, '24h');
          this.allowed12HourMap[meridiem][hour] = hourMap;
        }
      }
    }
  }

  ngOnChanges(simpleChanges: SimpleChanges) {

    if (
      (simpleChanges.minDate && !simpleChanges.minDate.isFirstChange &&
        +simpleChanges.minDate.currentValue !== simpleChanges.minDate.previousValue) ||
      (simpleChanges.maxDate && !simpleChanges.maxDate.isFirstChange &&
        +simpleChanges.maxDate.currentValue !== simpleChanges.maxDate.previousValue)
    ) { this.calculateAllowedMap(); }

    if (!this.modalRef || !this.modalRef.componentInstance) { return; }

    this.modalRef.componentInstance.data = {
      mode: this.mode,
      value: this.currentValue,
      okLabel: this.okLabel,
      cancelLabel: this.cancelLabel,
      color: this.color,
      isPm: this.isPm,
      minDate: this.minDate,
      maxDate: this.maxDate,
      allowed12HourMap: this.allowed12HourMap,
      allowed24HourMap: this.allowed24HourMap
    };
  }

  checkValidity(value: Date) {
    if (!value) { return false; }
    const hour = value.getHours();
    const minutes = value.getMinutes();
    const meridiem = this.isPm ? 'PM' : 'AM';
    return isAllowed(hour, minutes, this.minDate, this.maxDate, this.mode, meridiem);
  }

  writeValue(value: Date): void {
    if (!value) { return; }
    this.value = value;
    if (this.isFormControl) { return; }
    const isValid = this.checkValidity(value);
    console.log(isValid);
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
        minDate: this.minDate,
        maxDate: this.maxDate,
        allowed12HourMap: this.allowed12HourMap,
        allowed24HourMap: this.allowed24HourMap
      }
    });
    const instance = this.modalRef.componentInstance;
    instance.changeEvent.pipe(takeUntil(this.isAlive)).subscribe(this.handleChange);
    instance.okClickEvent.pipe(takeUntil(this.isAlive)).subscribe(this.handleOk);
    instance.cancelClickEvent.pipe(takeUntil(this.isAlive)).subscribe(this.handleCancel);
    this.modalRef.beforeClose().pipe(first()).subscribe(() => instance.isClosing = true);
    this.modalRef.afterClosed().pipe(first()).subscribe(() => {
      this.modalRef = null;
      if (this.onTouchedFn) { this.onTouchedFn(); }
      setTimeout(() => { this.input.nativeElement.blur(); });
    });

    this.currentValue = this.value as Date;
  }

  handleChange = (newValue) => {
    if (!newValue) { return; }
    this.currentValue = newValue;
  }

  handleOk = () => {
    if (this.onChangeFn) { this.onChangeFn(this.currentValue); }
    this.changeEvent.emit(this.currentValue);
    this.modalRef.close();
    this.value = this.currentValue;
  }

  iconClickHandler() {
    if (this.disableDialogOpenOnIconClick) { return; }
    this.showDialog();
  }

  handleCancel = () => {
    this.modalRef.close();
  }

  ngOnDestroy() {
    this.isAlive.next();
    this.isAlive.complete();

    this.listeners.forEach(l => l());
  }
}
