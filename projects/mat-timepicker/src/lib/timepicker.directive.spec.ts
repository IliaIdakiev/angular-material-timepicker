import {
  ComponentFixture,
  TestBed,
  waitForAsync,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Component } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  Validators,
} from '@angular/forms';
import { MatTimepickerDirective } from './timepicker.directive';
import { MatTimepickerModule } from './mat-timepicker.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <mat-form-field>
      <input
        matTimepicker
        [(ngModel)]="timeValue"
        [mode]="mode"
        [minDate]="minDate"
        [maxDate]="maxDate"
        [required]="required"
        [disabled]="disabled"
        [strict]="strict"
        (timeChange)="onTimeChange($event)"
        (invalidInput)="onInvalidInput()"
      />
    </mat-form-field>
  `,
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTimepickerModule,
  ],
})
class TestNgModelComponent {
  timeValue: Date | null = null;
  mode: '12h' | '24h' = '24h';
  minDate: Date | null = null;
  maxDate: Date | null = null;
  required = false;
  disabled = false;
  strict = true;
  timeChangeCount = 0;
  invalidInputCount = 0;

  onTimeChange(_event: any) {
    this.timeChangeCount++;
  }

  onInvalidInput() {
    this.invalidInputCount++;
  }
}

@Component({
  template: `
    <mat-form-field>
      <input
        matTimepicker
        [formControl]="timeControl"
        [mode]="mode"
        [minDate]="minDate"
        [maxDate]="maxDate"
      />
    </mat-form-field>
  `,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTimepickerModule,
  ],
})
class TestReactiveFormComponent {
  timeControl = new FormControl<Date | null>(null);
  mode: '12h' | '24h' = '24h';
  minDate: Date | null = null;
  maxDate: Date | null = null;
}

describe('MatTimepickerDirective', () => {
  describe('with ngModel', () => {
    let component: TestNgModelComponent;
    let fixture: ComponentFixture<TestNgModelComponent>;
    let inputEl: HTMLInputElement;
    let directive: MatTimepickerDirective;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TestNgModelComponent, BrowserAnimationsModule],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(TestNgModelComponent);
      component = fixture.componentInstance;
      inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
      const directiveEl = fixture.debugElement.query(
        By.directive(MatTimepickerDirective)
      );
      directive = directiveEl.injector.get(MatTimepickerDirective);
      fixture.detectChanges();
    });

    it('should create the directive', () => {
      expect(directive).toBeTruthy();
    });

    it('should initialize with empty value', () => {
      expect(component.timeValue).toBeNull();
      expect(inputEl.value).toBe('');
    });

    it('should display formatted time when value is set programmatically (24h mode)', fakeAsync(() => {
      const testDate = new Date(2025, 0, 1, 14, 30, 0);
      component.timeValue = testDate;
      fixture.detectChanges();
      tick();

      expect(inputEl.value).toBe('14:30');
    }));

    it('should display formatted time when value is set programmatically (12h mode)', fakeAsync(() => {
      component.mode = '12h';
      fixture.detectChanges();

      const testDate = new Date(2025, 0, 1, 14, 30, 0);
      component.timeValue = testDate;
      fixture.detectChanges();
      tick();

      expect(inputEl.value).toBe('2:30 pm');
    }));

    it('should parse user input in 24h format', fakeAsync(() => {
      inputEl.value = '14:30';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      tick();

      expect(component.timeValue).toBeTruthy();
      expect(component.timeValue?.getHours()).toBe(14);
      expect(component.timeValue?.getMinutes()).toBe(30);
    }));

    it('should parse user input in 12h format with am/pm', fakeAsync(() => {
      inputEl.value = '2:30 pm';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      tick();

      expect(component.timeValue).toBeTruthy();
      expect(component.timeValue?.getHours()).toBe(14);
      expect(component.timeValue?.getMinutes()).toBe(30);
    }));

    it('should parse user input without colon', fakeAsync(() => {
      inputEl.value = '1430';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      tick();

      expect(component.timeValue).toBeTruthy();
      expect(component.timeValue?.getHours()).toBe(14);
      expect(component.timeValue?.getMinutes()).toBe(30);
    }));

    it('should clear value when input is empty', fakeAsync(() => {
      const testDate = new Date(2025, 0, 1, 14, 30, 0);
      component.timeValue = testDate;
      fixture.detectChanges();
      tick();

      inputEl.value = '';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      tick();

      expect(component.timeValue).toBeNull();
    }));

    it('should emit timeChange event when value changes', fakeAsync(() => {
      inputEl.value = '14:30';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      tick();

      expect(component.timeChangeCount).toBeGreaterThan(0);
    }));

    it('should respect disabled state', fakeAsync(() => {
      component.disabled = true;
      fixture.detectChanges();
      tick();

      expect(inputEl.disabled).toBe(true);
    }));

    it('should validate required field', fakeAsync(() => {
      component.required = true;
      fixture.detectChanges();
      tick();

      inputEl.value = '';
      inputEl.dispatchEvent(new Event('input'));
      inputEl.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      tick();

      const control = directive.ngControl.control;
      expect(control?.errors?.['required']).toBeTruthy();
    }));

    it('should validate min date constraint', fakeAsync(() => {
      const minDate = new Date(2025, 0, 1, 10, 0, 0);
      component.minDate = minDate;
      component.strict = false;
      fixture.detectChanges();
      tick();

      inputEl.value = '09:30';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      tick();

      const errors = directive.validate();
      expect(errors).toBeTruthy();
      expect(errors?.['dateRange']).toBe(true);
    }));

    it('should validate max date constraint', fakeAsync(() => {
      const maxDate = new Date(2025, 0, 1, 18, 0, 0);
      component.maxDate = maxDate;
      component.strict = false;
      fixture.detectChanges();
      tick();

      inputEl.value = '19:30';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      tick();

      const errors = directive.validate();
      expect(errors).toBeTruthy();
      expect(errors?.['dateRange']).toBe(true);
    }));

    it('should allow valid time within range', fakeAsync(() => {
      const minDate = new Date(2025, 0, 1, 10, 0, 0);
      const maxDate = new Date(2025, 0, 1, 18, 0, 0);
      component.minDate = minDate;
      component.maxDate = maxDate;
      component.strict = false;
      fixture.detectChanges();
      tick();

      inputEl.value = '14:30';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      tick();

      const errors = directive.validate();
      expect(errors).toBeNull();
    }));

    it('should emit invalidInput when out of range', fakeAsync(() => {
      const maxDate = new Date(2025, 0, 1, 18, 0, 0);
      component.maxDate = maxDate;
      fixture.detectChanges();
      tick();

      inputEl.value = '19:30';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      tick();

      expect(component.invalidInputCount).toBeGreaterThan(0);
    }));

    it('should handle mode switching from 24h to 12h', fakeAsync(() => {
      const testDate = new Date(2025, 0, 1, 14, 30, 0);
      component.timeValue = testDate;
      fixture.detectChanges();
      tick();

      expect(inputEl.value).toBe('14:30');

      component.mode = '12h';
      directive.mode = '12h';
      fixture.detectChanges();

      directive.ngOnChanges({
        mode: {
          currentValue: '12h',
          previousValue: '24h',
          firstChange: false,
          isFirstChange: () => false,
        },
      });
      tick();

      expect(directive.mode).toBe('12h');

      inputEl.value = '2:30 pm';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      tick();

      expect(component.timeValue).toBeTruthy();
      expect(component.timeValue?.getHours()).toBe(14);
      expect(component.timeValue?.getMinutes()).toBe(30);
    }));

    it('should show dialog when showDialog() is called', () => {
      spyOn(directive.dialog, 'open').and.callThrough();

      directive.showDialog();

      expect(directive.dialog.open).toHaveBeenCalled();
    });

    it('should implement MatFormFieldControl', () => {
      expect(directive.focused).toBeDefined();
      expect(directive.empty).toBeDefined();
      expect(directive.shouldLabelFloat).toBeDefined();
      expect(directive.required).toBeDefined();
      expect(directive.disabled).toBeDefined();
      expect(directive.errorState).toBeDefined();
      expect(directive.stateChanges).toBeDefined();
    });

    it('should update shouldLabelFloat based on focus and value', fakeAsync(() => {
      expect(directive.shouldLabelFloat).toBe(false);

      inputEl.dispatchEvent(new Event('focus'));
      fixture.detectChanges();
      tick();

      expect(directive.shouldLabelFloat).toBe(true);

      inputEl.value = '14:30';
      inputEl.dispatchEvent(new Event('input'));
      inputEl.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      tick();

      expect(directive.shouldLabelFloat).toBe(true);
    }));
  });

  describe('with reactive forms', () => {
    let component: TestReactiveFormComponent;
    let fixture: ComponentFixture<TestReactiveFormComponent>;
    let inputEl: HTMLInputElement;
    let directive: MatTimepickerDirective;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TestReactiveFormComponent, BrowserAnimationsModule],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(TestReactiveFormComponent);
      component = fixture.componentInstance;
      inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
      const directiveEl = fixture.debugElement.query(
        By.directive(MatTimepickerDirective)
      );
      directive = directiveEl.injector.get(MatTimepickerDirective);
      fixture.detectChanges();
    });

    it('should work with FormControl', fakeAsync(() => {
      const testDate = new Date(2025, 0, 1, 14, 30, 0);
      component.timeControl.setValue(testDate);
      fixture.detectChanges();
      tick();

      expect(inputEl.value).toBe('14:30');
    }));

    it('should update FormControl when user types', fakeAsync(() => {
      inputEl.value = '14:30';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      tick();

      const value = component.timeControl.value;
      expect(value).toBeTruthy();
      expect(value!.getHours()).toBe(14);
      expect(value!.getMinutes()).toBe(30);
    }));

    it('should respect FormControl validators', fakeAsync(() => {
      component.timeControl.setValidators([Validators.required]);
      component.timeControl.updateValueAndValidity();
      fixture.detectChanges();
      tick();

      expect(component.timeControl.invalid).toBe(true);

      inputEl.value = '14:30';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      tick();

      expect(component.timeControl.invalid).toBe(false);
    }));

    it('should disable input when FormControl is disabled', fakeAsync(() => {
      component.timeControl.disable();
      fixture.detectChanges();
      tick();

      expect(inputEl.disabled).toBe(true);
    }));

    it('should enable input when FormControl is enabled', fakeAsync(() => {
      component.timeControl.disable();
      fixture.detectChanges();
      tick();

      component.timeControl.enable();
      fixture.detectChanges();
      tick();

      expect(inputEl.disabled).toBe(false);
    }));

    it('should validate with custom validator from directive', fakeAsync(() => {
      const minDate = new Date(2025, 0, 1, 10, 0, 0);
      const maxDate = new Date(2025, 0, 1, 18, 0, 0);
      component.minDate = minDate;
      component.maxDate = maxDate;
      fixture.detectChanges();
      tick();

      inputEl.value = '09:00'; // Before min
      inputEl.dispatchEvent(new Event('input'));
      inputEl.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      tick();

      component.timeControl.updateValueAndValidity();
      fixture.detectChanges();
      tick();

      const errors = directive.validate();
      expect(errors).toBeTruthy();
      if (errors) {
        expect(errors['dateRange']).toBe(true);
      }
    }));
  });

  describe('ControlValueAccessor implementation', () => {
    let component: TestReactiveFormComponent;
    let fixture: ComponentFixture<TestReactiveFormComponent>;
    let directive: MatTimepickerDirective;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TestReactiveFormComponent, BrowserAnimationsModule],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(TestReactiveFormComponent);
      component = fixture.componentInstance;
      const directiveEl = fixture.debugElement.query(
        By.directive(MatTimepickerDirective)
      );
      directive = directiveEl.injector.get(MatTimepickerDirective);
      fixture.detectChanges();
    });

    it('should have ngControl.valueAccessor set to directive instance', () => {
      expect(directive.ngControl).toBeTruthy();
      expect(directive.ngControl.valueAccessor).toBe(directive);
    });

    it('should implement writeValue', () => {
      const testDate = new Date(2025, 0, 1, 14, 30, 0);
      directive.writeValue(testDate);

      expect(directive.value).toEqual(testDate);
    });

    it('should implement registerOnChange', () => {
      let changedValue: any;
      directive.registerOnChange((value: any) => {
        changedValue = value;
      });

      const testDate = new Date(2025, 0, 1, 14, 30, 0);
      directive.writeValue(testDate, true);

      directive['onChangeFn'](testDate);

      expect(changedValue).toEqual(testDate);
    });

    it('should implement registerOnTouched', () => {
      let touched = false;
      directive.registerOnTouched(() => {
        touched = true;
      });

      directive['onTouchedFn']();

      expect(touched).toBe(true);
    });

    it('should implement setDisabledState', () => {
      directive.setDisabledState!(true);
      expect(directive.disabled).toBe(true);

      directive.setDisabledState!(false);
      expect(directive.disabled).toBe(false);
    });
  });

  describe('Meridiem conversion', () => {
    let component: TestNgModelComponent;
    let fixture: ComponentFixture<TestNgModelComponent>;
    let inputEl: HTMLInputElement;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TestNgModelComponent, BrowserAnimationsModule],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(TestNgModelComponent);
      component = fixture.componentInstance;
      component.mode = '12h';
      inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
      fixture.detectChanges();
    });

    it('should not double-convert PM times', fakeAsync(() => {
      inputEl.value = '6:30 pm';
      inputEl.dispatchEvent(new Event('input'));
      tick();
      fixture.detectChanges();

      expect(component.timeValue).toBeTruthy();
      expect(component.timeValue!.getHours()).toBe(18);
      expect(component.timeValue!.getMinutes()).toBe(30);
    }));

    it('should handle meridiem in minutes position', fakeAsync(() => {
      inputEl.value = '6 30 pm';
      inputEl.dispatchEvent(new Event('input'));
      tick();
      fixture.detectChanges();

      expect(component.timeValue).toBeTruthy();
      expect(component.timeValue!.getHours()).toBe(18);
      expect(component.timeValue!.getMinutes()).toBe(30);
    }));

    it('should convert 12 AM to hour 0 (midnight)', fakeAsync(() => {
      inputEl.value = '12:00 am';
      inputEl.dispatchEvent(new Event('input'));
      tick();
      fixture.detectChanges();

      expect(component.timeValue).toBeTruthy();
      expect(component.timeValue!.getHours()).toBe(0);
      expect(component.timeValue!.getMinutes()).toBe(0);
    }));

    it('should keep 12 PM as hour 12 (noon)', fakeAsync(() => {
      inputEl.value = '12:00 pm';
      inputEl.dispatchEvent(new Event('input'));
      tick();
      fixture.detectChanges();

      expect(component.timeValue).toBeTruthy();
      expect(component.timeValue!.getHours()).toBe(12);
      expect(component.timeValue!.getMinutes()).toBe(0);
    }));

    it('should handle 1 AM correctly', fakeAsync(() => {
      inputEl.value = '1:00 am';
      inputEl.dispatchEvent(new Event('input'));
      tick();
      fixture.detectChanges();

      expect(component.timeValue).toBeTruthy();
      expect(component.timeValue!.getHours()).toBe(1);
    }));

    it('should handle 1 PM correctly', fakeAsync(() => {
      inputEl.value = '1:00 pm';
      inputEl.dispatchEvent(new Event('input'));
      tick();
      fixture.detectChanges();

      expect(component.timeValue).toBeTruthy();
      expect(component.timeValue!.getHours()).toBe(13);
    }));
  });

  describe('Invalid input handling', () => {
    let component: TestNgModelComponent;
    let fixture: ComponentFixture<TestNgModelComponent>;
    let inputEl: HTMLInputElement;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TestNgModelComponent, BrowserAnimationsModule],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(TestNgModelComponent);
      component = fixture.componentInstance;
      inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

      const minDate = new Date();
      minDate.setHours(9, 0, 0, 0);
      component.minDate = minDate;

      const maxDate = new Date();
      maxDate.setHours(17, 0, 0, 0);
      component.maxDate = maxDate;

      fixture.detectChanges();
    });

    it('should not save out-of-range values to model', fakeAsync(() => {
      const initialValue = new Date();
      initialValue.setHours(10, 0, 0, 0);
      component.timeValue = initialValue;
      fixture.detectChanges();
      tick();

      inputEl.value = '8:00';
      inputEl.dispatchEvent(new Event('input'));
      tick();
      fixture.detectChanges();

      expect(component.timeValue!.getHours()).toBe(10);
      expect(component.invalidInputCount).toBe(1);
    }));

    it('should emit invalidInput when typing out-of-range time', fakeAsync(() => {
      component.invalidInputCount = 0;

      inputEl.value = '18:00';
      inputEl.dispatchEvent(new Event('input'));
      tick();
      fixture.detectChanges();

      expect(component.invalidInputCount).toBe(1);
    }));

    it('should accept valid time within range', fakeAsync(() => {
      component.invalidInputCount = 0;

      inputEl.value = '14:30';
      inputEl.dispatchEvent(new Event('input'));
      tick();
      fixture.detectChanges();

      expect(component.timeValue).toBeTruthy();
      expect(component.timeValue!.getHours()).toBe(14);
      expect(component.timeValue!.getMinutes()).toBe(30);
      expect(component.invalidInputCount).toBe(0);
    }));
  });

  describe('Hours clamping', () => {
    let component: TestNgModelComponent;
    let fixture: ComponentFixture<TestNgModelComponent>;
    let inputEl: HTMLInputElement;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TestNgModelComponent, BrowserAnimationsModule],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(TestNgModelComponent);
      component = fixture.componentInstance;
      component.mode = '24h';
      inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
      fixture.detectChanges();
    });

    it('should clamp hours > 23 to 23', fakeAsync(() => {
      inputEl.value = '25:30';
      inputEl.dispatchEvent(new Event('input'));
      tick();
      fixture.detectChanges();

      expect(component.timeValue).toBeTruthy();
      expect(component.timeValue!.getHours()).toBe(23);
      expect(component.timeValue!.getMinutes()).toBe(30);
    }));

    it('should clamp negative hours to 0', fakeAsync(() => {
      inputEl.value = '-1:30';
      inputEl.dispatchEvent(new Event('input'));
      tick();
      fixture.detectChanges();

      expect(component.timeValue).toBeTruthy();
      expect(component.timeValue!.getHours()).toBe(0);
      expect(component.timeValue!.getMinutes()).toBe(30);
    }));

    it('should clamp minutes > 59 to 59', fakeAsync(() => {
      inputEl.value = '10:65';
      inputEl.dispatchEvent(new Event('input'));
      tick();
      fixture.detectChanges();

      expect(component.timeValue).toBeTruthy();
      expect(component.timeValue!.getHours()).toBe(10);
      expect(component.timeValue!.getMinutes()).toBe(59);
    }));

    it('should clamp negative minutes to 0', fakeAsync(() => {
      inputEl.value = '10:-5';
      inputEl.dispatchEvent(new Event('input'));
      tick();
      fixture.detectChanges();

      expect(component.timeValue).toBeTruthy();
      expect(component.timeValue!.getHours()).toBe(10);
      expect(component.timeValue!.getMinutes()).toBe(0);
    }));

    it('should handle hour 24 by clamping to 23', fakeAsync(() => {
      inputEl.value = '24:00';
      inputEl.dispatchEvent(new Event('input'));
      tick();
      fixture.detectChanges();

      expect(component.timeValue).toBeTruthy();
      expect(component.timeValue!.getHours()).toBe(23);
    }));
  });
});
