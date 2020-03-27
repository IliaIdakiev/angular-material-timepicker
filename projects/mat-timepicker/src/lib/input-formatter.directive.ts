import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[matInputFormatter]'
})
export class InputFormatterDirective {

  @HostListener('keyup', ['$event']) inputHandler(e: KeyboardEvent) {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    if (!value.includes(':')) { e.preventDefault(); e.stopImmediatePropagation(); return false; }
  }
  constructor() { }

}
