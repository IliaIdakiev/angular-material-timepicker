import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { Attribute, ChangeDetectorRef, Component, ContentChild, Directive, Input, OnDestroy, ViewChild, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { MatTimepickerDirective } from '../timepicker.directive';

/** Can be used to override the icon of a `matTimepickerToggle`. */
@Directive({
  selector: '[matTimepickerToggleIcon]',
})
export class MatTimepickerToggleIconDirective {}


@Component({
  selector: 'mat-timepicker-toggle',
  templateUrl: 'timepicker-toggle.component.html',
  styleUrls: ['timepicker-toggle.component.scss'],
  host: {
    'class': 'mat-timepicker-toggle mat-timepicker-toggle',
    // Always set the tabindex to -1 so that it doesn't overlap with any custom tabindex the
    // consumer may have provided, while still being able to receive focus.
    '[attr.tabindex]': 'disabled ? null : -1',
    '(focus)': '_button.focus()',
  },
  exportAs: 'matTimepickerToggle',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatTimepickerToggleComponent implements OnDestroy {
  // tslint:disable-next-line: variable-name
  static ngAcceptInputType_disabled: BooleanInput;

  private _stateChanges = Subscription.EMPTY;

  /** Timepicker instance that the button will toggle. */
  // tslint:disable-next-line: no-input-rename
  @Input('for') timepicker: MatTimepickerDirective;

  /** Tabindex for the toggle. */
  @Input() tabIndex: number | null;

  /** Whether the toggle button is disabled. */
  @Input()
  get disabled(): boolean {
    if (this._disabled === undefined && this.timepicker) {
      return this.timepicker.disabled;
    }

    return !!this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled: boolean;

  /** Whether ripples on the toggle should be disabled. */
  @Input() disableRipple: boolean;

  /** Custom icon set by the consumer. */
  @ContentChild(MatTimepickerToggleIconDirective) _customIcon: MatTimepickerToggleIconDirective;

  /** Underlying button element. */
  @ViewChild('button') _button: MatButton;

  constructor(private _changeDetectorRef: ChangeDetectorRef, @Attribute('tabindex') defaultTabIndex: string) {
    const parsedTabIndex = Number(defaultTabIndex);
    this.tabIndex = parsedTabIndex || parsedTabIndex === 0 ? parsedTabIndex : null;
  }

  ngOnDestroy() {
    this._stateChanges.unsubscribe();
  }

  _open(event: Event): void {
    if (this.timepicker && !this.disabled) {
      this.timepicker.showDialog();
      event.stopPropagation();
    }
  }
}
