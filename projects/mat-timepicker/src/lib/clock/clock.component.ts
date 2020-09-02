import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { ClockViewType, ClockNumber, ITimeData, ClockMode } from '../interfaces-and-types';
import { isAllowed, getIsAvailabeFn } from '../util';

@Component({
  selector: 'mat-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClockComponent implements OnChanges {

  @Input() mode: ClockMode;
  @Input() viewType: ClockViewType;
  @Input() color = 'primary';
  @Input() formattedValue: number;
  @Input() minDate: Date;
  @Input() maxDate: Date;
  @Input() isPm: boolean;
  @Input() formattedHours: number;
  @Input() minutes: number;
  @Output() changeEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() unavailableSelection: EventEmitter<any> = new EventEmitter<any>();
  @Output() invalidMeridiem: EventEmitter<any> = new EventEmitter<any>();
  @Output() invalidSelection: EventEmitter<any> = new EventEmitter<any>();
  @Output() clearInvalidMeridiem: EventEmitter<any> = new EventEmitter<any>();

  @Input() allowed12HourMap = null;
  @Input() allowed24HourMap = null;

  isFormattedValueAllowed = true;

  isAvailableFn: ReturnType<typeof getIsAvailabeFn>;

  meridiem = null;
  touching = false;
  angle: number;
  numbers: ClockNumber[] = [];
  secondaryNumbers: ClockNumber[] = [];
  minuteDots: ClockNumber[] = [];
  invalidMeridiemEmitted = true;

  initIsAllowedFn() {
    if (!this.allowed12HourMap && !this.allowed24HourMap) { return; }
    this.isAvailableFn = getIsAvailabeFn(this.allowed12HourMap, this.allowed24HourMap, this.mode);
  }

  isAvailable(value) {
    return this.isAvailableFn ? this.isAvailableFn(value, this.viewType, this.isPm, this.formattedHours) : true;
  }

  ngOnChanges(simpleChanges: SimpleChanges) {

    if (
      simpleChanges.allowed12HourMap ||
      simpleChanges.allowed24HourMap ||
      (simpleChanges.mode && !simpleChanges.mode.firstChange)
    ) {
      this.initIsAllowedFn();
    }

    this.calculateAngule();
    this.setNumbers();
    this.meridiem = this.isPm ? 'PM' : 'AM';

    if (simpleChanges.formattedValue && (this.allowed12HourMap || this.allowed24HourMap)) {
      this.isFormattedValueAllowed = this.isAvailable(this.formattedValue);
    }

    const isSelectedTimeAvailable = (this.isAvailableFn) ?
      // when calling isAvailableFn here we should always set the viewType to minutes because we want to check the hours and the minutes
      this.isAvailableFn(this.minutes, 'minutes', this.isPm, this.formattedHours) : true;

    // if (this.mode === '24h' && this.viewType === 'minutes' && this.isAvailableFn) {
    //   const areMinitesAvailable = this.isAvailableFn(this.minutes, 'minutes', this.isPm, this.formattedHours);
    //   if (!areMinitesAvailable) {
    //     if (this.minDate && this.minDate.getMinutes() > this.minutes) {
    //       setTimeout(() => { this.changeEvent.emit({ value: this.minDate.getMinutes(), type: 'minutes' }); });
    //     } else {
    //       setTimeout(() => { this.changeEvent.emit({ value: this.maxDate.getMinutes(), type: 'minutes' }); });
    //     }
    //   }
    // }

    if (isSelectedTimeAvailable && this.invalidMeridiemEmitted) {
      this.clearInvalidMeridiem.emit();
      this.invalidMeridiemEmitted = false;
    }

    this.invalidSelection.emit(!isSelectedTimeAvailable);
  }

  calculateAngule() {
    this.angle = this.getPointerAngle(this.formattedValue, this.viewType);
  }

  setNumbers() {
    if (this.viewType === 'hours') {
      if (this.mode === '12h') {
        const meridiem = this.isPm ? 'pm' : 'am';
        const isAllowedFn = this.allowed12HourMap ? num => this.allowed12HourMap[meridiem][num + 1][0] : undefined;
        this.numbers = this.getNumbers(12, { size: 256 }, isAllowedFn);
        this.secondaryNumbers = [];
        this.minuteDots = [];
      } else if (this.mode === '24h') {
        const isAllowedFn = this.allowed24HourMap ? num => this.allowed24HourMap[num][0] : undefined;
        this.numbers = this.getNumbers(12, { size: 256 }, isAllowedFn);
        this.secondaryNumbers = this.getNumbers(12, { size: 256 - 64, start: 13 }, isAllowedFn);
        this.minuteDots = [];
      }
    } else {
      const meridiem = this.isPm ? 'pm' : 'am';
      const isAllowedFn =
        !!this.allowed12HourMap ? num => this.allowed12HourMap[meridiem][this.formattedHours][num] :
          !!this.allowed24HourMap ? num => this.allowed24HourMap[this.formattedHours][num] : undefined;

      this.numbers = this.getNumbers(12, { size: 256, start: 5, step: 5 }, isAllowedFn);
      this.minuteDots = this.getNumbers(60, { size: 256, start: 13 }).map(digit => {
        if (digit.display <= 59) {
          digit.allowed = isAllowedFn ? isAllowedFn(digit.display) : true;
          return digit;
        }
        digit.display = digit.display - 60;
        digit.allowed = isAllowedFn ? isAllowedFn(digit.display) : true;
        return digit;
      });
      this.secondaryNumbers = [];
    }
  }

  disableAnimatedPointer() {
    this.touching = true;
  }

  enableAnimatedPointer() {
    this.touching = false;
  }

  handleTouchMove = (e: any) => {
    e.preventDefault(); // prevent scrolling behind the clock on iOS
    const rect = e.target.getBoundingClientRect();
    this.movePointer(e.changedTouches[0].clientX - rect.left, e.changedTouches[0].clientY - rect.top);
  }

  handleTouchEnd(e: any) {
    this.handleTouchMove(e);
    this.enableAnimatedPointer();
  }

  handleMouseMove(e: any) {
    // MouseEvent.which is deprecated, but MouseEvent.buttons is not supported in Safari
    if ((e.buttons === 1 || e.which === 1) && this.touching) {
      const rect = e.target.getBoundingClientRect();
      this.movePointer(e.clientX - rect.left, e.clientY - rect.top);
    }
  }

  handleClick(e: any) {
    const rect = e.target.getBoundingClientRect();
    this.movePointer(e.clientX - rect.left, e.clientY - rect.top);
  }

  movePointer(x, y) {
    const value = this.getPointerValue(x, y, 256);
    if (!this.isAvailable(value)) {
      this.unavailableSelection.emit();
      return;
    }
    if (value !== this.formattedValue) {
      this.changeEvent.emit({ value, type: this.viewType });
      if (this.viewType !== 'minutes') {
        if (!this.isAvailable(value)) {
          if (this.minDate && this.isAvailable(value)
          ) {
            this.changeEvent.emit({ value: this.minDate.getMinutes(), type: 'minutes' });
          } else if (this.maxDate && this.isAvailable(value)) {
            this.changeEvent.emit({ value: this.maxDate.getMinutes(), type: 'minutes' });
          }
        }
      }
    }
  }

  getNumbers(count, { size, start = 1, step = 1 }, isAllowedFn?: (num: number) => boolean) {
    return Array.apply(null, Array(count)).map((_, i) => ({
      display: i * step + start,
      translateX: (size / 2 - 20) * Math.cos(2 * Math.PI * (i - 2) / count),
      translateY: (size / 2 - 20) * Math.sin(2 * Math.PI * (i - 2) / count),
      allowed: isAllowedFn ? isAllowedFn(i) : true
    }));
  }

  getPointerAngle(value, mode: ClockViewType) {
    if (this.viewType === 'hours') {
      return this.mode === '12h' ? 360 / 12 * (value - 3) : 360 / 12 * (value % 12 - 3);
    }
    return 360 / 60 * (value - 15);
  }

  getPointerValue(x, y, size) {
    let value;
    let angle = Math.atan2(size / 2 - x, size / 2 - y) / Math.PI * 180;
    if (angle < 0) {
      angle = 360 + angle;
    }

    if (this.viewType === 'hours') {
      if (this.mode === '12h') {
        value = 12 - Math.round(angle * 12 / 360);
        return value === 0 ? 12 : value;
      }

      const radius = Math.sqrt(Math.pow(size / 2 - x, 2) + Math.pow(size / 2 - y, 2));
      value = 12 - Math.round(angle * 12 / 360);
      if (value === 0) { value = 12; }
      if (radius < size / 2 - 32) { value = value === 12 ? 0 : value + 12; }
      return value;

    }

    value = Math.round(60 - 60 * angle / 360);
    return value === 60 ? 0 : value;
  }
}
