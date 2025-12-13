import { Directive, HostBinding, HostListener, Input } from '@angular/core';
import { MatTimepickerDirective } from './timepicker.directive';

@Directive({
  selector: '[matTimepickerToggle]',
  standalone: true,
})
export class MatTimepickerToggleDirective {
  @Input('matTimepickerToggle') timepicker!: MatTimepickerDirective;

  @HostBinding('style.pointer-events') pointerEvents = 'auto';
  @HostBinding('style.cursor') cursor = 'pointer';

  @HostListener('click', ['$event']) onClick(event: Event) {
    if (this.timepicker) {
      this.timepicker.showDialog();
      event.stopPropagation();
    }
  }
}
