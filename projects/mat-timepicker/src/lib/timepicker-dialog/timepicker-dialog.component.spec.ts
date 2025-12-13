import {
  ComponentFixture,
  TestBed,
  waitForAsync,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTimepickerComponentDialogComponent } from './timepicker-dialog.component';
import { ClockComponent } from '../clock/clock.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

describe('MatTimepickerDialogComponent', () => {
  let component: MatTimepickerComponentDialogComponent;
  let fixture: ComponentFixture<MatTimepickerComponentDialogComponent>;
  let testDate: Date;

  beforeEach(waitForAsync(() => {
    testDate = new Date(2025, 0, 1, 14, 30, 0);

    TestBed.configureTestingModule({
      imports: [MatTimepickerComponentDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            mode: '24h',
            value: testDate,
            okLabel: 'Ok',
            cancelLabel: 'Cancel',
            anteMeridiemAbbreviation: 'am',
            postMeridiemAbbreviation: 'pm',
            color: 'primary',
            isPm: false,
            minDate: null,
            maxDate: null,
            allowed12HourMap: null,
            allowed24HourMap: null,
            okButtonTemplate: null,
            cancelButtonTemplate: null,
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatTimepickerComponentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with provided data', () => {
    expect(component.mode).toBe('24h');
    expect(component.okLabel).toBe('Ok');
    expect(component.cancelLabel).toBe('Cancel');
    expect(component.color).toBe('primary');
  });

  it('should initialize with hours view', () => {
    expect(component.viewType).toBe('hours');
  });

  it('should set hours and minutes from value', () => {
    expect(component.hours).toBe(14);
    expect(component.minutes).toBe(30);
  });

  it('should format hours for 24h mode', () => {
    component.mode = '24h';
    component.hours = 14;
    expect(component.formattedHours).toBe(14);
  });

  it('should format hours for 12h mode', () => {
    component.data.mode = '12h';
    component.bindData(component.data);
    component.hours = 14;
    expect(component.formattedHours).toBe(2);
  });

  describe('clock interaction', () => {
    it('should handle clock change for hours', () => {
      spyOn(component.changeEvent, 'emit');

      component.handleClockChange({ value: 15, type: 'hours' });

      expect(component.hours).toBe(15);
      expect(component.changeEvent.emit).toHaveBeenCalled();
    });

    it('should handle clock change for minutes', () => {
      spyOn(component.changeEvent, 'emit');

      component.handleClockChange({ value: 45, type: 'minutes' });

      expect(component.minutes).toBe(45);
      expect(component.changeEvent.emit).toHaveBeenCalled();
    });

    it('should auto-switch to minutes after selecting hours', fakeAsync(() => {
      component.viewType = 'hours';
      component.skipMinuteAutoSwitch = false;

      const mockEvent = new Event('mouseup');
      component.handleClockChangeDone(mockEvent);

      tick(350); // Wait for auto-switch timeout

      expect(component.viewType).toBe('minutes');
    }));

    it('should not auto-switch when skipMinuteAutoSwitch is true', fakeAsync(() => {
      component.viewType = 'hours';
      component.skipMinuteAutoSwitch = true;

      const mockEvent = new Event('mouseup');
      component.handleClockChangeDone(mockEvent);

      tick(350);

      expect(component.viewType).toBe('hours');
    }));
  });

  describe('view switching', () => {
    it('should switch to hours view when editHours is called', () => {
      component.viewType = 'minutes';
      component.editHours();

      expect(component.viewType).toBe('hours');
    });

    it('should switch to minutes view when editMinutes is called', () => {
      component.viewType = 'hours';
      component.editMinutes();

      expect(component.viewType).toBe('minutes');
    });

    it('should set editHoursClicked flag temporarily', fakeAsync(() => {
      component.editHours();

      expect(component.editHoursClicked).toBe(true);

      tick(10);

      expect(component.editHoursClicked).toBe(false);
    }));
  });

  describe('meridiem (AM/PM) handling', () => {
    beforeEach(() => {
      component.data.mode = '12h';
      component.bindData(component.data);
    });

    it('should set AM correctly', () => {
      component.hours = 14; // 2 PM
      component.setAm();

      expect(component.hours).toBe(2);
      expect(component.isPm).toBe(false);
    });

    it('should set PM correctly', () => {
      component.hours = 10; // 10 AM
      component.setPm();

      expect(component.hours).toBe(22);
      expect(component.isPm).toBe(true);
    });

    it('should handle meridiem change in handleClockChange', () => {
      component.mode = '24h';
      component.hours = 10;

      component.handleClockChange({ value: 14, type: 'hours' });

      expect(component.isPm).toBe(true);
    });

    it('should clear invalid meridiem when switching to minutes', () => {
      component.hasInvalidMeridiem = true;
      component.editMinutes();

      expect(component.hasInvalidMeridiem).toBe(false);
    });

    it('should fix invalid meridiem on OK click', () => {
      spyOn(component.okClickEvent, 'emit');
      component.hasInvalidMeridiem = true;
      component.isPm = false;

      component.okClickHandler();

      expect(component.hasInvalidMeridiem).toBe(false);
      expect(component.okClickEvent.emit).toHaveBeenCalled();
    });
  });

  describe('OK and Cancel handlers', () => {
    it('should emit okClickEvent with value when OK is clicked', () => {
      spyOn(component.okClickEvent, 'emit');

      component.okClickHandler();

      expect(component.okClickEvent.emit).toHaveBeenCalledWith(component.value);
    });

    it('should emit cancelClickEvent when Cancel is clicked', () => {
      spyOn(component.cancelClickEvent, 'emit');

      component.cancelClickHandler();

      expect(component.cancelClickEvent.emit).toHaveBeenCalled();
    });
  });

  describe('invalid selection handling', () => {
    it('should track invalid selection state', () => {
      component.invalidSelectionHandler(true);

      expect(component.invalidSelection).toBe(true);

      component.invalidSelectionHandler(false);

      expect(component.invalidSelection).toBe(false);
    });

    it('should clear auto-switch timeout on unavailable selection', fakeAsync(() => {
      component.viewType = 'hours';
      const mockEvent = new Event('mouseup');
      component.handleClockChangeDone(mockEvent);

      expect(component.autoSwitchID).toBeTruthy();

      component.handleUnavailableSelection();

      tick(350);

      expect(component.viewType).toBe('hours');
    }));
  });

  describe('data binding', () => {
    it('should update component properties when bindData is called', () => {
      const newData = {
        mode: '12h' as const,
        okLabel: 'Confirm',
        cancelLabel: 'Abort',
        color: 'accent',
        anteMeridiemAbbreviation: 'AM',
        postMeridiemAbbreviation: 'PM',
        minDate: new Date(2025, 0, 1, 10, 0, 0),
        maxDate: new Date(2025, 0, 1, 18, 0, 0),
        allowed12HourMap: null,
        allowed24HourMap: null,
        okButtonTemplate: null,
        cancelButtonTemplate: null,
      };

      component.bindData(newData);

      expect(component.mode).toBe('12h');
      expect(component.okLabel).toBe('Confirm');
      expect(component.cancelLabel).toBe('Abort');
      expect(component.color).toBe('accent');
    });

    it('should call bindData on ngDoCheck', () => {
      spyOn(component, 'bindData');

      component.ngDoCheck();

      expect(component.bindData).toHaveBeenCalledWith(component.data);
    });
  });

  describe('value calculations', () => {
    it('should create new Date with selected hours and minutes in 24h mode', () => {
      component.mode = '24h';
      component.hours = 15;
      component.minutes = 45;
      component.handleClockChange({ value: 45, type: 'minutes' });

      const value = component.value;
      expect(value.getHours()).toBe(15);
      expect(value.getMinutes()).toBe(45);
    });

    it('should convert PM hours correctly in 12h mode', () => {
      component.mode = '12h';
      component.hours = 2; // 2 PM
      component.isPm = true;
      component.minutes = 30;
      component.handleClockChange({ value: 30, type: 'minutes' });

      const value = component.value;
      expect(value.getHours()).toBe(14); // 2 PM = 14:00
    });

    it('should convert AM hours correctly in 12h mode', () => {
      component.mode = '12h';
      component.hours = 10; // 10 AM
      component.isPm = false;
      component.minutes = 15;
      component.handleClockChange({ value: 15, type: 'minutes' });

      const value = component.value;
      expect(value.getHours()).toBe(10);
    });

    it('should handle midnight (12 AM) correctly', () => {
      component.mode = '12h';
      component.hours = 12;
      component.isPm = false; // 12 AM
      component.minutes = 0;
      component.handleClockChange({ value: 0, type: 'minutes' });

      const value = component.value;
      expect(value.getHours()).toBe(0); // Midnight
    });

    it('should handle noon (12 PM) correctly', () => {
      component.mode = '12h';
      component.hours = 12;
      component.isPm = true; // 12 PM
      component.minutes = 0;
      component.handleClockChange({ value: 0, type: 'minutes' });

      const value = component.value;
      expect(value.getHours()).toBe(12); // Noon
    });
  });

  describe('initial value handling', () => {
    it('should use provided value if available', () => {
      const specificDate = new Date(2025, 5, 15, 10, 25, 0);
      component.value = specificDate;

      expect(component.hours).toBe(10);
      expect(component.minutes).toBe(25);
    });

    it('should use minDate if no value provided', () => {
      component.data.value = null;
      component.data.minDate = new Date(2025, 0, 1, 8, 0, 0);
      component.bindData(component.data);
      component.value = component.data.value;

      expect(component.hours).toBe(8);
      expect(component.minutes).toBe(0);
    });

    it('should use maxDate if no value or minDate provided', () => {
      component.data.value = null;
      component.data.minDate = null;
      component.data.maxDate = new Date(2025, 0, 1, 20, 30, 0);
      component.bindData(component.data);
      component.value = component.data.value;

      expect(component.hours).toBe(20);
      expect(component.minutes).toBe(30);
    });

    it('should create new Date if no value, minDate, or maxDate', () => {
      component.data.value = null;
      component.data.minDate = null;
      component.data.maxDate = null;
      component.bindData(component.data);
      component.value = component.data.value;

      const now = new Date();
      expect(component.value).toBeDefined();
      expect(component.value.getFullYear()).toBe(now.getFullYear());
    });
  });
});
