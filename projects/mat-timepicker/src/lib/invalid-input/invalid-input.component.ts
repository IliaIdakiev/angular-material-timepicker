import { Component, OnInit, EventEmitter, Output, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'mat-invalid-input',
  templateUrl: './invalid-input.component.html',
  styleUrls: ['./invalid-input.component.css']
})
export class InvalidInputComponent implements OnInit {

  color: any;
  @Output() okClickEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor(@Inject(MAT_DIALOG_DATA) data: any) {
    this.color = data.color;
  }

  ngOnInit() {
  }

  okClickHandler() {
    this.okClickEvent.emit();
  }

}
