import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialogState } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { By } from '@angular/platform-browser';
import { MatTimepickerModule } from './mat-timepicker.module';
import { MatTimepickerDirective } from './timepicker.directive';

@Component({
  imports: [MatTimepickerModule, ReactiveFormsModule, MatFormFieldModule],
  template: `
    <mat-form-field>
      <input matTimepicker [formControl]="control" />
    </mat-form-field>
  `,
})
class TimepickerHost {
  readonly control = new FormControl(new Date(2026, 10, 12, 9, 30));
}

describe('disabling the open timepicker', () => {
  it('closes the dialog and ignores a late confirmation', async () => {
    const fixture = TestBed.createComponent(TimepickerHost);
    fixture.detectChanges();
    await fixture.whenStable();

    const directive = fixture.debugElement
      .query(By.directive(MatTimepickerDirective))
      .injector.get(MatTimepickerDirective);
    directive.showDialog();
    const dialog = directive.dialog.openDialogs[0];
    expect(dialog.getState()).toBe(MatDialogState.OPEN);

    const control = fixture.componentInstance.control;
    const original = control.value;
    control.disable({ emitEvent: false });
    expect(dialog.getState()).not.toBe(MatDialogState.OPEN);

    const nextTime = new Date(2026, 10, 12, 10, 30);
    directive.handleChange(nextTime);
    directive.handleOk(nextTime);
    expect(control.value).toEqual(original);
  });
});
