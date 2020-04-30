import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

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
