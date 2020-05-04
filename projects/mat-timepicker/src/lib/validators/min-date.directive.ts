import { Directive, Input } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';
import { minDate } from './index';

@Directive({
  selector: '[matMinDate]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: MatDateMinDirective,
    multi: true
  }]
})
export class MatDateMinDirective implements Validator {
  @Input() matMinDate: Date;
  validate(c: AbstractControl) { return minDate(this.matMinDate)(c); }
}
