import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isAvailable',
  pure: false
})
export class IsAvailablePipe implements PipeTransform {

  transform(value: any, min: { hours: number, minutes: number }, max: { hours: number, minutes: number }, type: 'h' | 'm'): any {
    if (!min && !max) { return true; }
    value = +value;
    const prop = type === 'm' ? 'minutes' : 'hours';
    return (!min || (min && min[prop] <= value)) && (!max || (max && max[prop] >= value));
  }

}
