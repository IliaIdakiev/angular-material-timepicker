import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { ClockType, ClockNumber } from '../interfaces-and-types';

@Component({
  selector: 'mat-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.scss']
})
export class ClockComponent implements OnChanges {

  @Input() mode: ClockType;
  @Input() color = 'primary';
  @Input() formattedValue: number;
  @Output() changeEvent: EventEmitter<any> = new EventEmitter<any>();

  touching = false;
  angle: number;
  numbers: ClockNumber[] = [];
  secondaryNumbers: ClockNumber[] = [];
  minuteDots: ClockNumber[] = [];

  constructor() { }

  ngOnChanges() {
    this.calculateAngule();
    this.setNumbers();
  }

  calculateAngule() {
    this.angle = this.getPointerAngle(this.formattedValue, this.mode);
  }

  setNumbers() {
    if (this.mode === '12h') {
      this.numbers = this.getNumbers(12, { size: 256 });
      this.secondaryNumbers = [];
      this.minuteDots = [];
    } else if (this.mode === '24h') {
      this.numbers = this.getNumbers(12, { size: 256 });
      this.secondaryNumbers = this.getNumbers(12, { size: 256 - 64, start: 13 });
      this.minuteDots = [];
    } else if (this.mode === 'minutes') {
      this.numbers = this.getNumbers(12, { size: 256, start: 5, step: 5 });
      this.minuteDots = this.getNumbers(60, { size: 256, start: 13 }).map(digit => {
        if (digit.display <= 59) { return digit; }
        digit.display = digit.display - 60;
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
    if (e.buttons === 1 || e.which === 1) {
      const rect = e.target.getBoundingClientRect();
      this.movePointer(e.clientX - rect.left, e.clientY - rect.top);
    }
  }

  handleClick(e: any) {
    const rect = e.target.getBoundingClientRect();
    this.movePointer(e.clientX - rect.left, e.clientY - rect.top);
  }

  movePointer(x, y) {
    const value = this.getPointerValue(x, y, this.mode, 256);
    if (value !== this.formattedValue) {
      this.changeEvent.emit(value);
    }
  }

  getNumbers(count, { size, start = 1, step = 1 }) {
    return Array.apply(null, Array(count)).map((_, i) => ({
      display: i * step + start,
      translateX: (size / 2 - 20) * Math.cos(2 * Math.PI * (i - 2) / count),
      translateY: (size / 2 - 20) * Math.sin(2 * Math.PI * (i - 2) / count)
    }));
  }

  getPointerAngle(value, mode: ClockType) {
    switch (mode) {
      case '12h':
        return 360 / 12 * (value - 3);
      case '24h':
        return 360 / 12 * (value % 12 - 3);
      case 'minutes':
        return 360 / 60 * (value - 15);
    }
  }

  getPointerValue(x, y, mode, size) {
    let angle = Math.atan2(size / 2 - x, size / 2 - y) / Math.PI * 180;
    if (angle < 0) {
      angle = 360 + angle;
    }

    switch (mode) {
      case '12h': {
        const value = 12 - Math.round(angle * 12 / 360);
        return value === 0 ? 12 : value;
      }
      case '24h': {
        const radius = Math.sqrt(Math.pow(size / 2 - x, 2) + Math.pow(size / 2 - y, 2));
        let value = 12 - Math.round(angle * 12 / 360);
        if (value === 0) {
          value = 12;
        }
        if (radius < size / 2 - 32) {
          value = value === 12 ? 0 : value + 12;
        }
        return value;
      }
      case 'minutes': {
        const value = Math.round(60 - 60 * angle / 360);
        return value === 60 ? 0 : value;
      }
    }
  }
}
