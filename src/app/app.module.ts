import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatTimepickerModule } from 'mat-timepicker';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatTimepickerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
