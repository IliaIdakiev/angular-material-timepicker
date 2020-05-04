import { AbstractControl } from '@angular/forms';

export function minDate(minDateValue: Date) {
  // tslint:disable-next-line:space-before-function-paren only-arrow-functions
  return function (c: AbstractControl) {
    const unixCurrentDate = +c.value;
    const isValid = +minDateValue <= unixCurrentDate;
    return isValid ? null : { minDate: true };
  };
}

export function maxDate(maxDateValue: Date) {
  // tslint:disable-next-line:space-before-function-paren only-arrow-functions
  return function (c: AbstractControl) {
    const unixCurrentDate = +c.value;
    const isValid = +maxDateValue >= unixCurrentDate;
    return isValid ? null : { minDate: true };
  };
}
