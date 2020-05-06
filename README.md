# Angular Material Timepicker

### Simple Usage
```html
<mat-timepicker></mat-timepicker>
```

### Complex Usage
```html
<mat-form-field appearance="fill">
  <mat-label>24 TIMEPICKER</mat-label>
  <mat-timepicker #t="matTimepicker" #time="ngModel" [minDate]="minValue" [maxDate]="maxValue"
    id="timepicker-example" mode="24h" ngModel placeholder="Please select time..." name="time"
    [disableDialogOpenOnClick]="true" [errorStateMatcher]="customErrorStateMatcher" required>
  </mat-timepicker>
  <mat-icon matSuffix (click)="t.showDialog()">access_time</mat-icon>
  <mat-error *ngIf="time.touched && time.invalid">Invalid Date</mat-error>
</mat-form-field>
```

### API
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

/* Set the value of the timepicker control (when using ngModel then you can use [ngModel]="someValue") */
@Input() value: Date = new Date();

/* Placeholder for the time input */
@Input() placeholder: string = null;

/* Minimum time to pick from */
@Input() minDate: Date;

/* Maximum time to pick from */
@Input() maxDate: Date;

/* Disables the dialog open when clicking the input field */
@Input() disableDialogOpenOnClick = false;

/* Emits when time has changed */
@Output() timeChange: EventEmitter<any> = new EventEmitter<any>();

/* Emits when the input is invalid */
@Output() invalidInput: EventEmitter<any> = new EventEmitter<any>();
```

### Check out the [**Demo**](https://stackblitz.com/github/IliaIdakiev/angular-material-timepicker)!

---

Dialog View

Here's our logo (hover to see the title text):

Hour Select (24h): 

![alt text](https://github.com/IliaIdakiev/angular-material-timepicker/blob/master/timepicker-hours.png?raw=true "Hour Select (24h)")

Minutes Select: 

![alt text](https://github.com/IliaIdakiev/angular-material-timepicker/blob/master/timepicker-min.png?raw=true "Hour Select (24h)")
