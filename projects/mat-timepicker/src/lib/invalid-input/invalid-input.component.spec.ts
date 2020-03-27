import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvalidInputComponent } from './invalid-input.component';

describe('InvalidInputComponent', () => {
  let component: InvalidInputComponent;
  let fixture: ComponentFixture<InvalidInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvalidInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvalidInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
