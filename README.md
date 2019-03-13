# Angular Material Timepicker

## Timepicker Control for Angular Material

⚠️The time picker control has [Angular Material](https://material.angular.io/) as a dependency ⚠️

### Usage
```html
<mat-timepicker></mat-timepicker>
```
* **Yes! You can use ngModel. This control implements ControlValueAccessor.**

* **Yes! You can use [moment.js](https://momentjs.com/) for value/min/max attributes.**

### Component Configuration
```typescript
/* Override the label of the ok button. */
@Input() okLabel = 'Ok';

/* Override the label of the cancel button. */
@Input() cancelLabel = 'Cancel';

/* Sets the clock mode, 12-hour or 24-hour clocks are supported. */
@Input() mode: '12h' | '24h' = '24h';

/* Disable the timepicker control */
@Input() disabled = false;

/* Set the color of the timepicker control */
@Input() color = 'primary';

/* Set the value of the timepicker control (default is current time) */
@Input() value: Date | Moment = new Date();

/* Wrapper the input with MaterialFormField */
@Input() withFormField = false;

/* Placeholder for the time input */
@Input() placeholder: string = null;

/* Minimum time to pick from */
@Input() min: Date | Moment;

/* Maximum time to pick from */
@Input() max: Date | Moment;
```


### Check out the [**Demo**](https://stackblitz.com/github/IliaIdakiev/angular-material-timepicker)!

---

Dialog View

Here's our logo (hover to see the title text):

Hour Select (24h): 

![alt text](https://github.com/IliaIdakiev/angular-material-timepicker/blob/master/timepicker-hours.png?raw=true "Hour Select (24h)")

Minutes Select: 

![alt text](https://github.com/IliaIdakiev/angular-material-timepicker/blob/master/timepicker-min.png?raw=true "Hour Select (24h)")
