# Angular Material Timepicker

## Timepicker Control for Angular Material

⚠️The time picker control has [Angular Material](https://material.angular.io/) as a dependency ⚠️

### Usage
```html
<mat-timepicker></mat-timepicker>
```
* **Yes! You can use ngModel. This control implements ControlValueAccessor.**

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
@Input() color: ThemePalette = 'primary';

/* Set the value of the timepicker control (default is current time) */
@Input() value: Date = new Date();

/* Wrapper the input with MaterialFormField */
@Input() withFormField = false;

/* Placeholder for the time input */
@Input() placeholder: string = null;

/* Minimum time to pick from */
@Input() minDate: Date;

/* Maximum time to pick from */
@Input() maxDate: Date;

/* Add material clock icon to the left */
@Input() withIcon = false;

/* Material clock icon color */
@Input() iconColor: ThemePalette

/* Disables the dialog open when clicking the input field */
@Input() disableDialogOpenOnInputClick = false;

/* Disables the dialog open when clicking the icon if there is one */
@Input() disableDialogOpenOnIconClick = false;
```


### Check out the [**Demo**](https://stackblitz.com/github/IliaIdakiev/angular-material-timepicker)!

---

Dialog View

Here's our logo (hover to see the title text):

Hour Select (24h): 

![alt text](https://github.com/IliaIdakiev/angular-material-timepicker/blob/master/timepicker-hours.png?raw=true "Hour Select (24h)")

Minutes Select: 

![alt text](https://github.com/IliaIdakiev/angular-material-timepicker/blob/master/timepicker-min.png?raw=true "Hour Select (24h)")
