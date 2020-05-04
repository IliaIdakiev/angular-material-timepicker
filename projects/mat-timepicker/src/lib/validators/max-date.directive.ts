import { Directive, Input } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';
import { maxDate } from './index';

@Directive({
  selector: '[matMaxDate]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: MatDateMaxDirective,
    multi: true
  }]
})
export class MatDateMaxDirective implements Validator {
  @Input() matMaxDate: Date;
  validate(c: AbstractControl) { return maxDate(this.matMaxDate)(c); }
}
