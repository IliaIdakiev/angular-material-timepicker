import { ControlValueAccessor, NG_VALIDATORS, NgForm, NgControl, FormGroupDirective, FormControl } from '@angular/forms';
import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  ViewChild,
  ElementRef,
  OnChanges,
  Renderer2,
  AfterViewInit,
  OnDestroy,
  Optional,
  SimpleChanges,
  NgZone,
  HostBinding,
  Self,
  Inject,
  forwardRef
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { MatFormFieldControl } from '@angular/material/form-field';
import { ClockMode, IAllowed24HourMap, IAllowed12HourMap } from '../interfaces-and-types';
import { twoDigits, convertHoursForMode, isAllowed, isDateInRange } from '../util';
import { MatTimepickerComponentDialogComponent } from '../timepicker-dialog/timepicker-dialog.component';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { InvalidInputComponent } from '../invalid-input/invalid-input.component';
import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ErrorStateMatcher } from '@angular/material/core';

@Component({
  selector: 'mat-timepicker',
  templateUrl: './mat-timepicker.component.html',
  styleUrls: ['./mat-timepicker.component.scss'],
  providers: [
    // { provide: NG_VALIDATORS, useExisting: forwardRef(() => MatTimepickerComponent), multi: true },
    { provide: MatFormFieldControl, useExisting: MatTimepickerComponent }
  ],
  exportAs: 'matTimepicker'
})
export class MatTimepickerComponent implements
  OnInit,
  OnChanges,
  AfterViewInit,
  OnDestroy,
  ControlValueAccessor,
  MatFormFieldControl<any>
{
  static nextId = 0;

  // tslint:disable-next-line:variable-name
  _errorState = false;
  get errorState() {
    const oldState = this._errorState;
    const parent = this._parentFormGroup || this._parentForm;
    const control = this.ngControl ? this.ngControl.control as FormControl : null;
    const newState = this.errorStateMatcher ? this.errorStateMatcher.isErrorState(control, parent) : oldState;

    if (newState !== oldState) {
      this._errorState = newState;
      this.stateChanges.next();
    }

    return newState;
    // return newState && !!this.ngControl.errors;
  }

  isAlive: Subject<any> = new Subject<any>();
  stateChanges = new Subject<void>();

  @HostBinding() id = `example-tel-input-${MatTimepickerComponent.nextId++}`;
  @HostBinding('class.floating') get shouldLabelFloat() { return this.focused || !this.empty; }
  @HostBinding('attr.aria-describedby') describedBy = '';

  @Input() errorStateMatcher: ErrorStateMatcher;

  @Input()
  get required() {
    return this._required;
  }
  set required(req) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }
  // tslint:disable-next-line:variable-name
  private _required = false;


  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  // tslint:disable-next-line:variable-name
  private _disabled = false;


  @Input()
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }
  // tslint:disable-next-line:variable-name
  private _placeholder: string;

  focused = false;
  pattern: RegExp;

  allowed24HourMap: IAllowed24HourMap = null;
  allowed12HourMap: IAllowed12HourMap = null;

  isInputFocused = false;

  @ViewChild(MatInput, { read: ElementRef }) input: ElementRef;
  // @ViewChild(MatFormField, { read: ElementRef }) formField: ElementRef;

  /** Override the label of the ok button. */
  @Input() okLabel = 'Ok';
  /** Override the label of the cancel button. */
  @Input() cancelLabel = 'Cancel';

  /** Sets the clock mode, 12-hour or 24-hour clocks are supported. */
  @Input() mode: ClockMode = '24h';
  @Input() color = 'primary';

  @Input() disableDialogOpenOnInputClick = false;
  @Input() enableInvalidInputDialog = false;

  controlType = 'angular-material-timepicker';

  listeners: (() => void)[] = [];

  @Input() minDate: Date;
  @Input() maxDate: Date;

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
    if (!value) {
      this._formattedValueString = null;
      this.setInputElementValue(value);
      this.currentValue = value;
      return;
    }

    const { hour, isPm } = convertHoursForMode(value.getHours(), this.mode);
    this._isPm = isPm;
    this._formattedValueString = this.mode === '12h' ?
      `${hour}:${twoDigits(value.getMinutes())} ${isPm ? 'pm' : 'am'}` :
      `${twoDigits(value.getHours())}:${twoDigits(value.getMinutes())}`;

    if (!this.isInputFocused) { this.setInputElementValue(this.formattedValueString); }
    this.currentValue = value;
    this.stateChanges.next();
  }

  get value() { return this._value; }

  get isPm() { return this._isPm; }

  get empty() {
    return !(this.currentValue instanceof Date);
  }

  get formattedValueString() { return this._formattedValueString; }

  currentValue: Date;
  modalRef: MatDialogRef<MatTimepickerComponentDialogComponent>;
  invalidInputModalRef: MatDialogRef<InvalidInputComponent>;
  onChangeFn: any;
  onTouchedFn: any;
  defaultValueSetupId = null;
  combination: string[] = [];

  changeEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    public dialog: MatDialog,
    private renderer: Renderer2,
    private zone: NgZone,
    private fm: FocusMonitor,
    private elRef: ElementRef<HTMLElement>,
    // tslint:disable-next-line:variable-name
    @Optional() private _parentForm: NgForm,
    // tslint:disable-next-line:variable-name
    @Optional() private _parentFormGroup: FormGroupDirective,
    // tslint:disable-next-line:variable-name
    _defaultErrorStateMatcher: ErrorStateMatcher,
  ) {
    this.errorStateMatcher = _defaultErrorStateMatcher;
    if (this.ngControl != null) { this.ngControl.valueAccessor = this; }

    fm.monitor(elRef.nativeElement, true).subscribe(origin => {
      this.focused = !!origin;
      this.stateChanges.next();
    });
  }

  keydownHandler(event: any) {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      this.combination = this.combination.concat(event.code);
      return;
    }
    if (!/^[0-9a-zA-Z\s]{0,1}$/.test(event.key)) { return; }
    const target = event.target;
    const tValue = target.value;
    const value = `${tValue.slice(0, target.selectionStart)}${event.key}${tValue.slice(target.selectionEnd)}`;
    if (value.match(this.pattern) || this.combination.length > 0) { return true; }
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  keyupHandler(event: any) {
    this.combination = this.combination.filter(v => v !== event.code);
  }

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  onContainerClick(event: MouseEvent) {
    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      this.elRef.nativeElement.querySelector('input').focus();
    }
  }


  focusHandler() { this.isInputFocused = true; }

  blurHandler() {
    this.isInputFocused = false;
    this.setInputElementValue(this.formattedValueString);
    if (this.onTouchedFn && this.disableDialogOpenOnInputClick) { this.onTouchedFn(); }
  }

  setInputElementValue(value: any) {
    if (!this.input) { return; }
    Promise.resolve().then(() => {
      this.zone.runOutsideAngular(() => {
        this.renderer.setProperty(this.input.nativeElement, 'value', value);
      });
    });
  }

  validate() {
    const isValueInRange = isDateInRange(this.minDate, this.maxDate, this.currentValue);
    return isValueInRange ? null : { dateRange: true };
  }

  inputChangeHandler = () => {
    let value = this.input.nativeElement.value as string;
    const length = value.length;
    if (length === 0) {
      this.writeValue(null);
      if (this.onChangeFn) { this.onChangeFn(null); }
      return;
    }

    const meridiemResult = value.match(/am|pm/i);
    let meridiem: string | null = null;
    if (meridiemResult) {
      value = value.replace(meridiemResult[0], '');
      [meridiem] = meridiemResult;
    }
    const valueHasColumn = value.includes(':');
    let [hours, minutes]: any = length === 1 ? [value, 0] :
      length === 2 && !valueHasColumn ? [value, 0] : valueHasColumn ? value.split(':') : value.split(/(\d\d)/).filter(v => v);

    hours = +hours;

    if (/\s/.test(minutes)) {
      let other;
      [minutes, other] = minutes.split(/\s/);
      if (other === 'pm' && !isNaN(hours) && hours < 12) { hours += 12; }
    }

    minutes = +minutes;

    if (isNaN(hours) || isNaN(minutes)) {
      this.writeValue(null); return;
    }

    if (hours < 12 && meridiem && meridiem.toLowerCase() === 'pm') {
      hours += 12;
    } else if (hours > 12 && meridiem && meridiem.toLowerCase() === 'am') {
      hours -= 12;
    }

    if (this.mode === '12h' && +hours < 1) {
      hours = '1';
    } else {
      if (+hours > 24) {
        hours = '24';
      } else if (+hours < 0) {
        hours = '0';
      }
    }


    if (+minutes > 59) {
      minutes = '59';
    } else if (+minutes < 0) {
      minutes = '0';
    }

    let d = new Date();
    d.setHours(+hours);
    d.setMinutes(+minutes);

    if (this.enableInvalidInputDialog) {
      const isLessThanMin = this.minDate && +this.minDate > +d;
      const isMoreThanMax = this.maxDate && +this.maxDate < +d;
      if (isLessThanMin || isMoreThanMax) {
        if (isLessThanMin) {
          d = this.minDate;
        } else {
          d = this.maxDate;
        }

        this.invalidInputModalRef = this.dialog.open(InvalidInputComponent, { data: { color: this.color }, width: '200px' });
        this.invalidInputModalRef.componentInstance.okClickEvent.pipe(first()).subscribe(() => {
          this.invalidInputModalRef.close();
          this.invalidInputModalRef = null;
        });

      }
    }

    d.setSeconds(0);
    d.setMilliseconds(0);

    this.writeValue(d);
    if (this.onChangeFn) { this.onChangeFn(d); }
  }

  ngAfterViewInit() {
    this.listeners.push(
      this.renderer.listen(this.input.nativeElement, 'focus', this.inputFocus)
    );
    this.listeners.push(
      this.renderer.listen(this.input.nativeElement, this.enableInvalidInputDialog ? 'change' : 'input', this.inputChangeHandler)
    );
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

      if (hasMinDate || hasMaxDate) {
        if (hasMinDate) { this.minDate.setSeconds(0); this.minDate.setMilliseconds(0); }
        if (hasMaxDate) { this.maxDate.setSeconds(0); this.maxDate.setMilliseconds(0); }
        this.calculateAllowedMap();

        if (!(this.ngControl as any)._rawValidators.find(v => v === this)) {
          (this.ngControl as any)._rawValidators.push(this);
        }
      }

      this.defaultValueSetupId = setTimeout(() => {
        this.defaultValueSetupId = null;
        this.value = defaultValue;
      }, 0);
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

    this.pattern = this.mode === '24h' ? /^[0-9]{1,2}:?([0-9]{1,2})?$/ : /^[0-9]{1,2}:?([0-9]{1,2})?\s?(a|p)?m?$/;

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
    if (this.defaultValueSetupId) {
      clearTimeout(this.defaultValueSetupId);
      this.defaultValueSetupId = null;
    }
    if (value) {
      value.setSeconds(0);
      value.setMilliseconds(0);
    }

    if (+this.value !== +value) { this.value = value; }
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
    if (this.disabled) { return; }
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
    this.modalRef.beforeClosed().pipe(first()).subscribe(() => instance.isClosing = true);
    this.modalRef.afterClosed().pipe(first()).subscribe(() => {
      this.modalRef = null;
      if (this.onTouchedFn) { this.onTouchedFn(); }
      setTimeout(() => { this.elRef.nativeElement.querySelector('input').focus(); });
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

  handleCancel = () => {
    this.modalRef.close();
  }

  ngOnDestroy() {
    this.isAlive.next();
    this.isAlive.complete();
    this.stateChanges.complete();
    this.fm.stopMonitoring(this.elRef.nativeElement);

    this.listeners.forEach(l => l());
  }
}
