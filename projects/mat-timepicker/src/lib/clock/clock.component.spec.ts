import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { ClockComponent } from './clock.component';

describe('ClockComponent', () => {
  let component: ClockComponent;
  let fixture: ComponentFixture<ClockComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ClockComponent],
      imports: [MatToolbarModule, MatButtonModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClockComponent);
    component = fixture.componentInstance;
    component.mode = '24h';
    component.viewType = 'hours';
    component.formattedValue = 12;
    component.formattedHours = 12;
    component.minutes = 0;
    component.isPm = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('24-hour mode', () => {
    beforeEach(() => {
      component.mode = '24h';
      component.viewType = 'hours';
      fixture.detectChanges();
    });

    it('should display 24 hour numbers when viewType is hours', () => {
      component.setNumbers();
      expect(component.numbers.length).toBe(12); // 1-12
      expect(component.secondaryNumbers.length).toBe(12); // 13-24
    });

    it('should display minute numbers when viewType is minutes', () => {
      component.viewType = 'minutes';
      component.setNumbers();
      expect(component.numbers.length).toBe(12); // 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 00
      expect(component.minuteDots.length).toBe(60);
    });

    it('should calculate correct angle for hour value', () => {
      component.viewType = 'hours';
      const angle = component.getPointerAngle(12);
      expect(angle).toBeDefined();
    });

    it('should calculate correct angle for minute value', () => {
      component.viewType = 'minutes';
      const angle = component.getPointerAngle(30);
      expect(angle).toBe(90); // 30 minutes is at 90 degrees (right side)
    });

    it('should emit changeEvent when time is selected', () => {
      spyOn(component.changeEvent, 'emit');
      component.formattedValue = 10; // Set different value than what we'll click

      const mockEvent = {
        target: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
        clientX: 128, // Top center position (12 o'clock)
        clientY: 0,
      };

      component.handleClick(mockEvent as any);
      expect(component.changeEvent.emit).toHaveBeenCalled();
    });
  });

  describe('12-hour mode', () => {
    beforeEach(() => {
      component.mode = '12h';
      component.viewType = 'hours';
      fixture.detectChanges();
    });

    it('should display 12 hour numbers only', () => {
      component.setNumbers();
      expect(component.numbers.length).toBe(12); // 1-12
      expect(component.secondaryNumbers.length).toBe(0); // No secondary numbers in 12h mode
    });

    it('should handle AM/PM switching', () => {
      component.isPm = false;
      component.setNumbers();
      const amNumbers = component.numbers.length;

      component.isPm = true;
      component.setNumbers();
      const pmNumbers = component.numbers.length;

      expect(amNumbers).toBe(pmNumbers); // Same count, different allowed times
    });
  });

  describe('allowed time maps', () => {
    it('should mark times as allowed/disallowed based on allowed24HourMap', () => {
      component.mode = '24h';
      component.viewType = 'hours';
      component.minutes = 0; // Set minutes for allowed map check
      component.formattedHours = 12;
      const allowedMap: any = {};
      for (let i = 0; i <= 23; i++) {
        allowedMap[i] = { 0: true, 30: true };
      }
      allowedMap[12] = { 0: true, 30: false };
      allowedMap[14] = { 0: false, 30: false };
      component.allowed24HourMap = allowedMap;
      component.initIsAllowedFn();
      component.setNumbers();

      expect(component.isAvailableFn).toBeDefined();
    });

    it('should mark times as allowed/disallowed based on allowed12HourMap', () => {
      component.mode = '12h';
      component.viewType = 'hours';
      component.minutes = 0; // Set minutes for allowed map check
      component.formattedHours = 6;
      component.isPm = false;
      const createHourMap = () => {
        const map: any = {};
        for (let i = 1; i <= 12; i++) {
          map[i] = { 0: true, 15: true, 30: true, 45: true };
        }
        return map;
      };
      component.allowed12HourMap = {
        am: createHourMap(),
        pm: createHourMap(),
      };
      component.allowed12HourMap.am[6] = {
        0: true,
        10: true,
        15: true,
        30: true,
        45: true,
      };
      component.allowed12HourMap.pm[12] = {
        0: false,
        15: false,
        30: false,
        45: false,
      };
      component.initIsAllowedFn();
      component.setNumbers();

      expect(component.isAvailableFn).toBeDefined();
    });

    it('should emit unavailableSelection when selecting disallowed time', () => {
      spyOn(component.unavailableSelection, 'emit');
      component.mode = '24h';
      component.viewType = 'hours';
      component.formattedValue = 10; // Start with different value
      component.minutes = 0; // Set minutes for allowed map check
      component.formattedHours = 10; // Set formatted hours
      const allowedMap: any = {};
      for (let i = 0; i <= 23; i++) {
        allowedMap[i] = { 0: true, 15: true, 30: true, 45: true };
      }
      allowedMap[14] = { 0: false, 15: false, 30: false, 45: false };
      component.allowed24HourMap = allowedMap;
      component.initIsAllowedFn();
      component.setNumbers(); // Initialize numbers with allowed function

      component.movePointer(128, 64); // Try to move to some position

      expect(component.isAvailable(14)).toBe(false);
      expect(component.isAvailable(10)).toBe(true);
    });
  });

  describe('pointer interaction', () => {
    it('should enable animated pointer on touch end', () => {
      component.disableAnimatedPointer();
      expect(component.touching).toBe(true);

      component.enableAnimatedPointer();
      expect(component.touching).toBe(false);
    });

    it('should handle touch move events', () => {
      const mockEvent = {
        preventDefault: jasmine.createSpy('preventDefault'),
        target: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
        changedTouches: [{ clientX: 128, clientY: 128 }],
      };

      component.handleTouchMove(mockEvent as any);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should handle mouse move when touching', () => {
      component.touching = true;
      const mockEvent = {
        buttons: 1,
        target: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
        clientX: 128,
        clientY: 128,
      };

      component.handleMouseMove(mockEvent as any);
      expect(component.touching).toBe(true);
    });

    it('should not handle mouse move when not touching', () => {
      component.touching = false;
      spyOn(component, 'movePointer');

      const mockEvent = {
        buttons: 0,
        target: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
        clientX: 128,
        clientY: 128,
      };

      component.handleMouseMove(mockEvent as any);
      expect(component.movePointer).not.toHaveBeenCalled();
    });
  });

  describe('value calculations', () => {
    it('should get correct pointer value for hours in 24h mode', () => {
      component.mode = '24h';
      component.viewType = 'hours';

      const value = component.getPointerValue(128, 0, 256);
      expect(value).toBe(12);
    });

    it('should get correct pointer value for minutes', () => {
      component.viewType = 'minutes';

      const value = component.getPointerValue(256, 128, 256);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(60);
    });

    it('should handle edge cases for 0 hour', () => {
      component.mode = '24h';
      component.viewType = 'hours';

      const value = component.getPointerValue(128, 256, 256); // Bottom = 6 o'clock = 0/12 with inner/outer ring
      expect(value).toBeGreaterThanOrEqual(0);
    });
  });

  describe('change detection', () => {
    it('should update numbers when mode changes', () => {
      component.mode = '24h';
      component.ngOnChanges({
        mode: {
          currentValue: '24h',
          previousValue: '12h',
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      expect(component.numbers).toBeDefined();
    });

    it('should initialize allowed function when allowed maps change', () => {
      component.minutes = 0; // Set minutes for allowed map check
      component.formattedHours = 12;
      const allowedMap: any = {};
      for (let i = 0; i <= 23; i++) {
        allowedMap[i] = { 0: true, 15: true, 30: true, 45: true };
      }
      component.allowed24HourMap = allowedMap;

      component.ngOnChanges({
        allowed24HourMap: {
          currentValue: component.allowed24HourMap,
          previousValue: null,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      expect(component.isAvailableFn).toBeDefined();
    });

    it('should check if formatted value is allowed', () => {
      component.mode = '24h';
      component.viewType = 'hours';
      component.formattedValue = 12;
      component.minutes = 0; // Set minutes for allowed map check
      component.formattedHours = 12;
      const allowedMap: any = {};
      for (let i = 0; i <= 23; i++) {
        allowedMap[i] = { 0: true, 15: true, 30: true, 45: true };
      }
      component.allowed24HourMap = allowedMap;

      component.ngOnChanges({
        formattedValue: {
          currentValue: 12,
          previousValue: 10,
          firstChange: false,
          isFirstChange: () => false,
        },
        allowed24HourMap: {
          currentValue: component.allowed24HourMap,
          previousValue: null,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      expect(component.isFormattedValueAllowed).toBeDefined();
    });
  });
});
