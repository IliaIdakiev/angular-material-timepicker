import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MatTimepickerComponentDialogComponent } from './timepicker-dialog.component';

describe('TimePickerComponent', () => {
  let component: MatTimepickerComponentDialogComponent;
  let fixture: ComponentFixture<MatTimepickerComponentDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MatTimepickerComponentDialogComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatTimepickerComponentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
