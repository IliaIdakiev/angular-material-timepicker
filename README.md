# Angular Material Timepicker

## Timepicker Control for Angular Material


### Usage
```html
<mat-timepicker></mat-timepicker>
```

### Component Configuration
```typescript
/** Override the label of the ok button. */
@Input() okLabel = 'Ok';

/** Override the label of the cancel button. */
@Input() cancelLabel = 'Cancel';

/** Sets the clock mode, 12-hour or 24-hour clocks are supported. */
@Input() mode = '24h' // or '12h';

@Input() disabled = false;

@Input() color = 'primary';
```

[Demo](https://stackblitz.com/github/IliaIdakiev/angular-material-timepicker)