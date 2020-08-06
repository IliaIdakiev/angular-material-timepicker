import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClockComponent } from './clock/clock.component';
import { MatTimepickerComponentDialogComponent } from './timepicker-dialog/timepicker-dialog.component';
import { MatTimepickerDirective } from './timepicker.directive';
import { MatTimepickerToggleIconDirective, MatTimepickerToggleComponent } from './timepicker-toggle/timepicker-toggle.component';

@NgModule({
  declarations: [
    ClockComponent,
    MatTimepickerDirective,
    MatTimepickerComponentDialogComponent,
    MatTimepickerToggleIconDirective,
    MatTimepickerToggleComponent
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
    MatTimepickerDirective,
    MatTimepickerToggleIconDirective,
    MatTimepickerToggleComponent
  ],
  entryComponents: [
    MatTimepickerComponentDialogComponent
  ]
})
export class MatTimepickerModule { }
