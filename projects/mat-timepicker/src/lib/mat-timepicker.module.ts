import { MatDialogModule, MatButtonModule, MatToolbarModule, MatIconModule, MatInputModule } from '@angular/material';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClockComponent } from './clock/clock.component';
import { MatTimepickerComponent } from './timepicker/mat-timepicker.component';
import { MatTimepickerComponentDialogComponent } from './timepicker-dialog/timepicker-dialog.component';
import { InvalidInputComponent } from './invalid-input/invalid-input.component';

@NgModule({
  declarations: [
    ClockComponent,
    MatTimepickerComponent,
    MatTimepickerComponentDialogComponent,
    InvalidInputComponent,
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatInputModule
  ],
  exports: [
    MatTimepickerComponent
  ],
  entryComponents: [
    MatTimepickerComponentDialogComponent,
    InvalidInputComponent
  ]
})
export class MatTimepickerModule { }
