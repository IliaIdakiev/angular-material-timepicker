import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import {
  Component,
  EventEmitter,
  Output,
  Inject,
  DoCheck,
  TemplateRef,
} from '@angular/core';
import {
  ClockViewType,
  ClockMode,
  IAllowed24HourMap,
  IAllowed12HourMap,
} from '../interfaces-and-types';
import { twoDigits, convertHoursForMode } from '../util';
import { MatTimepickerButtonTemplateContext } from '../timepicker.directive';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ClockComponent } from '../clock/clock.component';

@Component({
  selector: 'mat-timepicker-dialog',
  templateUrl: './timepicker-dialog.component.html',
  styleUrls: ['./timepicker-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    ClockComponent,
    MatDialogModule,
  ],
})
export class MatTimepickerComponentDialogComponent implements DoCheck {
  twoDigits = twoDigits;

  @Output() changeEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() okClickEvent: EventEmitter<any> = new EventEmitter<Date>();
  @Output() cancelClickEvent: EventEmitter<any> = new EventEmitter<any>();

  allowed24HourMap: IAllowed24HourMap | null = null;
  allowed12HourMap: IAllowed12HourMap | null = null;

  invalidSelection = false;

  okLabel!: string;
  cancelLabel!: string;

  okButtonTemplate!: TemplateRef<MatTimepickerButtonTemplateContext>;
  cancelButtonTemplate!: TemplateRef<MatTimepickerButtonTemplateContext>;

  anteMeridiemAbbreviation!: string;
  postMeridiemAbbreviation!: string;

  set value(value: any) {
    value = value || this.minDate || this.maxDate || new Date();
    this.hours = value.getHours();
    this.minutes = value.getMinutes();
    this._value = value;
  }

  get value() {
    return this._value;
  }

  mode!: ClockMode;
  viewType: ClockViewType = 'hours';

  minutes: any;
  color!: string;
  isPm = false;
  skipMinuteAutoSwitch = false;
  autoSwitchID: number | null = null;
  invalidMedianID: number | null = null;
  hasInvalidMeridiem = false;
  editHoursClicked = false;
  isClosing = false;

  minDate!: Date;
  maxDate!: Date;

  _formattedHour: any;
  _hours: any;
  _value!: Date;

  set hours(value: any) {
    this._hours = value;
    this._formattedHour = convertHoursForMode(this.hours, this.mode).hour;
  }
  get hours() {
    return this._hours;
  }

  get formattedHours() {
    return this._formattedHour;
  }

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

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.isPm = data.isPm;
    this.bindData(data);
    this.value = data.value;
  }

  ngDoCheck() {
    this.bindData(this.data);
  }

  handleClockChange({
    value,
    type,
  }: {
    value: number;
    type: 'minutes' | 'hours';
  }) {
    const is24hoursAutoMeridiemChange =
      this.mode === '24h' &&
      type === 'hours' &&
      ((this.hours >= 12 && value < 12) || (this.hours < 12 && value >= 12));
    if (
      (this.hasInvalidMeridiem && this.mode === '12h') ||
      is24hoursAutoMeridiemChange
    ) {
      this.isPm = !this.isPm;
      this.hasInvalidMeridiem = false;
    }

    if ((type && type === 'hours') || (!type && this.viewType === 'hours')) {
      this.hours = value;
    } else if (
      (type && type === 'minutes') ||
      (!type && this.viewType === 'minutes')
    ) {
      this.minutes = value;
    }

    const newValue = new Date();
    const hours = this.isPm
      ? this.hours < 12
        ? this.hours + 12
        : this.hours
      : this.hours === 12
      ? 0
      : this.hours;
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
    clearTimeout(this.autoSwitchID!);
  }

  handleClockChangeDone(e: Event | null) {
    if (e) {
      e.preventDefault();
    }

    if (this.viewType === 'hours' && !this.skipMinuteAutoSwitch) {
      this.autoSwitchID = setTimeout(() => {
        this.editMinutes();
        this.autoSwitchID = null;
      }, 300) as unknown as number;
    }
  }

  editHours() {
    this.viewType = 'hours';
    this.editHoursClicked = true;
    setTimeout(() => {
      this.editHoursClicked = false;
    }, 0);
  }

  editMinutes() {
    if (this.hasInvalidMeridiem) {
      this.isPm = !this.isPm;
      this.hasInvalidMeridiem = false;
    }
    this.viewType = 'minutes';
  }

  invalidSelectionHandler(value: any) {
    this.invalidSelection = value;
  }

  invalidMeridiem() {
    if (this.viewType !== 'minutes' && this.editHoursClicked) {
      if (this.invalidMedianID) {
        return;
      }
      this.invalidMedianID = setTimeout(() => {
        this.isPm = !this.isPm;
        this.hasInvalidMeridiem = false;
      }, 0) as unknown as number;
      return;
    }
    this.hasInvalidMeridiem = true;
  }

  meridiemChange(hours: any) {
    const changeData = {
      type: this.viewType,
      value: this.viewType === 'hours' ? hours : this.value.getMinutes(),
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
  };

  cancelClickHandler = () => {
    this.cancelClickEvent.emit();
  };
}
